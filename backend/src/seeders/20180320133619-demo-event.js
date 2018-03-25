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
        return queryInterface.bulkInsert('Events', [{
            title: 'Test Event',
            code: "123",
            from: "2018-03-20",
            to: "2018-03-30",
            UserId: 1
        }], {});

    },

    down: (queryInterface, Sequelize) => {

          return queryInterface.bulkDelete('Events', null, {});
    }
};
