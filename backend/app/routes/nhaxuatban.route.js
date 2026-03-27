const express = require('express');
const nxb = require('../controllers/nhaxuatban.controller');

const router = express.Router();

router.route('/')
    .post(nxb.create)
    .get(nxb.findAll)
    .delete(nxb.deleteAll);

router.route('/:id')
    .get(nxb.findOne)
    .put(nxb.update)
    .delete(nxb.delete);

module.exports = router;