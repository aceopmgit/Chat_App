const user = require('../models/user.js');
const groups = require('../models/group.js');
const sequelize = require('../util/database.js');
const { Op } = require("sequelize");
const admin = require('../models/admin.js');
const group = require('../models/group.js');

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
            CreatedById: req.user.id
        }, { transaction: t });
        //console.log('*************************************************************************', newGroup.id);

        const newAdmin = await admin.create({
            groupId: newGroup.id,
            userId: req.user.id
        })
        //console.log('+++++++++++++++++++++++++++++++++++++++++++++++++', newAdmin)

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
        const userGroups = await user.findAll({ include: [{ model: groups, attributes: ['id', 'Name'] }], where: { id: req.user.id }, attributes: ['Name'] });

        res.status(200).json(userGroups);
    } catch (err) {
        console.log(err)

        res.status(500).json({
            Error: err,
        });
    }
}

exports.showUsersOfGroup = async (req, res, next) => {
    try {
        const groupId = req.query.groupId;


        const data = await groups.findAll({ include: [{ model: user, attributes: ['Name'] }], where: { id: groupId }, attributes: ['Name'] });

        res.status(201).json({ users: data });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }

}

exports.showUsersForRemoving = async (req, res, next) => {

    try {
        const groupid = req.query.groupId;
        const group = await groups.findOne({ where: { id: groupid }, attributes: ['CreatedById'] });
        if (group) {
            if (group.CreatedById === req.user.id) {

                const data = await groups.findAll({ include: [{ model: user, attributes: ['Name', 'id'], where: { [Op.not]: [{ id: req.user.id }] } }], where: { id: groupid }, attributes: ['Name'] });
                const users = [];
                if (data.length > 0) {
                    for (let i of data[0].users) {
                        users.push(i)
                    }
                }

                res.status(201).json(users);
            }
            else {
                const admins = await admin.findAll({ where: { groupId: groupid }, attributes: ['userId'] });

                const a = []
                for (i of admins) {
                    a.push(i.userId);
                }

                const data = await groups.findAll({ include: [{ model: user, attributes: ['id', 'Name'] }], where: { id: groupid }, attributes: ['Name'] });

                const b = [];
                if (data.length > 0) {
                    for (let i of data[0].users) {
                        b.push(i);
                    }

                }
                let users = b.filter(num => !a.includes(num.id));
                res.status(201).json(users);
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }

}

exports.removeUsers = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        const users = req.body.users
        const data = await groups.findOne({ where: { id: groupid } });
        //console.log('*******************Admin************', data);


        users.forEach((async (i) => {
            await data.removeUser(i, { through: 'groupUser' });
        }))

        users.forEach((async (i) => {
            await admin.destroy({ where: { groupId: groupid, userId: i } });
        }))

        res.sendStatus(201)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}

exports.showUsersForAdding = async (req, res, next) => {
    try {
        const groupId = req.query.groupId;

        const data = await groups.findAll({ include: [{ model: user, attributes: ['Name', 'id'] }], where: { id: groupId }, attributes: ['id'] });
        const a = []
        if (data.length > 0) {
            for (let i of data[0].users) {
                a.push(i.id);
            }
            const b = [];
            const allusers = await user.findAll({ attributes: ['id', 'name'] });
            const users = allusers.filter(i => !a.includes(i.id));
            res.status(201).json(users);
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}

exports.addUsers = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const groupid = req.query.groupId;
        const users = req.body.users;
        const group = await groups.findOne({ where: { id: groupid } });

        users.forEach(async (i) => {
            await group.addUser(i, { through: 'groupUser' }, { transaction: t })
        })

        console.log('**********************Admin*****************************', users);

        await t.commit();
        res.sendStatus(200);

    } catch (err) {
        await t.rollback()
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}

exports.checkAdmin = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        const checkAdmin = await admin.findOne({ where: { groupId: groupid, userId: req.user.id } });

        if (checkAdmin) {
            res.status(201).json({ success: true });
        }
        else {
            res.status(201).json({ success: false });
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}


exports.checkOwner = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        const owner = await group.findOne({ where: { id: groupid }, attributes: ['CreatedById'] });
        if (req.user.id === owner.CreatedById) {
            res.status(201).json({ success: true });
        }
        else {
            res.status(201).json({ success: false });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}

exports.leaveGroup = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        const data = await groups.findOne({ where: { id: groupid } });
        //console.log('*******************Admin************', data);

        await data.removeUser(req.user.id, { through: 'groupUser' });
        await admin.destroy({ where: { groupId: groupid, userId: req.user.id } });

        res.sendStatus(201)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}

exports.deleteGroup = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        const data = await groups.findOne({ where: { id: groupid } });
        if (data.CreatedById === req.user.id) {
            await groups.destroy({ where: { id: groupid } });
            await admin.destroy({ where: { groupId: groupid } });

        }

        res.sendStatus(201)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}

exports.checkGroupStatus = async (req, res, next) => {
    try {
        const groupid = req.query.groupId;
        const group = await groups.findOne({ where: { id: groupid } });
        if (group) {
            res.status(201).json({ success: true });
        }
        else {
            res.status(201).json({ success: false });
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            Error: err,
        });
    }
}