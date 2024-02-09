const adminController = require("../controllers/admin");
const userAuthenticate = require('../controllers/Authenticate')
const express = require('express');

const router = express.Router();

router.get('/getUsers', userAuthenticate.authenticate, adminController.getUsers);

router.post('/addAdmin', userAuthenticate.authenticate, adminController.addAdmin);

module.exports = router;