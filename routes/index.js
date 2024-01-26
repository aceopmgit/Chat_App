const express = require("express");

const indexController = require("../controllers/index");

const router = express.Router();

router.get("/index", indexController.index);

module.exports = router;
