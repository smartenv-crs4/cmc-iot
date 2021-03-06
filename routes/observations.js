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


var express = require('express')
var router = express.Router()
var parseRequestMiddleware = require('./middlewares/parseRequestMiddleware');
var authorisationManager = require('./middlewares/authorisationMiddleware');
var observationsHandler = require('./routesHandlers/observationHandler');
var mongosecurity = require('./middlewares/mongoDbinjectionSecurity');





/* Search observation Action */


/* Observation Search Filters*/
// timestamp: {From:, To;}
// value: {min:, max:}
// location: {centre:{coordinates:[]}, distance: ,  distanceOptions: }
// devicesId: [ids]
// unitsId: { ids:}
router.post('/actions/search', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["searchFilters"]),mongosecurity.parseForOperators, function(req, res, next) {
    req.statusCode=200;
    req.dbPagination=req.body.pagination ? {skip:(req.body.pagination.skip || 0 ) , limit: (req.body.pagination.limit || undefined)} : null;
    observationsHandler.searchFilter(req, res, next)
});

/* Create observation */
router.post('/', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["observation"]), function(req, res, next) {
    observationsHandler.postCreateObservation(req, res, next)
});




/* Update observation */
router.put('/:id', [authorisationManager.validateIfOptionIsActive("observationsCanBeUpdated"),authorisationManager.checkToken], parseRequestMiddleware.validateBody(["observation"]), function(req, res, next) {
    observationsHandler.updateObservation(req, res, next)
});


/* Delete observation */
router.delete('/:id', [authorisationManager.validateIfOptionIsActive("observationsCanBeDeleted"),authorisationManager.checkToken], function(req, res, next) {
    observationsHandler.deleteObservation(req, res, next)
});


/* Query parsing modules */
router.use(parseRequestMiddleware.parseFields);

/* Read observation */
router.get('/:id', [authorisationManager.checkToken], function(req, res, next) {
    observationsHandler.getObservationById(req, res, next)
});


router.use(parseRequestMiddleware.parseOptions);
router.use(mongosecurity.parseForOperators);


/* GET observations list */
router.get('/', [authorisationManager.checkToken], parseRequestMiddleware.parseIds("observations"), function(req, res, next) {
    observationsHandler.getObservations(req, res, next);
});


module.exports = router;
