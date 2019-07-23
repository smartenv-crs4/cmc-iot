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
var vendorsHandler=require('./routesHandlers/vendorHandler');
var mongosecurity=require('./middlewares/mongoDbinjectionSecurity');


/* Create Vendor */
router.post('/', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["vendor"]), function(req, res, next) {
    vendorsHandler.postCreateVendor(req, res, next);
});


/* Query parsing modules */
router.use(parseRequestMiddleware.parseFields);
router.use(parseRequestMiddleware.parseOptions);
router.use(mongosecurity.parseForOperators);


/* GET vendors list */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseIds("vendors"), function(req, res, next) {
    vendorsHandler.getVendors(req, res, next);
});


module.exports = router;
