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
        const sach = await this.Sach.findOne({ maSach: maSach });

        if (!sach) throw new Error("Không tìm thấy sách");
        if (sach.soQuyen <= 0) throw new Error("Sách này đã tạm hết");

        // Tạo phiếu tạm (trangThai = 0: Chờ duyệt mượn)
        const phieuMuon = {
            maDocGia: maDocGia,
            maSach: maSach,
            msnv: null, // Chưa gán nhân viên duyệt
            ngayTao: new Date(),
            ngayMuon: null,
            hanTra: null,
            ngayTra: null,
            trangThai: 0 // <--- CHỜ DUYỆT MƯỢN
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
    async duyetMuonSach(idTheoDoi, msnv, isDuyet) {
        const filter = {
            _id: ObjectId.isValid(idTheoDoi) ? new ObjectId(idTheoDoi) : null,
            trangThai: 0 // Chỉ duyệt phiếu đang Chờ duyệt mượn
        };

        if (isDuyet) { // NẾU ĐỒNG Ý
            const ngayMuon = new Date();
            const hanTra = new Date(ngayMuon);
            hanTra.setDate(hanTra.getDate() + 7); // Tính hạn trả 7 ngày

            const phieu = await this.TheoDoiMuonSach.findOneAndUpdate(
                filter,
                { $set: { trangThai: 1, msnv: msnv, ngayMuon: ngayMuon, hanTra: hanTra } },
                { returnDocument: "after" }
            );
            if (!phieu) throw new Error("Phiếu mượn không tồn tại hoặc đã được xử lý");
            return phieu;
        } else { // NẾU TỪ CHỐI
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

    async find(filter) {
        const cursor = await this.TheoDoiMuonSach.find(filter);
        return await cursor.toArray();
    }
}
module.exports = TheoDoiMuonSachService;