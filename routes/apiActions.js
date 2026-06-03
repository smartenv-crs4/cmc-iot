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

/*
 * ApiAction router.
 *
 * Responsibilities:
 * - CRUD for action templates bound to a device type
 * - Optional projection and query option parsing for list/read endpoints
 * - Injection hardening on searchable endpoints
 */

/* Create a new ApiAction resource from req.body.apiAction. */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["apiAction"]), function(req, res, next) {
  apiActionsHandler.postCreateApiAction(req,res,next);
});


/* Delete one ApiAction by identifier. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  apiActionsHandler.deleteApiAction(req,res,next);
});


/* Update one ApiAction by identifier using req.body.apiAction. */
router.put('/:id',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["apiAction"]), function(req, res, next) {
  apiActionsHandler.updateApiAction(req,res,next);
});


/* Read one ApiAction; allow field projection parsing on single resource read. */
router.get('/:id',[authorisationManager.checkToken],parseRequestMiddleware.parseFields, function(req, res, next) {
  apiActionsHandler.getApiActionById(req,res,next);
});

/* Query option parsing is enabled for routes declared below this point. */
router.use(parseRequestMiddleware.parseOptions);
/* Sanitize user-provided query operators before executing datastore queries. */
router.use(mongoSecurity.parseForOperators);

/* List ApiActions with projection, id-array filters and default dismissed=false. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseFields,parseRequestMiddleware.parseIds("apiActions"), function(req, res, next) {
  req.query.dismissed=false; // dismissed apiActions must be removed from query results
  apiActionsHandler.getApiActions(req,res,next);
});


/*
 * Temporary diagnostic endpoint.
 * It mirrors route params and query payload used by dynamic action invocation.
 */
router.get('/test/:id/:actionName',[authorisationManager.checkToken], function(req, res, next) {
  res.httpResponse(null, null, {
    device:req.params.id,
    actionName:req.params.actionName,
    actionParams:req.query
  });
});

module.exports = router;
