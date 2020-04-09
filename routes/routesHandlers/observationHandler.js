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
var locationSearchUtility=require("./handlerUtility/locationSearchUtility");
var async=require("async");
var _=require('underscore');


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

//
// function setError(msg){
//     var customError = new Error(msg);
//     customError.name = "ValidatorError";
//     return(customError);
// }
//
//
// function isDefined(item){
//  return (!(_.isUndefined(item) || _.isNull(item)));
// }
//
//
// function validateSearchFieldsAndGetQuery(searchFields,callback){
//
//     var queryObj={};
//
//     async.series({
//         one: function(cl) {
//             var customError;
//             if(searchFields.timestamp){
//                 var from=searchFields.timestamp.from;
//                 var to=searchFields.timestamp.to;
//                 if(!from && !to){
//                     customError=setError("timestamp filter must be {from:'startDate' , to:'stopDate'}. if timestamp is set, the fields 'from' and 'to' cannot be both null");
//                 }else{
//                     queryObj["timestamp"]={};
//                     if(from) queryObj.timestamp['$gte']=from;
//                     if(to) queryObj.timestamp['$lte']=to;
//                 }
//             }
//             if(!customError) {
//                 if (searchFields.value) {
//                     var min = searchFields.value.min;
//                     var max = searchFields.value.max;
//                     if (!_.isNumber(min) && !_.isNumber(max)) {
//                         customError = setError("value filter must be {min:'minValue' , max:'maxValue'}. if value is set, the fields 'min' and 'max' cannot be both null");
//                     } else {
//                         queryObj["value"] = {};
//                         if (_.isNumber(min)) queryObj.value['$gte'] = min;
//                         if (_.isNumber(max)) queryObj.value['$lte'] = max;
//                     }
//                 }
//                 if(!customError) {
//                     if (searchFields.devicesId) {
//                         if (!(_.isArray(searchFields.devicesId))) {
//                             customError = setError("devicesId must be an array of device id");
//                         } else {
//                             queryObj["deviceId"] = {"$in": searchFields.devicesId};
//                         }
//                     }
//
//                     if(!customError) {
//                         if (searchFields.unitsId) {
//                             if (!(_.isArray(searchFields.unitsId))) {
//                                 customError = setError("unitsId must be an array of units id");
//                             } else {
//                                 queryObj["unitId"] = {"$in": searchFields.unitsId};
//                             }
//                         }
//                     }
//                 }
//             }
//
//             cl(customError,true);
//         },
//         two: function(cl){
//             if(isDefined(searchFields.location)){
//                 if(searchFields.location.centre) {
//                     locationSearchUtility.getSearchByLocationQuery(searchFields.location.centre, searchFields.location.distance, searchFields.location.distanceOptions, function (err, locationQuery) {
//                         if (err){
//                             err.message+=". Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}"
//                             cl(err, null);
//                         } else {
//                             queryObj = _.extend(queryObj, locationQuery.query);
//                             cl(null, {centre: locationQuery.centre, mode: locationQuery.mode});
//                         }
//                     });
//                 }else{
//                     cl(setError("location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}"));
//                 }
//
//             }else{
//                 cl(null,false)
//             }
//         }
//     }, function(err, results) {
//         if(err) callback(err);
//         else callback(null,{query:queryObj,locationInfo:results.two});
//     });
// }

/* Observation Search Filters*/
// timestamp: {From:, To;}
// value: {min:, max:}
// location: {centre:{coordinates:[]}, distance: ,  distanceOptions: }
// devicesId: [ids]
// unitsId: { ids:}

module.exports.searchFilter= function(req, res, next) {

    observationUtility.searchFilter(req.body.searchFilters,true,function(err,foundedObservations){
        if(err) {
            return res.httpResponse(err,null,null);
        }else{
            res.httpResponse(null,req.statusCode,foundedObservations);
        }
    });
};


// module.exports.searchFilter= function(req, res, next) {
//
//     var searchFields=req.body.searchFilters;
//     var observationLabel="observation";
//
//     observationUtility.validateSearchFieldsAndGetQuery(searchFields,function(err,queryObj){
//         if(err){
//             return res.httpResponse(err,null,null);
//         }else{
//             observationDriver.find(queryObj.query,"_id location",{lean:true},function(err,queryResults){
//                 if(err){
//                     return res.httpResponse(err,null,null);
//                 } else{
//                    if(queryObj.locationInfo){ // filter by location and distance is set
//                        var dstOpt=searchFields.location.distanceOptions;
//                        dstOpt.mode=queryObj.locationInfo.mode;
//                        locationSearchUtility.filterByOptions(queryResults,dstOpt,queryObj.locationInfo.centre.point,searchFields.location.distance,["_id"],observationLabel,function(err,foundedObservations){
//                             if(err) {
//                                 return res.httpResponse(err,null,null);
//                             }else{
//                                 res.httpResponse(null,req.statusCode,foundedObservations);
//                             }
//                        });
//                    } else{
//                        var resp={};
//                        var foundedItems=_.map(queryResults,function(item){
//                            return(item._id);
//                        })
//                        resp[observationLabel+"s"]=foundedItems;
//                        res.httpResponse(null,req.statusCode,resp);
//                    }
//                 }
//             });
//         }
//
//     });
// };