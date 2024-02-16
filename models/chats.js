const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const chat = sequelize.define('chat', {
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
    }

})

module.exports = chat;