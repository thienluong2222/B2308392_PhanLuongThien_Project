const { ObjectId, ReturnDocument } = require('mongodb');
const bcrypt = require('bcrypt');

class DocGiaService {
    constructor(client) {
        this.DocGia= client.db().collection("DocGia");
    }

    extractDocGiaData(payload) {
        const docGia = {
            maDocGia: payload.maDocGia,
            hoTen: payload.hoTen,
            tenTaiKhoan: payload.tenTaiKhoan,
            matKhau: payload.matKhau,
            email: payload.email,
            ngaySinh: payload.ngaySinh,
            gioiTinh: payload.gioiTinh,
            diaChi: payload.diaChi,
            dienThoai: payload.dienThoai,
        };

        Object.keys(docGia).forEach(
            (key) => docGia[key] === undefined && delete docGia[key]
        );
        return docGia;
    }

    async create(payload) {
        const docGia = this.extractDocGiaData(payload);

        if (docGia.matKhau) {
            const saltRounds = 10;
            docGia.matKhau = await bcrypt.hash(docGia.matKhau, saltRounds);
        }

        const result = await this.DocGia.findOneAndUpdate(
            { maDocGia: docGia.maDocGia },
            { $set: docGia },
            { returnDocument: 'after', upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.DocGia.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            $or: [
                { hoTen: { $regex: new RegExp(name), $option: 'i' } },
                { tenTaiKhoan: { $regex: new RegExp(tenTaiKhoan), $option: 'i' } },
            ],
        });
    }

    async findByUsername(tenTaiKhoan) {
        return await this.DocGia.findOne({ tenTaiKhoan });
    }

    async findById(id) {
        return await this.DocGia.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractDocGiaData(payload);

        if(update.matKhau) {
            const saltRounds = 10;
            update.matKhau = await bcrypt.hash(update.matKhau, saltRounds);
        }

        const result = await this.DocGia.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: 'after' }
        );
        return result;
    }

    async delete(id) {
        const result = await this.DocGia.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.DocGia.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = DocGiaService;