var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var session = require('express-session');
var FileStore = require('session-file-store')(session);

var http = require('http')
var server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new FileStore,
    secret: '800m',
    resave: true,
    saveUninitialized: true
}));

//var redis = require('redis');
//var redisStore = require('connect-redis')(session);
//var client = redis.createClient();
//app.use(session({
//	  name: 'server-session-store',
//	  secret: '800m',
//	  saveUninitialized: false, //proxy server 사용하려면 false
//	  resave: false,  //proxy server 사용하려면 false 
//	  cookie:{
//	    maxAge: 24*60*60*1000,
//	  },
//	  store: new redisStore({ host: '127.0.0.1', port: 6379, client: client, logErrors : true})
//	}));

app.use(function (req, res, next) {
  if (!req.session) {
    console.log("no session");
    return next(new Error('oh no')) // handle error
  }
  console.log("req.session exists");
  next() // otherwise continue
})

//app.use('/', routes);
app.post('/getUserInfo',users.getUserInfo);
app.post('/signup',users.signup);
app.post('/login',users.login);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen(3000);

module.exports = app;