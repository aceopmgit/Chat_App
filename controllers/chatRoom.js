const path = require("path");

const chats = require('../models/chats')
const users = require('../models/user.js')
const groups = require('../models/group.js')
const groupUser = require('../models/groupUser.js')
const sequelize = require('../util/database.js');
const { Op } = require("sequelize");
const { group } = require("console");
const AWS = require('aws-sdk');
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

exports.chatRoom = (req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "views", "chatRoom.html"));
};

function uploadToS3(type, data, fileName) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })


    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read',
        ContentType: type
    }

    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3Response) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                //console.log('success', s3Response);
                resolve(s3Response.Location);
            }
        })
    })
}

exports.addChat = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log('********************************************', req.body)
        const { text } = req.body;
        console.log('+++++++++++++++++++++++++++++++++++++++++++++', req.files)

        let message = req.body.text;
        let files = req.files;
        const groupId = req.query.groupId;

        let data;
        if (files.length === 0) {

            data = await chats.create({
                Chats: message,
                userId: req.user.id,
                userName: req.user.Name,
                groupId: groupId,
                fileStatus: false
            }, { transaction: t });
        }
        else {
            const fileUrls = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const body = require('fs').createReadStream(file.path);
                const fileName = `${file.originalname}_${new Date()}`;
                const ContentType = file.mimetype
                const Url = await uploadToS3(ContentType, body, fileName);
                fileUrls.push({ Url: Url, type: ContentType, name: file.originalname });


                require('fs').unlinkSync(file.path);
            }
            data = await chats.create({
                Chats: message,
                userId: req.user.id,
                userName: req.user.Name,
                groupId: groupId,
                fileStatus: true,
                fileUrl: JSON.stringify(fileUrls),
            }, { transaction: t });


        }
        await t.commit();

        res.status(201).json({ chatDetails: data, });

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
        const groupId = req.query.groupId;


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

        const data = await chats.findAll({ where: { id: { [Op.gt]: chatIndex }, groupId: groupId } });
        res.status(201).json({ chats: data });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }

}

