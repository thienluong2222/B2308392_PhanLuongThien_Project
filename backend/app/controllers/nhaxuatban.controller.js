const NhaXuatBanService = require("../services/nhaxuatban.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.maNXB) {
        return next(new ApiError(400, "Ma xuat ban khong duoc de trong"));
    }

    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Loi khi tao nha xuat ban moi"));
    }
};

exports.findAll = async (req, res, next) => {
    let document = [];

    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const { name } = req.query;

        if (name) {
            document = await nxbService.findByName(name);
        } else {
            document = await nxbService.find({});
        }
    } catch (error) {
        return next(new ApiError(500, "Loi khi lay danh sach nha xuat ban"));
    }
    if (!document) {
        return res.send({ message: "Khong tim thay nha xuat ban" });
    }
    return res.send(document);
};

exports.findOne = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.findById(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Khong tim thay nha xuat ban"));
        }

        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Loi khi lay nha xuat ban voi id=${req.params.id}`,
            ),
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Du lieu cap nhat khong duoc de trong"));
    }

    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.update(req.params.id, req.body);

        if (!document) {
            return next(new ApiError(404, "Khong tim thay nha xuan ban"));
        }
        return res.send({ message: "Cap nhat thanh cong" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Loi khi cap nhat nha xuat ban voi id=${req.params.id}`,
            ),
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const document = await nxbService.delete(req.params.id);

        if (!document) {
            return next(new ApiError(404, "Khong tim thay nha xuat ban"));
        }
        return res.send({ message: "Xoa thanh cong" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Loi khi xoa nha xuat ban voi id=${req.params.id}`,
            ),
        );
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const nxbService = new NhaXuatBanService(MongoDB.client);
        const deleteCount = await nxbService.deleteAll();
        return res.send({ message: `Da xoa ${deleteCount} nha xuat ban` });
    } catch (error) {
        return next(new ApiError(500, "Loi khi xoa tat ca nha xuat ban"));
    }
};
