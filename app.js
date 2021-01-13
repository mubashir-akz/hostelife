const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const ENV = require('dotenv').config()
const indexRouter = require('./routes/guest');
const hostelRouter = require('./routes/hostel-owner');
const adminRouter = require('./routes/admin')
const hbs = require('express-handlebars');
const app = express();
const db = require('./config/connection')
const fileUpload = require('express-fileupload')
const userRouter = require('./helpers/user-helpers')
require('./views/Guest/passport')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
  extname: 'hbs', defaultLayout: 'layout', layoutDir: `${__dirname}/views/layouts`, partialsDir: `${__dirname}/views/partials`,
}));
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(bodyParser.urlencoded({ extended: false }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
db.connect((err) => {
  if (err) console.log('Database not connected Error is ' + err);
  else console.log('Database connected');
})
app.use(fileUpload())
app.use('/', indexRouter);
app.use('/hostel', hostelRouter);
app.use('/admin', adminRouter);
// app.use('/user',userRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
