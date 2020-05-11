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

var express = require('express');
var router = express.Router();
var parseRequestMiddleware=require('./middlewares/parseRequestMiddleware');
var authorisationManager=require('./middlewares/authorisationMiddleware');
var devicesHandler=require('./routesHandlers/deviceHandler');
var mongosecurity=require('./middlewares/mongoDbinjectionSecurity');
var conf = require('propertiesmanager').conf;



//actions

// /* get dismissed things */
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


router.post('/:id/actions/disable',[authorisationManager.checkToken],function(req, res, next) {
  req.disableDevice=true;
  devicesHandler.disableEnableDevice(req,res,next);
});

router.post('/:id/actions/enable',[authorisationManager.checkToken],function(req, res, next) {
  req.disableDevice=false;
  devicesHandler.disableEnableDevice(req,res,next);
});

router.post('/:id/actions/sendObservations', [authorisationManager.checkToken],mongosecurity.parseForOperators, parseRequestMiddleware.validateBody(["observations"]), function(req, res, next) {
  devicesHandler.createObservations(req, res, next);
});




/* devices observations Search Filters*/
// timestamp: {From:, To;}
// value: {min:, max:}
// location: {centre:{coordinates:[]}, distance: ,  distanceOptions: }
// pagination: {skip: , limit: }
router.post('/:id/actions/getObservations', [authorisationManager.checkToken],mongosecurity.parseForOperators,parseRequestMiddleware.parsePagination ,function(req, res, next) {
  req.statusCode=200;
  devicesHandler.getObservations(req, res, next);
});

// </Actions>

/* Create devices */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["device"]), function(req, res, next) {
  devicesHandler.postCreateDevice(req,res,next);
});


/* Delete devices. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  devicesHandler.deleteDevice(req,res,next);
});


/* Update devices. */
router.put('/:id',[authorisationManager.checkToken,authorisationManager.ensureCanGetResourceAndReturnAllOtherPermissions],parseRequestMiddleware.validateBody(["device"]),parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"],conf.cmcIoTOptions.authorizationVerbToHandleDismissedStatus), function(req, res, next) {
  devicesHandler.updateDevice(req,res,next);
});



/* Read devices. */
router.get('/:id',[authorisationManager.checkToken,authorisationManager.ensureCanGetResourceAndReturnAllOtherPermissions],parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"],conf.cmcIoTOptions.authorizationVerbToHandleDismissedStatus), function(req, res, next) {
  devicesHandler.getDeviceById(req,res,next);
});

router.use(parseRequestMiddleware.parseOptions);
router.use(mongosecurity.parseForOperators);

/* GET devices listing. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"]),parseRequestMiddleware.parseIds("devices"), function(req, res, next) {
  req.query.dismissed=false; // dismissed devices must be removed from query results
  devicesHandler.getDevices(req,res,next);
});

module.exports = router;
