var models = require('../models');
var express = require('express');
const jwt = require('express-jwt')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.js')[env];
var router = express.Router();
var jsonwebtoken = require('jsonwebtoken');

const Question = models.Question;

router.get('/', jwt({secret: config.token.secret}), (req, res) => {

    try {


        var params = {
            pageIndex: req.query.pageIndex * 1,
            pageSize: req.query.pageSize * 1,
            orders: JSON.parse(req.query.orders),
            attributes :['id','code','UserId','from','to']
        };


        models.Event.paginate(params)
            .then(pagination => {
                //console.log(pagination)
               // console.log(pagination.pageCount)
                res.send(pagination)

            })

    } catch (err) {
        console.log(err);
    }

})

router.post('/create', jwt({secret: config.token.secret}), (req, res) => {
    const jwtToken =  req.headers.authorization.split(' ')[1];
    console.log(req.body)
    try {
        let decoded = jsonwebtoken.verify(jwtToken, config.token.secret);
        models.Event.findOne({
            where: {code: req.body.code}
        }).then(event => {
            //res.json(event)
            if (event != null) {
                res.status(400).send({
                    "errors": [
                        {
                            "messages": [
                                "Sorry, The code #" + req.body.code + " has been used"
                            ],

                        }
                    ]
                });

            } else {
                models.Event.create({
                    code: req.body.code,
                    from: req.body.from,
                    to: req.body.to,
                    title: req.body.title,
                    UserId: decoded.id
                }).then(event => {
                    res.json(event)

                });
            }

        });
    } catch (e) {
        console.log(e)
        res.status(400).send({
            "errors": [
                {
                    "messages": [
                        "Sorry, We are busy. Please try again later"
                    ],

                }
            ]
        });
    }


});

module.exports = router;
