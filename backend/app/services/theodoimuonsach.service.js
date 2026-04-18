const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
    constructor(client) {
        this.TheoDoiMuonSach = client.db().collection("TheoDoiMuonSach");
        this.Sach = client.db().collection("Sach");
    }

    // ================== HÀNH ĐỘNG CỦA ĐỘC GIẢ ==================

    // 1. ĐỘC GIẢ gửi yêu cầu mượn
    async yeuCauMuonSach(payload) {
        const { maDocGia, maSach } = payload;
        // BLOCK: KHÓA MƯỢN NẾU ĐANG CÓ SÁCH TRỄ HẠN
        const now = new Date();
        const quaHan = await this.TheoDoiMuonSach.findOne({
            maDocGia: maDocGia,
            trangThai: { $in: [1, 3] }, // Đang mượn hoặc chờ nhận lại (chưa trả xong)
            hanTra: { $lt: now }
        });
        if (quaHan) throw new Error("Thẻ độc giả đang bị tạm khóa do có sách chưa trả đã quá hạn. Vui lòng thanh toán trễ hạn trước!");

        const sach = await this.Sach.findOne({ maSach: maSach });

        if (!sach) throw new Error("Không tìm thấy sách");
        if (sach.soQuyen <= 0) throw new Error("Sách này đã tạm hết");

        // Tạo phiếu tạm (trangThai = 0: Chờ duyệt mượn)
        const phieuMuon = {
            maDocGia: maDocGia,
            maSach: maSach,
            hanTra: payload.ngayHenTraDuKien ? new Date(payload.ngayHenTraDuKien) : null, // Lưu ngày hẹn trả độc giả chọn
            msnv: null, // Chưa gán nhân viên duyệt
            ngayTao: new Date(),
            ngayMuon: null,
            
            ngayTra: null,
            trangThai: 0 
        };

        const result = await this.TheoDoiMuonSach.insertOne(phieuMuon);

        // TRỪ TẠM 1 quyển để "giữ chỗ" cho người này, phòng người khác đặt trùng
        if (result.insertedId) {
            await this.Sach.findOneAndUpdate({ maSach: maSach }, { $inc: { soQuyen: -1 } });
        }
        return result;
    }

    // 2. ĐỘC GIẢ gửi yêu cầu trả sách
    async yeuCauTraSach(idTheoDoi) {
        const filter = {
            _id: ObjectId.isValid(idTheoDoi) ? new ObjectId(idTheoDoi) : null,
            trangThai: 1 // Chỉ gửi yêu cầu trả cho phiếu Đang Mượn
        };
        const result = await this.TheoDoiMuonSach.findOneAndUpdate(
            filter,
            { $set: { trangThai: 3 } }, // <--- Đổi sang 3: CHỜ DUYỆT TRẢ
            { returnDocument: "after" }
        );
        if (!result) throw new Error("Không tìm thấy phiếu mượn hợp lệ");
        return result;
    }

    // ================== HÀNH ĐỘNG CỦA NHÂN VIÊN (ADMIN) ==================

    // 3. NHÂN VIÊN phê duyệt cho mượn (Hoặc từ chối)
    async duyetMuonSach(idTheoDoi, msnv, isDuyet, hanTraChinhThuc) {
        const filter = {
            _id: ObjectId.isValid(idTheoDoi) ? new ObjectId(idTheoDoi) : null,
            trangThai: 0 // Chỉ duyệt phiếu đang Chờ duyệt mượn
        };

        if (isDuyet) {
            const ngayMuon = new Date();
            let hanTra = hanTraChinhThuc ? new Date(hanTraChinhThuc) : new Date(ngayMuon.getTime() + 7*24*60*60*1000);

            const phieu = await this.TheoDoiMuonSach.findOneAndUpdate(
                filter,
                { $set: { trangThai: 1, msnv: msnv, ngayMuon: ngayMuon, hanTra: hanTra } },
                { returnDocument: "after" }
            );
            if (!phieu) throw new Error("Phiếu mượn không tồn tại hoặc đã được xử lý");
            return phieu;
        } else {
            const phieu = await this.TheoDoiMuonSach.findOneAndUpdate(
                filter,
                { $set: { trangThai: 2, msnv: msnv } } // 2: TỪ CHỐI
            );
            if (phieu) {
                // Do lúc nãy có trừ dự phòng 1 quyển, giờ từ chối thì phải cộng TRẢ LẠI KHO
                await this.Sach.findOneAndUpdate({ maSach: phieu.maSach }, { $inc: { soQuyen: 1 } });
            }
            return phieu;
        }
    }

    // 4. NHÂN VIÊN thu nhận lại sách (Duyệt trả)
    async duyetTraSach(idTheoDoi, msnv_nhan) {
        const filter = {
            _id: ObjectId.isValid(idTheoDoi) ? new ObjectId(idTheoDoi) : null,
            trangThai: 3 // Chỉ xử lý phiếu Chờ trả
        };

        const ngayTra = new Date();
        const phieuCapNhat = await this.TheoDoiMuonSach.findOneAndUpdate(
            filter,
            { $set: { trangThai: 4, ngayTra: ngayTra, msnv_nhanlai: msnv_nhan } }, // 4: ĐÃ TRẢ
            { returnDocument: "after" }
        );

        if (phieuCapNhat) {
            // Cộng lại sách vào kho cho người khác mượn
            await this.Sach.findOneAndUpdate({ maSach: phieuCapNhat.maSach }, { $inc: { soQuyen: 1 } });

            // Trả về logic phạt nếu nộp trễ hẹn giống như cũ
            const hanTra = new Date(phieuCapNhat.hanTra);
            let soNgayTre = 0;
            if (ngayTra > hanTra) {
                const diffTime = Math.abs(ngayTra - hanTra);
                soNgayTre = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            }
            return { phieu: phieuCapNhat, treHan: soNgayTre > 0, soNgayTre: soNgayTre };
        }
        throw new Error("Không thể xử lý trả sách");
    }

    
    // 5. GIA HẠN NHANH TỪ ADMIN
    async giaHanSach(idTheoDoi, hanTraMoi) {
        const filter = {
            _id: ObjectId.isValid(idTheoDoi) ? new ObjectId(idTheoDoi) : null,
            trangThai: 1 // Chỉ phiếu đang mượn mới gia hạn được
        };
        const result = await this.TheoDoiMuonSach.findOneAndUpdate(
            filter,
            { $set: { hanTra: new Date(hanTraMoi) } },
            { returnDocument: "after" }
        );
        if (!result) throw new Error("Không tìm thấy phiếu đang mượn hợp lệ");
        return result;
    }

    async find(filter) {
        const pipeline = [
            { $match: filter },
            { $lookup: { from: "Sach", localField: "maSach", foreignField: "maSach", as: "sach" } },
            { $lookup: { from: "DocGia", localField: "maDocGia", foreignField: "maDocGia", as: "docGia" } },
            { $unwind: { path: "$sach", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$docGia", preserveNullAndEmptyArrays: true } },
            { $addFields: { 
                tenSach: "$sach.tenSach", 
                tenDocGia: "$docGia.hoTen" 
            } },
            { $project: { sach: 0, docGia: 0 } }
        ];
        const cursor = await this.TheoDoiMuonSach.aggregate(pipeline);
        return await cursor.toArray();
    }
}
module.exports = TheoDoiMuonSachService;