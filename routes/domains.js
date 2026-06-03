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
var domainsHandler=require('./routesHandlers/domainHandler');
var mongoSecurity=require('./middlewares/mongoDbinjectionSecurity');

/*
 * Domain router.
 *
 * Provides standard CRUD and a domain-specific action
 * to retrieve associated DeviceTypes for a selected domain id.
 */



// ----------- <Actions> -----------
/* Return DeviceTypes linked to the specified domain id. */
router.post('/:id/actions/getDeviceTypes',[authorisationManager.checkToken],function(req, res, next) {
  domainsHandler.getDeviceTypes(req,res,next);
});
// ----------- </Actions> -----------


/* Create a new domain resource. */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["domain"]), function(req, res, next) {
  domainsHandler.postCreateDomain(req,res,next);
});


/* Delete one domain by id. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  domainsHandler.deleteDomain(req,res,next);
});


/* Update one domain by id using req.body.domain. */
router.put('/:id',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["domain"]), function(req, res, next) {
  domainsHandler.updateDomain(req,res,next);
});



/* Read one domain with optional field projection. */
router.get('/:id',[authorisationManager.checkToken],parseRequestMiddleware.parseFields, function(req, res, next) {
  domainsHandler.getDomainById(req,res,next);
});

/* Parse query options and sanitize operators for list endpoint below. */
router.use(parseRequestMiddleware.parseOptions);
router.use(mongoSecurity.parseForOperators);

/* List domains with projection and id-array filter support. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseFields,parseRequestMiddleware.parseIds("domains"), function(req, res, next) {
  req.query.dismissed=false; // dismissed domains must be removed from query results
  domainsHandler.getDomains(req,res,next);
});

module.exports = router;
