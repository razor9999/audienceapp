'use strict';
module.exports = (sequelize, DataTypes) => {
    const withPagination = require('sequelize-simple-pagination');

    var Question = sequelize.define('Question', {
        content: DataTypes.STRING,
        liked: DataTypes.INTEGER,
        disliked: DataTypes.INTEGER,
        rating: DataTypes.INTEGER,
        status: DataTypes.INTEGER,
        createdBy: DataTypes.STRING,

    });

    Question.associate = function (models) {
        Question.belongsTo(models.Event, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
    };

    const options = {
        methodName: 'paginate', // the name of the pagination method
        primaryKey: 'id',       // the primary key field of the model
    };

    withPagination(options)(Question);

    return Question;
};