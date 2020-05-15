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
var apiActionsHandler=require('./routesHandlers/apiActionHandler');
var mongoSecurity=require('./middlewares/mongoDbinjectionSecurity');

//TODO: @guido da documentare
router.post('/device/:id/action/getDeviceObservationsRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
  req.statusCode=200;
  apiActionsHandler.getDeviceObservationsRedisNotification(req,res,next);
});

//TODO: @guido da documentare
router.post('/thing/:id/action/getThingObservationsRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
  req.statusCode=200;
  apiActionsHandler.getThingObservationsRedisNotification(req,res,next);
});

//TODO: @guido da documentare
router.post('/device/:id/action/getDeviceRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
  req.statusCode=200;
  apiActionsHandler.getDeviceRedisNotification(req,res,next);
});

//TODO: @guido da documentare
router.post('/thing/:id/action/getThingRedisNotification',[authorisationManager.checkToken], function(req, res, next) {
  req.statusCode=200;
  apiActionsHandler.getThingRedisNotification(req,res,next);
});



/* Create apiActions */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["apiAction"]), function(req, res, next) {
  apiActionsHandler.postCreateApiAction(req,res,next);
});


/* Delete apiActions. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  apiActionsHandler.deleteApiAction(req,res,next);
});


/* Update apiActions. */
router.put('/:id',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["apiAction"]), function(req, res, next) {
  apiActionsHandler.updateApiAction(req,res,next);
});



/* Read apiActions. */
router.get('/:id',[authorisationManager.checkToken],parseRequestMiddleware.parseFields, function(req, res, next) {
  apiActionsHandler.getApiActionById(req,res,next);
});

router.use(parseRequestMiddleware.parseOptions);
router.use(mongoSecurity.parseForOperators);

/* GET apiActions listing. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseFields,parseRequestMiddleware.parseIds("apiActions"), function(req, res, next) {
  req.query.dismissed=false; // dismissed apiActions must be removed from query results
  apiActionsHandler.getApiActions(req,res,next);
});

module.exports = router;
