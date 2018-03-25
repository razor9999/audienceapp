'use strict';
module.exports = (sequelize, DataTypes) => {

    const withPagination = require('sequelize-simple-pagination');

    var Event = sequelize.define('Event', {
        title: DataTypes.STRING,
        code: DataTypes.STRING,
        from: 'DATE',
        to: 'DATE',
    },{

    });

    Event.associate = function (models) {
        models.Event.belongsTo(models.User, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
        models.Event.hasMany(models.Question, {constraints: true});

    };
    const options = {
        methodName: 'paginate', // the name of the pagination method
        primaryKey: 'id',       // the primary key field of the model
    };

    withPagination(options)(Event);

    return Event;
};
