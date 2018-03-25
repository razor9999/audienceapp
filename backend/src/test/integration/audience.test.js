'use strict';
var io = require('socket.io-client')
    , assert = require('assert')
    , expect = require('expect.js');
var Bluebird = require('bluebird');
var moment = require('moment');

describe('Suite of unit tests', function() {

    var socket;

    beforeEach(function(done) {
        // Setup
        socket = io.connect('http://localhost:6969', {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            console.log('worked...');
            done();
        });
        socket.on('disconnect', function() {
            console.log('disconnected...');
        })

        socket.on('joinSuccess', function() {
            console.log('joinSuccess...');
        })


        this.User = require('../../models').User;
        this.Event = require('../../models').Event;
        this.Question = require('../../models').Question;
        this.Question.destroy({where: {}}),
            this.Event.destroy({where: {}}),
            this.User.destroy({where: {}})

    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('connected...');
           // socket.disconnect();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }
        done();
    });

    describe('First (hopefully useful) test', function() {

        it('Doing some things with indexOf()', function(done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });

        it('Doing something else with indexOf()', function(done) {
            expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
            expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
            done();
        });
        it('creates a Event and join it  ', function () {

        return this.User.create({username: 'johndoe', password: '123456'}).bind(this).then(function (user) {
            return this.Event.create({
                code: 'MYCODE',
                from: "2018-03-25",
                to: '2018-04-25',
                UserId: user.id
            })
                .then(function (event) {
                    //  console.log(event);
                    expect(event.dataValues.code).to.equal('MYCODE');
                    // socket emit
                    socket.emit("join", {code: event.dataValues.code, date: moment().format('YYYY-MM-DD'), tz: moment().format('Z')});

                });
        });
        });


    });

});
