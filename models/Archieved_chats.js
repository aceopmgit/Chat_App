const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('ArchivedChat', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    Chats: {
        type: Sequelize.TEXT,
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false

    },
    fileUrl: {
        type: Sequelize.TEXT,
    },
    date_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    groupId: {
        type: Sequelize.BIGINT,
    },
    userId: {
        type: Sequelize.BIGINT,
    }

}, {
    timestamps: false
})

module.exports = ArchivedChat;