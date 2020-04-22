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


var unitDriver = require('../../DBEngineHandler/drivers/unitDriver')
var observationUtility = require('./handlerUtility/observationUtility')


/* Create unit */
module.exports.postCreateUnit = function(req, res, next) {
    unitDriver.create(req.body.unit, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* GET unit list */
module.exports.getUnits = function(req, res, next) {
    unitDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* GET unit By Id */
module.exports.getUnitById = function(req, res, next) {
    var id = req.params.id
    unitDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* Update unit */
module.exports.updateUnit = function(req, res, next) {
    unitDriver.findByIdAndUpdate(req.params.id, req.body.unit, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* Delete unit */
module.exports.deleteUnit = function(req, res, next) {
    var id = req.params.id
    observationUtility.findAll({unitId: id}, null, {totalCount: true}, function (err, results) {
        if (err)
            return next(err)
        else {
            if ((results._metadata.totalCount) > 0) { // there are Observation associated with that Unit, so you cannot delete the Unit
                res.httpResponse(err, 409, "Cannot delete the Unit due to associated Observation(s)")
            } else { //Deleting that Unit is safe since there aren't associated Observations
                unitDriver.findByIdAndRemove(id, function(err, deletedUnit) {
                    res.httpResponse(err, null, deletedUnit);
                })
            }
        }
    })
}
