const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.create = async (req, res, next) => {
    if (!req.body?.hoTen || !req.body?.tenTaiKhoan) {
        return next(
            new ApiError(400, "Ho ten hoac ten tai khoan khong duoc trong"),
        );
    }

    try {
        const docGia = new DocGiaService(MongoDB.client);

        const existedUser = await docGia.findByUsername(req.body.tenTaiKhoan);
        if (existedUser) {
            return next(new ApiError(400, "Ten tai khoan da ton tai"));
        }

        const document = await docGia.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Loi khi tao doc gia moi"));
    }
};

exports.login = async (req, res, next) => {
    const { tenTaiKhoan, matKhau } = req.body;

    // Kiểm tra xem người dùng có truyền đủ name và pass không
    if (!tenTaiKhoan || !matKhau) {
        return next(new ApiError(400, "Thiếu tên tài khoản hoặc mật khẩu"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        
        // 1. Tìm độc giả theo tên tài khoản
        const docGia = await docGiaService.findByUsername(tenTaiKhoan);
        if (!docGia) {
            return next(new ApiError(401, "Tên tài khoản hoặc mật khẩu không chính xác"));
        }

        // 2. So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(matKhau, docGia.matKhau);
        if (!isPasswordValid) {
            return next(new ApiError(401, "Tên tài khoản hoặc mật khẩu không chính xác"));
        }

        // 3. Tạo Token (thêm thông tin role: "docgia" để sau này phân biệt với nhân viên)
        const secretKey = "thien_dep_trai"; // Nên giữ giống secretKey bên nhân viên
        const token = jwt.sign(
            { id: docGia._id, tenTaiKhoan: docGia.tenTaiKhoan, role: "docgia" },
            secretKey,
            { expiresIn: "24h" }
        );

        // 4. Trả về token và thông tin cơ bản
        return res.send({
            message: "Đăng nhập thành công",
            token: token,
            docGia: {
                _id: docGia._id,
                maDocGia: docGia.maDocGia,
                hoTen: docGia.hoTen,
                tenTaiKhoan: docGia.tenTaiKhoan
            }
        });

    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Lỗi trong quá trình đăng nhập"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const docGia = new DocGiaService(MongoDB.client);
        const name = req.query.name;
        const username = req.query.username;
        if (name) {
            documents = await docGia.findByName(name);
            if (documents.length === 0) {
                return res.send({ message: "Khong tim thay doc gia nay" });
            }
        } else if (username) {
            const user = await docGia.findByUsername(username);
            if (!user) {
                return res.send({ message: "Khong tim thay doc gia nay" });
            }
            documents = [user];
        } else {
            documents = await docGia.find({});
        }
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Loi findAll"));
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const docGia = new DocGiaService(MongoDB.client);
        const document = await docGia.findById(req.params.id);
        if (!document) {
            return res.send({
                message: `Khong tim thay nguoi dung voi id=${req.params.id}`,
            });
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Loi khi findOne"));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, 'Can co noi dung cap nhat'))
    }
    try {
        const docGia = new DocGiaService(MongoDB.client);
        const document = await docGia.update(req.params.id, req.body);
        return res.send({ message: "Cap nhat thanh cong" });
    } catch (error) {
        return next(new ApiError(500, "Loi khi update"));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const docGia = new DocGiaService(MongoDB.client);
        const result = await docGia.delete(req.params.id);
        if (result) {
            return res.send({
                message: `Xoa thanh cong doc gia id=${req.params.id}`,
            });
        } else {
            return res.send({
                message: `Khong tim thay doc gia id=${req.params.id}`,
            });
        }
    } catch (error) {
        return next(new ApiError(500, "Loi khi delete"));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const docGia = new DocGiaService(MongoDB.client);
        const deletedCount = await docGia.deleteAll();
        return res.send({ message: `Da xoa ${deletedCount} doc gia` });
    } catch (error) {
        return next(new ApiError(500, "Loi khi deleteAll doc gia"));
    }
};
