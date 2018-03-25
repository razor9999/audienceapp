'use strict';

var app = require('../../app');
var Bluebird = require('bluebird');
var expect = require('expect.js');
var request = require('supertest');

describe('user login page', function () {
    before(() => {
        return require('../../models').sequelize.sync();
    });

    beforeEach(() => {
        this.models = require('../../models');

        return Bluebird.all([
            this.models.Question.destroy({where: {}}),
            this.models.Event.destroy({where: {}}),
            this.models.User.destroy({where: {}})
        ]);
    });

    it('loads correctly', (done) => {
        request(app).get('/').expect(200, done);
    });


    it('Create a new user then login with credential', (done) => {
        this.models.User.create({username: 'myusername', password: '123456'}).bind(this).then((user) => {
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
                    done();
                });
        });
    });
});
