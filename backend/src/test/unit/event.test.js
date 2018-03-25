'use strict';

var expect = require('expect.js');
var Bluebird = require('bluebird');

describe('models/event', function () {
    before(function () {
        return require('../../models').sequelize.sync();
    });

    beforeEach(function () {
        this.User = require('../../models').User;
        this.Event = require('../../models').Event;
        this.Question = require('../../models').Question;
        this.Question.destroy({where: {}}),
        this.Event.destroy({where: {}}),
        this.User.destroy({where: {}})


    });

    describe('create', function () {
        it('creates a Event ', function () {
            return this.User.create({username: 'johndoe', password: '123456'}).bind(this).then(function (user) {
                return this.Event.create({
                    code: 'MYCODE',
                    from: "2018-03-25",
                    to: '2018-04-25',
                    UserId: user.id
                })
                    .then(function (event) {
                        console.log(event);
                        expect(event.dataValues.code).to.equal('MYCODE');
                    });
            });
        });
    });
});
