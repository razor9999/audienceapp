'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Questions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            content: {
                type: Sequelize.STRING
            },
            liked: {
                type: Sequelize.INTEGER
            },
            disliked: {
                type: Sequelize.INTEGER
            },
            rating: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            status: {
                allowNull: false,
                type: Sequelize.INTEGER

            },
            createdBy: {
                allowNull: false,
                type: Sequelize.STRING
            },
            EventId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Events',
                    key: 'id'
                }
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Questions');
    }
};