var express = require('express');
var http = require('http'); //para el paquete reload
var path = require('path');
var reload = require('reload'); //para el paquete reload
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser'); //para el paquete reload
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('Quiz colodron'));  //añadida semilla para cifrar cookie
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));



// Helpers dinamicos:
app.use(function(req, res, next) {
  // guardar path en session.redir para despues de login
  if(!req.path.match(/\/login|\/logout/)){
    req.session.redir = req.path;
  }
  
  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  
  next();
});

// Auto logout después de 2 minutos de inactividad
app.use(function(req, res, next) {
  if(req.session.user){
    var date = new Date();
    var miliseconds = date.getTime();
    //Si ya estaba logeado el usuario
    if(req.session.user.lastRequestTime){
      var timeSinceLastRequest = miliseconds - req.session.user.lastRequestTime; 
      if(timeSinceLastRequest > 120000/* 2 minutos */){
        req.session.user = null;
        res.locals.session = req.session;
        res.redirect('/login');
      }else{
        req.session.user.lastRequestTime = miliseconds;
        next();
      }
    //Si aún no estaba logeado el usuario
    }else{
        req.session.user.lastRequestTime = miliseconds;
        next();
    }
  }else{
    next();
  }
});

app.use('/', routes);

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
      error: err, 
      errors: []
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}, 
    errors: []
  });
});


module.exports = app;
