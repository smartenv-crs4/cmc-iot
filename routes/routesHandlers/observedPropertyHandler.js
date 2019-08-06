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


var observedPropertyDriver = require('../../DBEngineHandler/drivers/observedPropertyDriver')


/* Create ObservedProperty */
module.exports.postCreateObservedProperty = function(req, res, next) {
    observedPropertyDriver.create(req.body.observedProperty, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* GET ObservedProperties list */
module.exports.getObservedProperties = function(req, res, next) {
    observedPropertyDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* GET ObservedProperty By Id */
module.exports.getObservedPropertyById = function(req, res, next) {
    var id = req.params.id
    observedPropertyDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* Update ObservedProperty */
module.exports.updateObservedProperty = function(req, res, next) {
    observedPropertyDriver.findByIdAndUpdate(req.params.id, req.body.observedProperty, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


//TODO Gestire la cancellazione in presenza di DeviceTypes e Units collegati

/* Delete ObservedProperties */
module.exports.deleteObservedProperty = function(req, res, next) {
    var id = req.params.id
    observedPropertyDriver.findByIdAndRemove(id, function(err, deletedObservedProperty) {
        res.httpResponse(err, null, deletedObservedProperty)
    })
}

