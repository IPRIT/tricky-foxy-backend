'use strict';

/**
 * Setting up a global http error for handle API errors
 */
import { HttpError } from './utils/http-error';
global.HttpError = HttpError;

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import formData from 'express-form-data';
import requestRestrict from 'express-light-limiter';
import apiRouter from './route';
import { config } from './utils';
import { ClientError, ServerError } from './route/error/http-error';

let app = express();
  
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(formData.parse());
app.use(formData.stream());
app.use(formData.union());
//app.use(cookieParser(config.cookieSecret));
app.enable('trust proxy');
/*app.use(session({
  secret: config.sessionSecret, //'keyboard cat offset',
  resave: false,
  saveUninitialized: true
}));*/

/*
 * Connecting routers
 */
app.use('/', [
  requestRestrict({
    error: new HttpError('Too many requests', 429),
    lookup: [ 'headers.x-real-ip', 'headers.X-Real-IP', 'headers.x-forwarded-for' ],
    maxRequestsPerQuantum: 300
  })
], apiRouter);

app.use(ClientError);
app.use(ServerError);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Page not found');
  err.status = 404;
  res.status(err.status).json({
    error: err
  });
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 200);
    console.error(err);
    res.end();
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 200);
  res.end();
});

export default app;