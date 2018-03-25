'use strict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
        username: DataTypes.STRING,
        password:DataTypes.STRING
    },{
        createdAt: false,
        updatedAt: false
    });

    User.associate = function (models) {
        models.User.hasMany(models.Event);
    };

    return User;
};
