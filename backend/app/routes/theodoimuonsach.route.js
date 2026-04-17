const express = require("express");
const theodoi = require("../controllers/theodoimuonsach.controller"); // <-- Nhớ đổi tên file theo lúc bạn tạo

const router = express.Router();

// Route Get danh sách và Độc giả Gửi yêu cầu mượn
router.route("/")
    .get(theodoi.findAll)
    .post(theodoi.yeuCauMuonSach);

// Nhân viên: Xác nhận duyệt/từ chối (truyền ID của Phiếu mượn)
router.route("/:id/duyet-muon")
    .put(theodoi.duyetMuonSach);

// Độc giả: Bấm nút Yêu cầu trả sách trên Website
router.route("/:id/yeu-cau-tra")
    .put(theodoi.yeuCauTraSach);

// Nhân viên: Xác nhận Đã nhận lại sách từ tay người dùng
router.route("/:id/duyet-tra")
    .put(theodoi.duyetTraSach);

module.exports = router;