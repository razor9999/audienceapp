'use strict';

var expect = require('expect.js');

describe('models/index', function () {
    it('returns the event model', function () {
        var models = require('../../models');
        expect(models.Event).to.be.ok();
    });

    it('returns the question model', function () {
        var models = require('../../models');
        expect(models.Question).to.be.ok();
    });

    it('returns the user model', function () {
        var models = require('../../models');
        expect(models.User).to.be.ok();
    });
});
