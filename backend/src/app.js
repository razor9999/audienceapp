var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var moment = require('moment');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require("socket.io");
var _findIndex = require('lodash/findIndex') // npm install lodash --save
var cors = require('cors')


var routes = require('./routes/index');
var users = require('./routes/users');
var events = require('./routes/events');
var questions = require('./routes/questions');

var app = express();
// Socket.io
var io = socket_io();
app.io = io;
var db = require('./models');
var User = db.User;
var Event = db.Event;
var Question = db.Question;


var userOnline = []; //danh sách user dang online
io.on('connection', function (socket) {
    //console.log(socket.id + ': connected');
    socket.on('disconnect', function () {
        //console.log(socket.id + ': disconnected')
        $index = _findIndex(userOnline, ['id', socket.id]);
        userOnline.splice($index, 1);
        io.sockets.emit('updateUesrList', userOnline);
    })


    //lắng nghe khi có người login
    socket.on('join', data => {
        // kiểm tra xem tên đã tồn tại hay chưa
        // create admin
        //console.log(data.date)
        let d = moment(data.date + ' ' + data.tz, "YYYY-MM-DD Z"); // first date
        //console.log(d)

        Event.findOne({where: {code: data.code}}).then(event => {
            // project will be the first entry of the Projects table with the title 'aProject' || null
            if (event == null) {
                io.sockets.emit('joinFail', "Sorry, there is no such event active right now.\n"); //nếu tồn tại rồi thì gửi socket fail
            } else {
                // check date valid
                var from = moment(event.dataValues.from)
                var to = moment(event.dataValues.to)

                if (d.isAfter(from) && d.isBefore(to)) {
                    io.sockets.emit('joinSuccess', event.dataValues);
                } else {
                    io.sockets.emit('joinFail', 'Sorry, the event you chose is expired'); //nếu tồn tại rồi thì gửi socket fail
                }

                userOnline.push({
                    id: socket.id,
                })

            }
        })

        //console.log("join");
        //console.log(data);
    })

    //listening user create a new question
    socket.on('newQuestion', data => {

        Question.create({
            content: data.content,
            EventId: data.id,
            status: 0,
            createdBy: data.createdBy
        }).then(question => {
            io.sockets.emit('newQuestionSuccess', question.dataValues);
        })

        //console.log("newQuestion");
        //console.log(data);
    })


    //listening user show question
    socket.on('showQuestion', data => {
        const {myQuestion, pageIndex, pageSize, orders} = data;

        var params = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            orders: orders,
            where: {$or: [{EventId: data.id, status: 1}, {EventId: data.id, status: 0, id: myQuestion}]}
        };


        Question.paginate(params)
            .then(pagination => {
                io.sockets.emit('showQuestionSuccess', pagination);

            })

    })

    socket.on("likedAndDisliked", data => {

        console.log("likedAndDisliked");
        console.log(data);


        Question.findOne({
            where: {id: data.id},
        })
            .then(question => {
                if (data.action == 'liked') {
                    question.updateAttributes({
                        liked: question.dataValues.liked + 1
                    })

                }
                if (data.action == 'disliked') {
                    question.updateAttributes({
                        disliked: question.dataValues.disliked + 1
                    })
                }
                question.action = data.action;
                io.sockets.emit('likedAndDislikedSuccess', question);
            })
    })

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(allowCrossDomain);
app.use(cors())


app.use('/', routes);
app.use('/users', users);
app.use('/events', events);
app.use('/questions', questions);

// catch 404 and forward to error handler
// error handler, required as of 0.3.0
app.use(function (err, req, res, next) {
    res.status(404).json(err);
});


// error handler
// no stacktraces leaked to user unless in development environment
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: (app.get('env') === 'development') ? err : {}
    });
});


module.exports = app;
