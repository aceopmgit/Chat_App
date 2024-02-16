const user = require('../models/user.js');
const groups = require('../models/group.js');
const sequelize = require('../util/database.js');
const { Op } = require("sequelize");
const admin = require('../models/admin.js');

exports.getUsers = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        // console.log('++++++++++++++++++++++++++++++++++++', groupid)
        const admins = await admin.findAll({ where: { groupId: groupid }, attributes: ['userId'] });
        // console.log('++++++++++++++++++++++++++++++++++++', admins[0].userId)

        const a = []
        for (i of admins) {
            a.push(i.userId);
        }

        const data = await groups.findAll({ include: [{ model: user, attributes: ['id', 'Name'] }], where: { id: groupid }, attributes: ['Name'] });
        //console.log('++++++++++++++++++++++++++++++++++++', data);

        const b = [];
        if (data.length > 0) {
            for (let i of data[0].users) {
                b.push(i);
            }

        }
        let users = b.filter(num => !a.includes(num.id));
        //console.log('+++++++++++++++++++++++++++++++++++++++++++', a, b, users);
        res.status(200).json(users);


    } catch (err) {
        console.log(err)

        res.status(500).json({
            Error: err,
        });
    }
}
exports.addAdmin = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const groupid = req.query.groupId;
        const users = req.body.users;
        users.forEach(async (i) => {
            await admin.create({
                groupId: groupid,
                userId: i
            }, { transaction: t })

            await t.commit();
        });


        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        await t.rollback()
        res.status(500).json({
            Error: err,
        });
    }


}