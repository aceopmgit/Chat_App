const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const group = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    Name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    CreatedById: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

module.exports = group;