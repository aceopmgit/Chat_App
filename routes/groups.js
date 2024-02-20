const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groups');
const userAuthenticate = require('../controllers/authenticate')

router.post('/createGroup', userAuthenticate.authenticate, groupController.createGroup);

router.get('/getGroups', userAuthenticate.authenticate, groupController.getGroups);

router.get('/showUsersOfGroup', userAuthenticate.authenticate, groupController.showUsersOfGroup);

router.get('/showUsersForRemoving', userAuthenticate.authenticate, groupController.showUsersForRemoving);

router.post('/removeUsers', userAuthenticate.authenticate, groupController.removeUsers);

router.get('/showUsersForAdding', userAuthenticate.authenticate, groupController.showUsersForAdding);

router.post('/addUsers', userAuthenticate.authenticate, groupController.addUsers);

router.get('/checkAdmin', userAuthenticate.authenticate, groupController.checkAdmin);

router.get('/checkOwner', userAuthenticate.authenticate, groupController.checkOwner);

router.delete('/leaveGroup', userAuthenticate.authenticate, groupController.leaveGroup)

router.delete('/deleteGroup', userAuthenticate.authenticate, groupController.deleteGroup)

router.get('/checkGroupStatus', userAuthenticate.authenticate, groupController.checkGroupStatus);

router.get('/getGroupAdmins', userAuthenticate.authenticate, groupController.getGroupAdmins);









module.exports = router;