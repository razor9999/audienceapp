'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.
    
          Example:
          return queryInterface.bulkInsert('Person', [{
            name: 'John Doe',
            isBetaMember: false
          }], {});
        */
        return queryInterface.bulkInsert('Users', [{
            username: 'admin',
            password: '123456',

        }], {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});

    }
};
