/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2019 CRS4                               *
 *       This file is part of CRS4 Microservice Core - IoT (CMC-IoT).       *
 *                                                                          *
 *     CMC-IoT is free software: you can redistribute it and/or modify      *
 *   it under the terms of the GNU General Public License as published by   *
 *    the Free Software Foundation, either version 3 of the License, or     *
 *                 (at your option) any later version.                      *
 *                                                                          *
 *    CMC-IoT is distributed in the hope that it will be useful,            *
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *            GNU General Public License for more details.                  *
 *                                                                          *
 *     You should have received a copy of the GNU General Public License    *
 *     along with CMC-IoT.  If not, see <http://www.gnu.org/licenses/>.     *
 ############################################################################
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var boom=require('express-boom');
var errorLog=require('./routes/utility/error');
var httpResponse=require('./routes/middlewares/httpResponse').httpResponse;

var indexRouter = require('./routes/index');
var devicesRouter = require('./routes/devices');
var thingsRouter = require('./routes/things');
var deviceTypesRouter = require('./routes/deviceTypes');
var unitsRouter = require('./routes/units');
var vendorsRouter = require('./routes/vendors');
var sitesRouter = require('./routes/sites');
var observedPropertiesRouter = require('./routes/observedProperties');
var observationsRouter = require('./routes/observations');
var apiActionsRouter = require('./routes/apiActions');
var domainsRouter = require('./routes/domains');

var app = express();

// TODO add plugins mode compliance


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/doc', express.static('doc',{root:'doc'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(boom());
app.use(httpResponse);

app.use('/', indexRouter);
app.use('/devices', devicesRouter);
app.use('/things', thingsRouter);
app.use('/deviceTypes', deviceTypesRouter);
app.use('/units', unitsRouter)
app.use('/vendors', vendorsRouter);
app.use('/sites', sitesRouter);
app.use('/observedProperties', observedPropertiesRouter);
app.use('/observations', observationsRouter);
app.use('/apiActions', apiActionsRouter);
app.use('/domains', domainsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.boom.notFound("The resource was not found");
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // render the error page
  errorLog.printErrorLog("App.js An error was occurred due to " + err.message);
  res.boom.badImplementation(err.message);
});


module.exports = app;
