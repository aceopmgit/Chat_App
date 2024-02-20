const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const { v4: uuidv4 } = require('uuid');

const ForgotPassword = sequelize.define('forgot_password', {
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

module.exports = ForgotPassword;