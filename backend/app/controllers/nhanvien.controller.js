const NhanVienService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Thêm nhân viên mới (Đăng ký)
exports.create = async (req, res, next) => {
    if (!req.body?.HoTenNV || !req.body?.MSNV || !req.body?.Password) {
        return next(new ApiError(400, "Mã số, Họ tên và Mật khẩu không được để trống"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        
        // Kiểm tra xem MSNV đã tồn tại chưa
        const existedNV = await nhanVienService.findByMSNV(req.body.MSNV);
        if (existedNV) {
            return next(new ApiError(400, "Mã số nhân viên đã tồn tại trong hệ thống"));
        }

        const document = await nhanVienService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.log(error); // In lỗi ra terminal để dễ gỡ rối
        return next(new ApiError(500, "Lỗi khi tạo nhân viên mới"));
    }
};

// API ĐĂNG NHẬP
exports.login = async (req, res, next) => {
    const { MSNV, Password } = req.body;

    if (!MSNV || !Password) {
        return next(new ApiError(400, "Thiếu Mã số nhân viên hoặc Mật khẩu"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        
        // 1. Tìm nhân viên theo MSNV
        const nhanVien = await nhanVienService.findByMSNV(MSNV);
        if (!nhanVien) {
            // Nên dùng chung 1 câu thông báo để bảo mật, tránh việc kẻ gian biết MSNV có tồn tại hay không
            return next(new ApiError(401, "Mã số nhân viên hoặc mật khẩu không chính xác"));
        }

        // 2. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong Database
        const isPasswordValid = await bcrypt.compare(Password, nhanVien.Password);
        if (!isPasswordValid) {
            return next(new ApiError(401, "Mã số nhân viên hoặc mật khẩu không chính xác"));
        }

        // 3. Mật khẩu đúng -> Tạo JSON Web Token (JWT)
        const secretKey = "thien_dep_trai"; // (Thực tế nên lưu chuỗi này trong file .env ẩn đi)
        const token = jwt.sign(
            { id: nhanVien._id, MSNV: nhanVien.MSNV, ChucVu: nhanVien.ChucVu },
            secretKey,
            { expiresIn: "24h" } // Token có giá trị trong 24 giờ
        );

        // Trả về thông tin và Token cho client
        return res.send({
            message: "Đăng nhập thành công",
            token: token,
            nhanVien: {
                MSNV: nhanVien.MSNV,
                HoTenNV: nhanVien.HoTenNV,
                ChucVu: nhanVien.ChucVu
            }
        });

    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Lỗi trong quá trình đăng nhập"));
    }
};

// Các hàm lấy danh sách, gọi một nhân viên, sửa, xóa
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await nhanVienService.findByName(name);
        } else {
            documents = await nhanVienService.find({});
        }
        if (documents.length === 0) {
            return res.send({ message: "Không tìm thấy nhân viên nào" });
        }
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi findAll nhân viên"));
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.findById(req.params.id);
        if (!document) {
            return res.send({ message: `Không tìm thấy nhân viên với id=${req.params.id}` });
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Lỗi findOne nhân viên"));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, 'Dữ liệu cập nhật không được rỗng'));
    }
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.update(req.params.id, req.body);
        return res.send({ message: "Cập nhật thành công" });
    } catch (error) {
        return next(new ApiError(500, "Lỗi update nhân viên"));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const result = await nhanVienService.delete(req.params.id);
        if (result) return res.send({ message: "Xóa nhân viên thành công" });
        return res.send({ message: "Không tìm thấy nhân viên để xóa" });
    } catch (error) {
        return next(new ApiError(500, "Lỗi delete nhân viên"));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const deletedCount = await nhanVienService.deleteAll();
        return res.send({ message: `Đã xóa ${deletedCount} nhân viên` });
    } catch (error) {
        return next(new ApiError(500, "Lỗi deleteAll nhân viên"));
    }
};