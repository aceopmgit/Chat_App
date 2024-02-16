const express = require("express");

const chatController = require("../controllers/chatRoom");
const userAuthenticate = require('../controllers/Authenticate');
const multer = require('multer');

// Multer middleware for handling file uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get("/enterChatRoom", chatController.chatRoom);

router.post('/addChat', userAuthenticate.authenticate, upload.array('files'), chatController.addChat);

router.get('/showUsers', userAuthenticate.authenticate, chatController.showUsers);

router.get('/getChats', userAuthenticate.authenticate, chatController.getChats);

module.exports = router;
