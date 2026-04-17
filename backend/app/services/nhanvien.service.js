const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class NhanVienService {
    constructor(client) {
        this.NhanVien = client.db().collection("NhanVien");
    }

    extractNhanVienData(payload) {
        const nhanVien = {
            MSNV: payload.MSNV,
            HoTenNV: payload.HoTenNV,
            Password: payload.Password,
            ChucVu: payload.ChucVu,
            DiaChi: payload.DiaChi,
            SoDienThoai: payload.SoDienThoai,
        };

        Object.keys(nhanVien).forEach(
            (key) => nhanVien[key] === undefined && delete nhanVien[key]
        );
        return nhanVien;
    }

    async create(payload) {
        const nhanVien = this.extractNhanVienData(payload);

        if (nhanVien.Password) {
            const saltRounds = 10;
            nhanVien.Password = await bcrypt.hash(nhanVien.Password, saltRounds);
        }

        const result = await this.NhanVien.findOneAndUpdate(
            { MSNV: nhanVien.MSNV },
            { $set: nhanVien },
            { returnDocument: "after", upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.NhanVien.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            HoTenNV: { $regex: new RegExp(name), $options: "i" },
        });
    }

    // Hàm lấy thông tin nhân viên bằng MSNV (Dùng cho Đăng Nhập)
    async findByMSNV(msnv) {
        return await this.NhanVien.findOne({ MSNV: msnv });
    }

    async findById(id) {
        return await this.NhanVien.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractNhanVienData(payload);

        // Mã hóa mật khẩu nếu nhân viên đổi mật khẩu
        if (update.Password) {
            const saltRounds = 10;
            update.Password = await bcrypt.hash(update.Password, saltRounds);
        }

        const result = await this.NhanVien.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.NhanVien.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.NhanVien.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhanVienService;