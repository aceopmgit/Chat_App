const chats = require('../models/chats')
const user = require('../models/user.js')
const groups = require('../models/group.js')
const groupUser = require('../models/groupUser.js')
const sequelize = require('../util/database.js');
const { Op } = require("sequelize");

function isStringInvalid(string) {
    if (string === undefined || string.length === 0) {
        return true
    }
    else {
        return false
    }
}

exports.createGroup = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const newGroup = await groups.create({
            Name: req.body.name,
            CreatedBy: req.user.Name
        }, { transaction: t });
        console.log('*************************************************************************', newGroup);

        const groupUsers = req.body.users;
        groupUsers.push(req.user.id);

        groupUsers.forEach(async (userId) => {
            await newGroup.addUser(userId, { through: 'groupUser' })
        })

        console.log(newGroup);
        await t.commit();
        res.status(200).json({ details: newGroup });


    } catch (err) {
        await t.rollback()
        console.log(err)

        res.status(500).json({
            Error: err,
        });
    }

}

exports.getGroups = async (req, res, next) => {
    try {
        const userGroups = await user.findAll({ include: groups, where: { id: req.user.id } });

        res.status(200).json(userGroups);
    } catch (err) {
        console.log(err)

        res.status(500).json({
            Error: err,
        });
    }
}