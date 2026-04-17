const TheoDoiMuonSachService = require("../services/theodoimuonsach.service"); // Lưu ý đổi tên Service cho đúng file mà bạn đã lưu
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// [HÀNH ĐỘNG CỦA ĐỘC GIẢ] - Giao diện Độc giả sẽ gọi 2 API này

// 1. Độc giả Gửi yêu cầu mượn sách
exports.yeuCauMuonSach = async (req, res, next) => {
    if (!req.body?.maDocGia || !req.body?.maSach) {
        return next(new ApiError(400, "Mã độc giả và Mã sách không được để trống"));
    }

    try {
        const theodoiService = new TheoDoiMuonSachService(MongoDB.client);
        const result = await theodoiService.yeuCauMuonSach(req.body);
        return res.send({ message: "Đã gửi yêu cầu mượn sách thành công, chờ nhân viên duyệt", phieuMuonId: result.insertedId });
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
};

// 2. Độc giả Gửi yêu cầu MANG SÁCH RA THƯ VIỆN TRẢ
exports.yeuCauTraSach = async (req, res, next) => {
    try {
        const theodoiService = new TheoDoiMuonSachService(MongoDB.client);
        const result = await theodoiService.yeuCauTraSach(req.params.id);
        return res.send({ message: "Đã gửi yêu cầu trả sách, nhân viên sẽ kiểm tra và xác nhận" });
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
};


// [HÀNH ĐỘNG CỦA NHÂN VIÊN] - Giao diện Admin/Quản lý sẽ gọi 2 API này

// 3. Nhân viên: Duyệt Mượn (Đồng ý/Từ chối)
exports.duyetMuonSach = async (req, res, next) => {
    // isDuyet là cờ quyết định (true: Đồng ý, false: Từ chối)
    if (req.body?.msnv === undefined || req.body?.isDuyet === undefined) {
        return next(new ApiError(400, "Phải cung cấp MSNV và trạng thái (isDuyet: true/false)"));
    }

    try {
        const theodoiService = new TheoDoiMuonSachService(MongoDB.client);
        const result = await theodoiService.duyetMuonSach(
            req.params.id, 
            req.body.msnv, 
            req.body.isDuyet
        );
        
        const message = req.body.isDuyet 
            ? "Đã DUYỆT cho mượn sách thành công" 
            : "Đã TỪ CHỐI phiếu mượn sách này";
            
        return res.send({ message: message });
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
};

// 4. Nhân viên: Nhận lại sách / Duyệt Trả
exports.duyetTraSach = async (req, res, next) => {
    if (!req.body?.msnv) {
        return next(new ApiError(400, "Phải cung cấp MSNV (người nhận lại sách)"));
    }

    try {
        const theodoiService = new TheoDoiMuonSachService(MongoDB.client);
        const result = await theodoiService.duyetTraSach(req.params.id, req.body.msnv);
        
        let message = "Nhận lại sách thành công. Quy trình hoàn tất.";
        if (result.treHan) {
            message += ` LƯU Ý PHẠT: Độc giả đã TRỄ HẠN ${result.soNgayTre} ngày!`;
        }

        return res.send({ message: message, data: result.phieu });
    } catch (error) {
        return next(new ApiError(400, error.message));
    }
};

// 5. XEM DANH SÁCH (Chung)
exports.findAll = async (req, res, next) => {
    try {
        const theodoiService = new TheoDoiMuonSachService(MongoDB.client);
        
        // Lọc theo nhiều tham số (ví dụ: lấy các phiếu trạng thái Chờ duyệt: ?trangThai=0)
        const filter = {};
        if (req.query.maDocGia) filter.maDocGia = req.query.maDocGia;
        if (req.query.maSach) filter.maSach = req.query.maSach;
        if (req.query.trangThai !== undefined) filter.trangThai = parseInt(req.query.trangThai); 
        
        const documents = await theodoiService.find(filter);
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách mượn sách"));
    }
};