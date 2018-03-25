'use strict';

var expect = require('expect.js');
var Bluebird = require('bluebird');

describe('models/question', function () {
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
        it('creates a Question ', function (done) {
             this.User.create({username: 'johndoe1', password: '123456'}).bind(this).then(function (user) {
                 this.Event.create({
                    code: 'MYCODE1',
                    from: "2018-03-25",
                    to: '2018-04-25',
                    UserId: user.id
                })
                    .then((event) => {
                        //console.log(event);
                        return this.Question.create({
                            content: 'Hello the first question',
                            EventId: event.dataValues.id,
                            status: 0,
                            createdBy: 'Anonymous'
                        }).then((question) => {
                            expect(question.dataValues.content).to.equal('Hello the first question');
                            done()
                        })

                    });
            });
        });
    });
});
