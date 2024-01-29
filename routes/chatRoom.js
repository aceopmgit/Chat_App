const express = require("express");

const chatController = require("../controllers/chatRoom");
const userAuthenticate = require('../controllers/Authenticate')

const router = express.Router();

router.get("/enterChatRoom", chatController.chatRoom);

router.post('/addChat', userAuthenticate.authenticate, chatController.addChat);

router.get('/showUsers', userAuthenticate.authenticate, chatController.showUsers);

router.get('/getChats', userAuthenticate.authenticate, chatController.getChats);

module.exports = router;
