const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid');

const fPassword = sequelize.define('ForgotPasswordRequests', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isActive: Sequelize.BOOLEAN
})

module.exports = fPassword;