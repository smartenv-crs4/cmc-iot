/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2019 CRS4                              *
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

var express = require('express');
var router = express.Router();
var parseRequestMiddleware=require('./middlewares/parseRequestMiddleware');
var authorisationManager=require('./middlewares/authorisationMiddleware');
var devicesHandler=require('./routesHandlers/deviceHandler');
var mongosecurity=require('./middlewares/mongoDbinjectionSecurity');
var conf = require('propertiesmanager').conf;

/*
 * Device router.
 *
 * Covers CRUD plus device-specific actions:
 * - enable/disable lifecycle
 * - observation ingestion and retrieval
 * - dismissed-resource searches
 * - dynamic action forwarding endpoint
 */



//actions

/*
 * Middleware chain for dismissed-device searches.
 * It enables body-based query parsing and standard list query capabilities.
 */
var dismssedMiddlewared=[
  authorisationManager.checkToken,
  parseRequestMiddleware.parseBodyQueries,
  parseRequestMiddleware.parseFields,
  parseRequestMiddleware.parseOptions,
  mongosecurity.parseForOperators,
  parseRequestMiddleware.parseIds("devices")
];
router.post('/actions/searchDismissed',dismssedMiddlewared,function(req, res, next) {
  req.query.dismissed=true; // dismissed device must be a query filter
  req.statusCode=200; // to redefine http status code response
  devicesHandler.getDevices(req,res,next);
});


/* Toggle device state to disabled. */
router.post('/:id/actions/disable',[authorisationManager.checkToken],function(req, res, next) {
  req.disableDevice=true;
  devicesHandler.disableEnableDevice(req,res,next);
});

/* Toggle device state to enabled. */
router.post('/:id/actions/enable',[authorisationManager.checkToken],function(req, res, next) {
  req.disableDevice=false;
  devicesHandler.disableEnableDevice(req,res,next);
});

/* Validate and append one or more observations to the selected device. */
router.post('/:id/actions/sendObservations', [authorisationManager.checkToken],mongosecurity.parseForOperators, parseRequestMiddleware.validateBody(["observations"]), function(req, res, next) {
  devicesHandler.createObservations(req, res, next);
});


/*
 * Filtered observation search constrained to one device.
 * Supported search dimensions include timestamp, value and geospatial filters.
 */
router.post('/:id/actions/getObservations', [authorisationManager.checkToken],mongosecurity.parseForOperators,parseRequestMiddleware.parsePagination ,function(req, res, next) {
  req.statusCode=200;
  devicesHandler.getObservations(req, res, next);
});



/* Return Redis notification context for device observation channels. */
router.post('/:id/actions/getDeviceObservationsRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
  req.statusCode=200;
  devicesHandler.getDeviceObservationsRedisNotification(req,res,next);
});


/* Return Redis notification context for device-level channels. */
router.post('/:id/actions/getDeviceRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
  req.statusCode=200;
  devicesHandler.getDeviceRedisNotification(req,res,next);
});


/* Proxy catch-all for device actions exposed by dynamic API action definitions. */
router.all('/:id/actions/:actionName',[authorisationManager.checkToken],function(req, res, next) {
  req.statusCode=200;
  devicesHandler.actionHandler(req,res,next);
});


// </Actions>

/* Create a new device from req.body.device. */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["device"]), function(req, res, next) {
  devicesHandler.postCreateDevice(req,res,next);
});


/* Delete one device by id. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  devicesHandler.deleteDevice(req,res,next);
});


/*
 * Update one device with authorization-aware field filtering.
 * Sensitive flags are removed depending on current permission context.
 */
router.put('/:id',[authorisationManager.checkToken,authorisationManager.ensureCanGetResourceAndReturnAllOtherPermissions],parseRequestMiddleware.validateBody(["device"]),parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"],conf.cmcIoTOptions.authorizationVerbToHandleDismissedStatus), function(req, res, next) {
  devicesHandler.updateDevice(req,res,next);
});



/* Read one device with field filtering based on effective permissions. */
router.get('/:id',[authorisationManager.checkToken,authorisationManager.ensureCanGetResourceAndReturnAllOtherPermissions],parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"],conf.cmcIoTOptions.authorizationVerbToHandleDismissedStatus), function(req, res, next) {
  devicesHandler.getDeviceById(req,res,next);
});

/* Generic query option parsing for downstream list routes. */
router.use(parseRequestMiddleware.parseOptions);
/* Operator sanitization to reduce MongoDB operator injection risk. */
router.use(mongosecurity.parseForOperators);

/* List non-dismissed devices with query, id-array and projection support. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"]),parseRequestMiddleware.parseIds("devices"), function(req, res, next) {
  req.query.dismissed=false; // dismissed devices must be removed from query results
  devicesHandler.getDevices(req,res,next);
});

module.exports = router;
