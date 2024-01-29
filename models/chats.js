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
        allowNull: false
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = chat;