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
var parseThingOwnerIdMiddleware=require('./middlewares/parseThingOwnerIdMiddleware');
var authorisationManager=require('./middlewares/authorisationMiddleware');
var thingsHandler=require('./routesHandlers/thingHandler');
var mongosecurity=require('./middlewares/mongoDbinjectionSecurity');
var conf = require('propertiesmanager').conf;



// <actions>

// /* get dismissed things */
var dismssedMiddlewared=[
    authorisationManager.checkToken,
    parseRequestMiddleware.parseBodyQueries,
    parseRequestMiddleware.parseFields,
    parseRequestMiddleware.parseOptions,
    mongosecurity.parseForOperators,
    parseRequestMiddleware.parseIds("things")
];
router.post('/actions/searchDismissed',dismssedMiddlewared,function(req, res, next) {
  req.query.dismissed=true; // dismissed thing must be a query filter
  req.statusCode=200; // to redefine http status code response
  thingsHandler.getThings(req,res,next);
});


router.post('/:id/actions/disable',[authorisationManager.checkToken],function(req, res, next) {
  req.disableThing=true;
  thingsHandler.disableEnableThing(req,res,next);
});

router.post('/:id/actions/enable',[authorisationManager.checkToken],function(req, res, next) {
    req.disableThing=false;
    thingsHandler.disableEnableThing(req,res,next);
});

router.post('/:id/actions/sendObservations', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["observations"]), function(req, res, next) {
    thingsHandler.createObservations(req, res, next);
});


router.post('/:id/actions/addDevices', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["devices"]), function(req, res, next) {
    thingsHandler.addDevices(req, res, next);
});


/* Things observations Search Filters*/
// timestamp: {From:, To;}
// value: {min:, max:}
// location: {centre:{coordinates:[]}, distance: ,  distanceOptions: }
// pagination: {skip: , limit: }
router.post('/:id/actions/getObservations', [authorisationManager.checkToken],mongosecurity.parseForOperators,parseRequestMiddleware.parsePagination ,function(req, res, next) {
    req.statusCode=200;
    thingsHandler.getObservations(req, res, next);
});


//TODO: @guido da documentare
router.post('/:id/actions/getThingObservationsRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
    req.statusCode=200;
    thingsHandler.getThingObservationsRedisNotification(req,res,next);
});

//TODO: @guido da documentare
router.post('/:id/actions/getThingRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
    req.statusCode=200;
    thingsHandler.getThingRedisNotification(req,res,next);
});


// </actions>





/* Create things */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["thing"]),parseThingOwnerIdMiddleware.validateOwnerId(true), function(req, res, next) {
  thingsHandler.postCreateThing(req,res,next);
});


/* Delete things. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  thingsHandler.deleteThing(req,res,next);
});


/* Update things. */
router.put('/:id',[authorisationManager.checkToken,authorisationManager.ensureCanGetResourceAndReturnAllOtherPermissions],parseRequestMiddleware.validateBody(["thing"]),parseThingOwnerIdMiddleware.validateOwnerId(false), parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed"],conf.cmcIoTOptions.authorizationVerbToHandleDismissedStatus),function(req, res, next) {
  thingsHandler.updateThing(req,res,next);
});


/* Read things. */
router.get('/:id',[authorisationManager.checkToken,authorisationManager.ensureCanGetResourceAndReturnAllOtherPermissions], parseRequestMiddleware.parseFieldsAndRemoveSome(["direct","dismissed"],conf.cmcIoTOptions.authorizationVerbToHandleDismissedStatus), function(req, res, next) {
  thingsHandler.getThingById(req,res,next);
});

router.use(parseRequestMiddleware.parseOptions);
router.use(mongosecurity.parseForOperators);

/* GET things listing. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseFieldsAndRemoveSome(["dismissed","direct"]),parseRequestMiddleware.parseIds("things"), function(req, res, next) {
  req.query.dismissed=false; // dismissed thing must be removed from query results
  thingsHandler.getThings(req,res,next);
});

module.exports = router;
