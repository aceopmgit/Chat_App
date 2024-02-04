const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const groupUser = sequelize.define('groupUser', {
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = groupUser;