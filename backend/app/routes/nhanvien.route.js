const express = require("express");
const nhanviens = require("../controllers/nhanvien.controller");

const router = express.Router();

// Route phụ trách đăng nhập
router.route("/login")
    .post(nhanviens.login);

// Các route CRUD cơ bản
router.route("/")
    .get(nhanviens.findAll)
    .post(nhanviens.create)
    .delete(nhanviens.deleteAll);

router.route("/:id")
    .get(nhanviens.findOne)
    .put(nhanviens.update)
    .delete(nhanviens.delete);

module.exports = router;