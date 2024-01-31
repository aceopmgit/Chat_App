const path = require("path");

const chats = require('../models/chats')
const users = require('../models/user.js')
const sequelize = require('../util/database.js');
const { Op } = require("sequelize");

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

        if (isStringInvalid(message)) {
            return res.status(400).json({ status: false, message: 'Bad Parameter. Chat is Misssing !' });
        }

        const data = await chats.create({
            Chats: message,
            userId: req.user.id,
            userName: req.user.Name
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

        const data = await users.findAll({ attributes: ['Name'] });
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

        const chatIndex = Number(req.query.chatIndex) || 0;
        //console.log('*****************************************', chatIndex)

        const data = await chats.findAll({ where: { id: { [Op.gt]: chatIndex } }, attributes: ['id', 'Chats', 'userName'] });
        res.status(201).json({ chats: data });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }

}

