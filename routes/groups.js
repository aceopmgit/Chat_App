const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groups');
const userAuthenticate = require('../controllers/Authenticate')

router.post('/createGroup', userAuthenticate.authenticate, groupController.createGroup);

router.get('/getGroups', userAuthenticate.authenticate, groupController.getGroups);

module.exports = router;