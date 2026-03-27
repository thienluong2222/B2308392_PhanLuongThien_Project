const { ObjectId } = require("mongodb");

class NhaXuatBanService {
    constructor(client) {
        this.NhaXuatBan = client.db().collection("NhaXuatBan");
    }

    extractNXBData(payload) {
        const nxb = {
            maNXB: payload.maNXB,
            tenNXB: payload.tenNXB,
            diaChi: payload.diaChi,
        };

        Object.keys(nxb).forEach(
            (key) => nxb[key] === undefined && delete nxb[key],
        );
        return nxb;
    }

    async create(payload) {
        const nxb = this.extractNXBData(payload);
        const result = await this.NhaXuatBan.findOneAndUpdate(
            { maNXB: nxb.maNXB },
            { $set: nxb },
            { returnDocument: "after", upsert: true },
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.NhaXuatBan.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            tenNXB: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findById(id) {
        return await this.NhaXuatBan.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractNXBData(payload);
        const result = await this.NhaXuatBan.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" },
        );
        return result;
    }

    async delete(id) {
        const result = await this.NhaXuatBan.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.NhaXuatBan.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhaXuatBanService;
