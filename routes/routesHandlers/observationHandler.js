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

var observationDriver = require('../../DBEngineHandler/drivers/observationDriver');
var observationUtility = require('../routesHandlers/handlerUtility/observationUtility');
var async=require("async")


/* Create Observation */
module.exports.postCreateObservation = function(req, res, next) {
    if(!req.body.observation.deviceId){
        return res.httpResponse(null, 400, "Observation 'deviceId' field missing");
    }else {
        observationUtility.checkIfValid(req.body.observation.deviceId, req.body.observation, function (err, validityTestResult) {
            if (err) return res.httpResponse(err, null, null);
            else {
                observationDriver.create(req.body.observation, function (err, results) {
                    res.httpResponse(err, null, results)
                });
            }
        });
    }
};

/* GET Observations list */
module.exports.getObservations = function(req, res, next) {
    observationDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
};


/* GET Observation By Id */
module.exports.getObservationById = function(req, res, next) {
    var id = req.params.id
    observationDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
};


/* Update Observation */
// module.exports.updateObservation = function(req, res, next) {
//     observationDriver.findByIdAndUpdate(req.params.id, req.body.observation, function(err, results) {
//         res.httpResponse(err, null, results)
//     })
// };

/* Delete Observation */
module.exports.deleteObservation = function(req, res, next) {
    var id = req.params.id
    observationDriver.findByIdAndRemove(id, function(err, deletedObservation) {
        res.httpResponse(err, null, deletedObservation)
    })
};


function composeObservation(currentObservation,observationUpdate,callbackFunction){
    var observationCopy=currentObservation.toObject();
    async.eachOf(observationUpdate, function(observationValue,observationField, callback) {
        observationCopy[observationField]=observationUpdate[observationField];
            callback();
    }, function(err) {
        callbackFunction(err,observationCopy);
    });
}


/* Update Observation */
module.exports.updateObservation = function(req, res, next) {
    observationDriver.findById(req.params.id,null,null,function(err,observatonToUpdate){
        if(err || (!observatonToUpdate)){
            return res.httpResponse(err,null,null);
        } else{
            composeObservation(observatonToUpdate,req.body.observation,function(err,newObservation){
                observationUtility.validateObservationsBeforeUpdate(newObservation, function (err, validityTestResult) {
                    if (err) return res.httpResponse(err, null, null);
                    else {
                        observationDriver.findByIdAndUpdate(req.params.id, newObservation, function(err, results) {
                            res.httpResponse(err, null, results)
                        })
                    }
                });
            });
        }
    });
};
