const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('ArchivedChat', {
    id: {
        type: Sequelize.INTEGER,
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

}, {
    timestamps: false
})

module.exports = ArchivedChat;