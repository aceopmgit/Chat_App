const path = require("path");

const chats = require('../models/chats')
const users = require('../models/user.js')
const groups = require('../models/group.js')
const groupUser = require('../models/groupUser.js')
const sequelize = require('../util/database.js');
const { Op } = require("sequelize");
const { group } = require("console");

exports.chatRoom = (req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "views", "chatRoom.html"));
};

function isStringInvalid(string) {
    if (string === undefined || string.length === 0) {
        return true
    }
    else {
        return false
    }
}

exports.addChat = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log('********************************************', req.body)
        const { message } = req.body;
        const groupId = Number(req.query.groupId);
        console.log('********************************************', req.body)
        if (isStringInvalid(message)) {
            return res.status(400).json({ status: false, message: 'Bad Parameter. Chat is Misssing !' });
        }

        const data = await chats.create({
            Chats: message,
            userId: req.user.id,
            userName: req.user.Name,
            groupId: groupId
        }, { transaction: t });

        await t.commit();

        res.status(201).json({ chatDetails: data });

    } catch (err) {
        await t.rollback()
        console.log(err)

        res.status(500).json({
            Error: err,
        });
    }

}


exports.showUsers = async (req, res, next) => {
    try {
        const groupId = Number(req.query.groupId);


        const data = await users.findAll({ where: { [Op.not]: [{ id: req.user.id }] }, attributes: ['Name', 'id'] });

        res.status(201).json({ users: data });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }

}

exports.getChats = async (req, res, next) => {
    try {

        const chatIndex = req.query.chatIndex || 0;
        const groupId = req.query.groupId;

        //console.log('*****************************************', req.query.groupId)

        const data = await chats.findAll({ where: { id: { [Op.gt]: chatIndex }, groupId: groupId }, attributes: ['id', 'Chats', 'userName', 'groupId'] });
        res.status(201).json({ chats: data });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }

}

