'use strict';

var app = require('../../app');
var Bluebird = require('bluebird');
var expect = require('expect.js');
var request = require('supertest');

describe('user login page and create event', function () {
    before(() => {
        return require('../../models').sequelize.sync();
    });

    beforeEach(() => {
        this.models = require('../../models');
        this.models.Question.destroy({where: {}}),
            this.models.Event.destroy({where: {}}),
            this.models.User.destroy({where: {}})

    });

    it('loads correctly', (done) => {
        request(app).get('/').expect(200, done);
    });


    it('Create a new user then login and create a new event', (done) => {
        this.models.User.create({username: 'myusername1', password: '123456'}).bind(this).then((user) => {
            request(app)
                .post('/users/login')
                .send({
                    "username": user.dataValues.username,
                    "password": user.dataValues.password,
                })
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) done(err);
                    console.log(res.body);
                    expect(res.body).have.property('token')
                    // create event
                    request(app)

                        .post('/events/create')
                        .set({'Authorization': 'Bearer ' + res.body.token})

                        .send({
                            "code": "HHHHH",
                            "from": '2018-03-14',
                            "to": '2018-04-14',
                            "UserId": user.dataValues.id

                        })
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end((err, res) => {
                            if (err) done(err);
                            console.log(res.body);
                            expect(res.body).have.property('code')
                            expect(res.body.code).to.equal('HHHHH')
                            // create event
                            done()
                        });

                });
        });
    });
});
