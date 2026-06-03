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
var parseRequestMiddleware = require('./middlewares/parseRequestMiddleware')
var authorisationManager = require('./middlewares/authorisationMiddleware')
var observedPropertiesHandler = require('./routesHandlers/observedPropertyHandler')
var mongosecurity = require('./middlewares/mongoDbinjectionSecurity')

/*
 * ObservedProperty router.
 *
 * Straightforward CRUD endpoints with common projection/options parsing
 * and query operator sanitization for listing.
 */


/* Create a new observed property from req.body.observedProperty. */
router.post('/', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["observedProperty"]), function(req, res, next) {
    observedPropertiesHandler.postCreateObservedProperty(req, res, next)
})


/* Read one observed property by id. */
router.get('/:id', [authorisationManager.checkToken], function(req, res, next) {
    observedPropertiesHandler.getObservedPropertyById(req, res, next)
})


/* Update one observed property by id. */
router.put('/:id', [authorisationManager.checkToken], parseRequestMiddleware.validateBody(["observedProperty"]), function(req, res, next) {
    observedPropertiesHandler.updateObservedProperty(req, res, next)
})


/* Delete one observed property by id. */
router.delete('/:id', [authorisationManager.checkToken], function(req, res, next) {
    observedPropertiesHandler.deleteObservedProperty(req, res, next)
})


/* Shared parsers/sanitizers for listing operations declared below. */
router.use(parseRequestMiddleware.parseFields)
router.use(parseRequestMiddleware.parseOptions)
router.use(mongosecurity.parseForOperators)


/* List observed properties with id-array filter support. */
router.get('/', [authorisationManager.checkToken], parseRequestMiddleware.parseIds("observedProperties"), function(req, res, next) {
    observedPropertiesHandler.getObservedProperties(req, res, next)
})


module.exports = router
