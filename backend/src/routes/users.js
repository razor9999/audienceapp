var models = require('../models');
var express = require('express');
const jsonwebtoken = require('jsonwebtoken')
const jwt = require('express-jwt')
const getErrorMessage = require('../utils/message-handle')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.js')[env];
var validate = require('express-validation');
var validation = require('../validations/login.js');

var router = express.Router();

const User = models.User;

//login to system
router.post('/login', validate(validation), (req, res, next) => {
    //console.log(res);
    const {username, password} = req.body
    User
        .findOne({
            where: {
                username: username,
                password: password
            }
        })
        .then((user) => {
            if (user) {
                // const roleId = user.get('roleId')
                const token = jsonwebtoken.sign({
                    username: username,
                    id: user.id
                }, config.token.secret, { // get secret from config
                    expiresIn: config.token.expired // expires in 1 day
                })
                res.json({
                    username: username,
                    token: token,
                    email: user.get('email')
                })
            } else {
                res.status(400).send({
                    "errors": [
                        {
                            "messages": [
                                "Sorry, We could not found your account"
                            ],

                        }
                    ]
                });
            }
        })
})


module.exports = router;
