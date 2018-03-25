var models = require('../models');
var express = require('express');
const jwt = require('express-jwt')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.js')[env];
var router = express.Router();

const Question = models.Question;
const Event = models.Event;

router.get('/', jwt({secret: config.token.secret}), (req, res) => {

    try {
        var params = {
            pageIndex: req.query.pageIndex * 1,
            pageSize: req.query.pageSize * 1,
            orders: JSON.parse(req.query.orders),
            include: [{
                model: Event,
                attributes: ['code']
            }]
        };

        if (req.query.code != '') {

            params.include = [{
                model: Event,
                attributes: ['code'],
                where: {
                    code: {
                        $like: req.query.code
                    }
                }
            }]


        }


        models.Question.paginate(params)
            .then(pagination => {
                console.log(pagination.entities)
                //console.log(pagination.pageCount)
                //const {entities,count,pageSize,pageCount,orders} = pagination
                res.send({
                    entities: pagination.entities,
                    count: pagination.count,
                    pageSize: pagination.pageSize,
                    pageIndex: pagination.pageIndex,
                    pageCount: pagination.pageCount,
                    orders: pagination.orders
                })

            })

    } catch (err) {
        console.log(err);
    }

})

router.post('/create', jwt({secret: config.token.secret}), (req, res) => {

    try {
        models.Question.findOne({
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
                    UserId: req.user.id
                }).then(event => {
                    res.json(event)

                });
            }

        });
    } catch (err) {
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

//update api
router.put('/:question_id', function (req, res) {
    console.log(req.body);
    // update
    try {

        models.Question.findOne({
            where: {id: req.body.id}
        }).then(event => {
            //res.json(event)
            if (event != null) {
                event.updateAttributes({
                    content: req.body.content,
                    rating: req.body.rating,
                    status: req.body.status
                })

                res.json(event);
            }
        });
    } catch (err) {
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
