const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.tenSach) {
        return next(new ApiError(400, "Ten sach khong duoc de rong"));
    }

    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Da xay ra loi khi tao sach"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const sachService = new SachService(MongoDB.client);
        const { name } = req.query;

        if (name) {
            documents = await sachService.findByName(name);
        } else {
            documents = await sachService.find();
        }
        if (!documents) {
            return res.send({ message: "Khong tim thay sach" });
        }
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "Da xay ra loi trong luc tim kiem tat ca"),
        );
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.findById(req.params.id);
        if (!document) {
            return res.send({ message: "Khong tim thay sach" });
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Loi khi findOne sach"));
    }
};

exports.update = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const document = await sachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, 'Khong tim thay sach (update)'))
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Loi khi cap nhat sach co id=${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const result = await sachService.delete(req.params.id);
        if (!result) {
            return next(new ApiError(404, 'Khong tim thay sach (delete)'));
        }
        return res.send({ message: 'Xoa thanh cong' });
    } catch (error) {
        return next(new ApiError(500, `Loi khi xoa sach co id=${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const deletedCount = await sachService.deleteAll()
        return res.send({ message: `Da xoa ${deletedCount} sach`})
    } catch (error) {
        return next(new ApiError(500, 'Loi khi xoa tat ca sach'));
    }
};