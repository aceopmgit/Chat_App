const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const chat = sequelize.define('chat', {
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

}, {
    timestamps: false
})

module.exports = chat;