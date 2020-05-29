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


var observationsDriver = require('../../../DBEngineHandler/drivers/observationDriver');
var redisHandler = require('./redisHandler');
var thingAndDeviceHandlerUtility=require("./thingAndDeviceHandlerUtility");
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var locationSearchUtility=require("./locationSearchUtility");
var observationUtility=require('./observationUtlity.js');
var async = require('async');
var conf=require('propertiesmanager').conf;

var _ = require('underscore');
//
// function validateUnitAndValueRange(deviceStatus, observation, callback) {
//
//     var valid = false;
//     var interval = false;
//
//     if(deviceStatus.units) {
//         deviceStatus.units.forEach(function (unit) {
//
//             if (unit._id.toString() === observation.unitId.toString()) {
//                 valid = true;
//                 if ((observation.value >= unit.minValue) && (observation.value <= unit.maxValue))
//                     interval = true;
//             }
//         });
//         if (valid) {
//             if (interval) { // it pass all verification tests
//                 callback(null);
//             } else { // observation out of range
//                 var Err = new Error("The observation value is out of range.");
//                 Err.name = "outOfRangeError";
//                 callback(Err);
//             }
//
//         } else { // not valid unitId for this device Type
//             var Err = new Error("Not a valid unitId for this device type.");
//             Err.name = "DeviceTypeError";
//             callback(Err);
//         }
//     }else{
//         var Err = new Error("No observed property measure unit associated to this device. You must set it before send observation");
//         Err.name = "ConflictError";
//         callback(Err);
//     }
// }
//
//
//
// function locationHandler(observation, deviceStatus, callback){
//
//
//     if(deviceStatus.thing.mobile){ // it is a mobile device
//         if(observation.location && observation.location.coordinates){ // valid coordinates
//             siteDriver.locationValidator(observation.location,function(err){
//                 callback(err,observation);
//             });
//
//             // callback(null,observation);
//
//         }else{
//             var Err = new Error("Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices");
//             Err.name = "BadRequestError";
//             callback(Err, null, null);
//         }
//     }else{ // it is a not mobile device
//         if(observation.location){ // has location
//             var Err = new Error("Location field must be set only for mobile devices.");
//             Err.name = "unprocessableError";
//             callback(Err, null, null);
//
//         }else{
//             observation.location=deviceStatus.location;
//             callback(null,observation);
//         }
//     }
// }
//
//
// function validateAndUpdateObservationContent(id, observation, deviceStatus, callback) {
//
//     // -  verifica se il device può fare una scrittura [disabled,dismissed]
//     // e se è l'unitadi misura è compattibile col suo device Type
//     // - se non c'è su memm cache allora controlla sul database
//     // - Salva su mem cache Redis le autorizzazioni del device [dismissed, disabled, validUnits[unit1,unit2,.....]
//
//     locationHandler(observation,deviceStatus,function(err,updateObservation){
//         if(!err){
//
//             if (deviceStatus.dismissed) {
//                 Err = new Error("The device/thing was removed from available devices/things.");
//                 Err.name = "DismissedError";
//                 callback(Err)
//             } else {
//                 if (deviceStatus.disabled) {
//                     Err = new Error("The device/thing was disable. It must be enabled to set observations.");
//                     Err.name = "DisabledError";
//                     callback(Err)
//                 }else{
//                     if (!(updateObservation.value==undefined)) {
//                         if (updateObservation.unitId) {
//
//                             validateUnitAndValueRange(deviceStatus, updateObservation, function(err){
//                                 if(!err){
//                                     updateObservation.deviceId=id;
//                                     callback(null,{authorized:true,updatedObservation:updateObservation})
//                                 }else {
//                                     callback(err);
//                                 }
//                             });
//                         } else {
//                             var Err = new Error("Observation 'unitId' field missing");
//                             Err.name = "ValidatorError";
//                             callback(Err)
//                         }
//                     } else {
//                         var Err = new Error("Observation 'value' field missing");
//                         Err.name = "ValidatorError";
//                         callback(Err)
//                     }
//                 }
//             }
//         }else {
//             callback(err);
//         }
//     });
// }
//
//
//
//
//
// // function getDeviceLocation(deviceInfo,callback){
// //     //{type: "Point", coordinates: [1, 1]},
// //
// //
// //     if(deviceInfo){
// //         if(deviceInfo.thing.mobile){ // it is a mobile device
// //             callback(null,deviceInfo);
// //         }else{ // it is a not mobile device
// //             var siteLocation=null;
// //             var siteId=deviceInfo.thing.siteId;
// //             async.whilst(
// //                 function test() {
// //                     return (siteLocation==null);
// //                 },
// //                 function iter(next) {
// //                     siteDriver.findById(siteId,null,null,function(err,siteInfo){
// //                         if(!err) {
// //                             siteLocation = (siteInfo && siteInfo.location && siteInfo.location.coordinates && (siteInfo.location.coordinates.length > 0)) ? siteInfo.location : null;
// //                             siteId = siteInfo.locatedInSiteId;
// //                         }
// //                         next(err,siteLocation);
// //                     })
// //                 },
// //                 function (err, locationSite) {
// //                     if(!err){
// //                         deviceInfo.location=locationSite;
// //                     }
// //                     callback(err,deviceInfo);
// //                 }
// //             );
// //         }
// //     }else{
// //         Err = new Error("The device/thing not exist.");
// //         Err.name = "NotExistError";
// //         callback(Err, null);
// //     }
// // }
//
//
// // function getDeviceStatus(deviceId,callback){
// //     // check if Resdis store device Stutus Information. If yes return It otherwise check info into Database
// //
// //     var redis = false; //TODO: change with redis check
// //
// //     try {
// //         var validDeviceId = deviceDriver.ObjectId(deviceId);
// //         if (redis) {
// //             callback(redis);  // todo change with deviceInfo from Redis
// //         } else {
// //             // check device info and valid units into database
// //             deviceDriver.aggregate([
// //                 {
// //                     $match: {_id: validDeviceId}
// //                 },
// //                 {
// //                     $lookup: {
// //                         from: 'devicetypes',
// //                         localField: 'typeId',
// //                         foreignField: '_id',
// //                         as: 'deviceType'
// //                     }
// //
// //                 },
// //                 {$unwind: "$deviceType"},
// //                 {
// //                     $lookup: {
// //                         from: 'things',
// //                         localField: 'thingId',
// //                         foreignField: '_id',
// //                         as: 'thing'
// //                     }
// //
// //                 },
// //                 {$unwind: "$thing"},
// //                 {
// //                     $lookup: {
// //                         from: 'observedproperties',
// //                         localField: 'deviceType.observedPropertyId',
// //                         foreignField: '_id',
// //                         as: 'observedProperty'
// //                     }
// //
// //                 },
// //                 {$unwind: "$observedProperty"},
// //                 {
// //                     $lookup: {
// //                         from: 'units',
// //                         localField: 'observedProperty._id',
// //                         foreignField: 'observedPropertyId',
// //                         as: 'units'
// //                     }
// //
// //                 },
// //                 {
// //                     $project: {
// //                         dismissed: 1,
// //                         disabled: 1,
// //                         "units._id": 1,
// //                         "units.minValue": 1,
// //                         "units.maxValue": 1,
// //                         "thing.mobile":1,
// //                         "thing.siteId":1,
// //                         "thing._id":1
// //                         // name: 0,
// //                         // description: 0,
// //                         // thingId: 0,
// //                         // typeId: 0,
// //                         // deviceType: 0,
// //                         // observedProperty:0
// //                     }
// //                 }
// //             ], function (err, results) {
// //                 if(!err){
// //                     thingAndDeviceHandlerUtility.getDeviceLocation(results[0] || null ,callback);
// //                 }else{
// //                     callback(err);
// //                 }
// //
// //             });
// //         }
// //     }catch (exception) {
// //         var Err = new Error(deviceId + " is a not valid ObjectId");
// //         Err.name = "BadRequestError";
// //         callback(Err);
// //     }
// //
// //
// //
// //
// // }
//
//
//
// function validateAndUpdateDeviceObservations(thingId,deviceId,observations,callback){
//
//     thingAndDeviceHandlerUtility.getDeviceStatus(deviceId,true,function(err,deviceStatus){
//         if(!err){
//
//             if(thingId && thingId!=deviceStatus.thing._id){
//                 var Err=new Error("Unprocessable request due to device '" + deviceId + "' is not associated to thing '" + thingId + "'");
//                 Err.name = "unprocessableError";
//                 callback(Err);
//             }else{
//                 var updatedObservations=[];
//
//                 async.each(observations, function (observation, callbackfunction) {
//                     validateAndUpdateObservationContent(deviceId, observation, deviceStatus, function (err, validationResults) {
//                         if (err){
//                             err.observation=JSON.stringify(observation);
//                         } else{
//                             updatedObservations.push(validationResults.updatedObservation);
//                         }
//                         callbackfunction(err);
//                     });
//                 }, function (err) {
//                     callback(err,updatedObservations,deviceStatus);
//                 });
//             }
//         }else{
//             err.observation=null;
//             callback(err);
//         }
//     });
// }
//
//
// function validateObservationsBeforeUpdate(updateObservation,callback){
//
//
//     thingAndDeviceHandlerUtility.getDeviceStatus(updateObservation.deviceId,false,function(err,deviceStatus){
//         if(!err){
//             if(deviceStatus){
//                 validateUnitAndValueRange(deviceStatus, updateObservation, function(err){
//                     if(!err){
//                         siteDriver.locationValidator(updateObservation.location,function(err){
//                             callback(err,{authorized:true,updatedObservation:updateObservation})
//                         });
//                     }else {
//                         callback(err);
//                     }
//                 });
//             }else{
//                 Err = new Error("The device not exist.");
//                 Err.name = "NotExistError";
//                 callback(Err, null);
//             }
//         }else{
//             err.observation=null;
//             callback(err);
//         }
//     });
// }
//
//
// function restoreDeviceObservationsStatus(observationsToDelete,callback){
//
//     if (observationsToDelete.length > 0) {
//         var deleteList = _.map(observationsToDelete, function (obs) {
//             return obs._id;
//         });
//
//         //TODO: Try to handle data inconsistent if deletion is not completed
//         deleteMany({_id: {"$in": deleteList}}, function (errDelete) {
//             if (errDelete)
//                 callback(new Error("Observations: inconsistent data due to error in delete invalid observations--> " + observationsToDelete), null);
//             else callback(null);
//         });
//     } else {
//         callback(null);
//     }
// }
//
//
//
// function restoreThingsObservationsStatus(observationsToDelete,callback){
//
//     var observations=[];
//     async.each(observationsToDelete, function (observation, clbFun) {
//         observations=observations.concat(observation);
//        clbFun();
//     }, function (err) {
//         restoreDeviceObservationsStatus(observations,function(errDeleteDevObs){
//             callback(errDeleteDevObs);
//         });
//     });
// }
//
//
// function createObservations(observations,callback){
//     var createdResourcesId = [];
//     async.eachSeries(observations, function (observation, clbFun) {
//         create(observation, function (err, createdObservation) {
//             if (createdObservation)
//                 createdResourcesId.push(createdObservation);
//             clbFun(err);
//         });
//     }, function (err) {
//         if (!err) {
//             callback(null, createdResourcesId);
//         } else {
//
//             restoreDeviceObservationsStatus(createdResourcesId,function(errorInRestore){
//                 if(errorInRestore){
//                     callback(errorInRestore,null);
//                 }else{
//                     callback(err,null);
//                 }
//             });
//         }
//     });
// }
//
//
//
// function validateThingObservations(thingId, thingStatus,deviceId,observations,callback){
//
//
//     if(thingStatus){
//         if(thingStatus.dismissed){
//             Err = new Error("The thing '" +thingId + "' was removed from available devices/things.");
//             Err.name = "DismissedError";
//             callback(Err)
//         }else{
//             if(thingStatus.disabled){
//                 Err = new Error("The thing '" +thingId + "' was disable. It must be enabled to set observations.");
//                 Err.name = "DisabledError";
//                 callback(Err)
//             }else{
//
//                 validateAndUpdateDeviceObservations(thingId,deviceId, observations, function (err, validatedObservations) {
//                     if (err){
//                         err.message = "Unprocessable observation " + (err.observation ? err.observation + " " : "")  + "for a device " + deviceId + " due to " + err.message;
//                         callback(err,null);
//                     } else{
//                         callback(null,validatedObservations);
//                     }
//                 });
//
//             }
//         }
//     }else{
//         Err = new Error("The thing '" +thingId + "' not exist.");
//         Err.name = "DismissedError";
//         callback(Err)
//     }
//
//
//
// }
//
//
// // function getThingStatus(thingId,callback){
// //
// //     var redis = false; //TODO: change with redis check
// //
// //     if (redis) {
// //         callback(redis);  // todo change with deviceInfo from Redis
// //     } else {
// //         thingDriver.findById(thingId, "disabled dismissed", null, function (err, thingStatus) {
// //             if (!err) {
// //                callback(null,thingStatus);
// //             } else {
// //                 callback(err, null);
// //             }
// //         });
// //     }
// // }
//
//
//
// function setError(msg){
//     var customError = new Error(msg);
//     customError.name = "ValidatorError";
//     return(customError);
// }
//
//
// function isDefined(item){
//     return (!(_.isUndefined(item) || _.isNull(item)));
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
//
//
//
//
// var deleteMany = function deleteMany(conditions, options, callback) {
//     if(!callback){
//         if(options) {
//             callback = options;
//             options = null;
//         }
//     }
//     observationsDriver.deleteMany(conditions, options, function (err,deletedItems) {
//         if(callback) callback(err,deletedItems);
//         redisHandler.removeObservationsFromCache(_.keys(deletedItems));
//     });
// };
//
// var create= function create(observation, callback) {
//     observationsDriver.create(observation, function(err,createdObservation){
//         if(callback) callback(err,createdObservation);
//         if(createdObservation)
//             redisHandler.saveSingleObservationToCache(createdObservation);
//     });
// };

module.exports.validateSearchFieldsAndGetQuery=observationUtility.validateSearchFieldsAndGetQuery;

function paginationIsIntoCacheLimits(pagination,observationsCacheItems){
    if(pagination){
        if(!pagination.limit){
            return({searchOnRedis:false});
        }else{
            if((pagination.skip||0)>=observationsCacheItems){
                return({searchOnRedis:false});
            }else{

                if(pagination.limitByDefault){
                    pagination.limit=observationsCacheItems;
                    return ({searchOnRedis:true,paginationChanges:pagination});
                }else{
                    if(((pagination.skip || 0 ) + pagination.limit)>observationsCacheItems){
                        return({searchOnRedis:false});
                    }else{
                        return ({searchOnRedis:true,paginationChanges:pagination});
                    }
                }
            }
        }
    }else{
        return({searchOnRedis:false});
    }
}

function checkIfSearchOnlyByDeviceIdAndGetLimits(searchFilters){
    var observationsCacheItems=conf.cmcIoTOptions.observationsCacheItems;
    if(searchFilters && !_.isEmpty(searchFilters)){ // there are search filters
        if(((_.keys(searchFilters).length)===1) && (searchFilters.devicesId)) { // only devices filter
            return ({searchOnRedis:true,observationsCacheItems:(observationsCacheItems * searchFilters.devicesId.length)});
        }
        else{
            return({searchOnRedis:false,observationsCacheItems:observationsCacheItems});  // search with more filters
        }
    }else{  // no filters then return all obs
        return({searchOnRedis:false,observationsCacheItems:observationsCacheItems});
    }
}

function mustSearchOnRedisFirst(searchFilters,pagination){

    var canSearchOnlyByDeviceIdAndGetLimits=checkIfSearchOnlyByDeviceIdAndGetLimits(searchFilters);

    if(canSearchOnlyByDeviceIdAndGetLimits.searchOnRedis){
        var paginationCheck=paginationIsIntoCacheLimits(pagination,canSearchOnlyByDeviceIdAndGetLimits.observationsCacheItems);
        if(paginationCheck.searchOnRedis){
            return ({searchOnRedis:true,paginationChanges:paginationCheck.paginationChanges});
        }else{
            return({searchOnRedis:false});
        }
    }else{
        return({searchOnRedis:false});
    }


    // if(pagination){
    //     var observationsCacheItems=conf.cmcIoTOptions.observationsCacheItems;
    //     if(!pagination.limit){
    //
    //     }else{
    //         var onlyDeviceFilter;
    //         if(((_.keys(searchFilters).length)===1) && (searchFilters.devicesId)) { // only devices filter
    //             onlyDeviceFilter=true;
    //             observationsCacheItems *= searchFilters.devicesId.length;
    //         }
    //
    //         if((!pagination.limitByDefault) && (((pagination.skip || 0 ) + pagination.limit)>observationsCacheItems)){
    //             return({searchOnRedis:false});
    //         }else{
    //             if(searchFilters && !_.isEmpty(searchFilters)){ // there are search filters
    //                 if(onlyDeviceFilter) { // only devices filter
    //                     if(pagination.limitByDefault) {
    //                         pagination.limit = observationsCacheItems;
    //                     }
    //                     return ({searchOnRedis:true,paginationChanges:pagination});
    //                 }
    //                 else{
    //                     return({searchOnRedis:false});  // search with more filters
    //                 }
    //             }else{  // no filters then return all obs
    //                 return({searchOnRedis:false});
    //             }
    //         }
    //     }
    // }else{
    //     return(false);
    // }


};


function searchOnDbAndPopulateRedis(devicesId,callBackFunction){

    var observationsList=[];
    async.each(devicesId, function(deviceId, callback) {
        observationsDriver.find({deviceId:deviceId},null,{lean:true, sort:{timestamp:"desc"},skip:0, limit:conf.cmcIoTOptions.observationsCacheItems},function(err,deviceObservations){
            if(err){
                callback(err);
            }else{
                observationsList=observationsList.concat(deviceObservations);
                redisHandler.saveObservationsToCache(deviceId,deviceObservations.reverse());
                callback();
            }
        });
    }, function(err) {
        callBackFunction(err,{
            observations:observationsList
        });
    });
};


// pagination(limit) must be set otherwise, search go onto database search branch
function searchOnRedis(devicesId,pagination,callbackValues){
    var observationsList=[];
    var notAvailableOnRedis=[];
    async.each(devicesId, function(deviceId, callback) {
        redisHandler.getObservationsFromCache(deviceId,{limit:pagination.limit,returnAsObject:true},function(err,deviceObservations){
            if(deviceObservations.length>0)
                observationsList=observationsList.concat(deviceObservations);
            else notAvailableOnRedis.push(deviceId);
            callback(err);
        })
    }, function(err) {
        if( err ) {
            callbackValues(err,null);
        } else {
            if(notAvailableOnRedis.length>0){
                searchOnDbAndPopulateRedis(devicesId,function(err,databaseObs){
                    if(err) callbackValues(err,null);
                    else{
                        observationsList=observationsList.concat(databaseObs.observations);
                        callbackValues(null,{
                            observations:_.sortBy(observationsList, "timestamp").reverse(),
                            source:"Redis Cache - Database"
                        });
                    }
                })
            }else{
                callbackValues(null,{
                    observations:_.sortBy(observationsList, "timestamp").reverse(),
                });
            }
        }
    });
};

function  databaseSearch(searchFields,pagination,returnOnlyObservationsId,callBackFunction){


    var fieldsToReturn= returnOnlyObservationsId ? "_id location timestamp" : null;

    observationUtility.validateSearchFieldsAndGetQuery(searchFields,function(err,queryObj){
        if(err){
            return callBackFunction(err,null);
        }else{
            observationsDriver.find(queryObj.query,fieldsToReturn,{lean:true, sort:{timestamp:"desc"}},function(err,queryResults){
                if(err){
                    return callBackFunction(err,null);
                } else{
                    if(queryObj.locationInfo){ // filter by location and distance is set
                        var dstOpt=searchFields.location.distanceOptions;
                        dstOpt.mode=queryObj.locationInfo.mode;
                        locationSearchUtility.filterByOptions(queryResults,dstOpt,queryObj.locationInfo.centre.point,searchFields.location.distance,["_id"],'observation',returnOnlyObservationsId,function(err,foundedObservations){
                            if(err) {
                                return callBackFunction(err,null);
                            }else{
                                return callBackFunction(null,foundedObservations);
                            }
                        });
                    } else{
                        var foundedItems;
                        if(returnOnlyObservationsId) {
                            foundedItems = _.map(queryResults, function (item) {
                                return (item._id);
                            });
                        }else foundedItems=queryResults;
                        return callBackFunction(null,{
                            observations:foundedItems
                        });
                    }
                }
            });
        }
    });
}

function setResponseWithMetadata(observations,pagination,source,callBackFunction){

    if(!pagination){
        observations['_metadata']={
            skip: 0,
            limit: (pagination && pagination.limit) || "-1",
            totalCount:(observations && observations.observations && observations.observations.length),
            source:source
        };
        callBackFunction(null,observations);
    }else{
        var foundedObservation=observations['observations'];
        var distances=observations['distances'];
        var start=pagination.skip || 0;
        var stop=pagination.limit ? pagination.limit+start : undefined ;

        observations['observations']=foundedObservation.slice(start, stop);
        if(distances)
            observations['distances']=distances.slice(start, stop);

        observations['_metadata']={
            skip: start,
            limit: (pagination && pagination.limit) || "-1",
            totalCount:foundedObservation.length,
            source:source
        };
        return callBackFunction(null,observations);
    }
}

/* Observation Search Filters*/
// timestamp: {From:, To;}
// value: {min:, max:}
// location: {centre:{coordinates:[]}, distance: ,  distanceOptions: }
// devicesId: [ids]
// unitsId: { ids:}
module.exports.searchFilter= function(searchFields,pagination,returnOnlyObservationsId,callBackFunction) {
    var searchOnRedisFirst=mustSearchOnRedisFirst(searchFields,pagination);
    if(searchOnRedisFirst.searchOnRedis){
        var source="Redis cache";
        pagination=searchOnRedisFirst.paginationChanges || pagination;
        searchOnRedis(searchFields.devicesId,pagination,function(err,observationList){
            if(err){
                callBackFunction(err,null);
            }else{
                setResponseWithMetadata(observationList,pagination,observationList.source || source,callBackFunction);
            }
       });
   }else{
       databaseSearch(searchFields,pagination,returnOnlyObservationsId,function(err,observationList){
           if(err){
               callBackFunction(err,null);
           }else{
               setResponseWithMetadata(observationList,pagination,"Database",callBackFunction);
           }
       });
   }
};

// //TODO: remove after redis integration complete
// module.exports.searchFilter= function(searchFields,pagination,returnOnlyObservationsId,callBackFunction) {
//
//
//     var observationLabel="observation";
//
//     var fieldsToReturn= returnOnlyObservationsId ? "_id location" : null;
//
//     observationUtility.validateSearchFieldsAndGetQuery(searchFields,function(err,queryObj){
//         if(err){
//             return callBackFunction(err,null);
//         }else{
//             observationsDriver.find(queryObj.query,fieldsToReturn,{lean:true, sort:{_id:"desc"}},function(err,queryResults){
//                 if(err){
//                     return callBackFunction(err,null);
//                 } else{
//                     if(queryObj.locationInfo){ // filter by location and distance is set
//                         var dstOpt=searchFields.location.distanceOptions;
//                         dstOpt.mode=queryObj.locationInfo.mode;
//                         locationSearchUtility.filterByOptions(queryResults,dstOpt,queryObj.locationInfo.centre.point,searchFields.location.distance,["_id"],observationLabel,returnOnlyObservationsId,function(err,foundedObservations){
//                             if(err) {
//                                 return callBackFunction(err,null);
//                             }else{
//                                 return callBackFunction(null,foundedObservations);
//                             }
//                         });
//                     } else{
//                         var resp={};
//                         var foundedItems;
//                         if(returnOnlyObservationsId) {
//                             foundedItems = _.map(queryResults, function (item) {
//                                 return (item._id);
//                             })
//                         }else foundedItems=queryResults;
//                         resp[observationLabel+"s"]=foundedItems;
//                         return callBackFunction(null,resp);
//                     }
//                 }
//             });
//         }
//     });
// };


/* GET Observations list */
module.exports.findAll = function(conditions, fields, options, callback) {
    observationsDriver.findAll(conditions, fields, options, callback);
}


/* Create Observations. */
module.exports.create = observationUtility.create;

// /* Create Observations. */
// module.exports.insertMany = function(observationsArray, callback) {
//     observationsDriver.insertMany(observationsArray,callback);
// };


/* delete Observations. */
module.exports.deleteMany = observationUtility.deleteMany;


/* findOne Observation */
module.exports.findOne = function(conditions, projection, options, callback) {
    observationsDriver.findOne(conditions, projection, options, callback);
};


/* findOne Observation by ID */
module.exports.findById = function(id, projection, options, callback) {
    observationsDriver.findById(id, projection, options, callback)
}


/* findOne Observation and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    observationsDriver.findByIdAndUpdate(id, newFields, function(err,updatedObservation){
        if(callback) callback(err,updatedObservation);
        if(updatedObservation)
            redisHandler.removeObservationsFromCache([updatedObservation.deviceId.toString()]);
    });
}


/* findOne Observation by ID and remove it */
module.exports.findByIdAndRemove = function(id, options, callback) {
    if(!callback){
        if(options) {
            callback = options;
            options = null;
        }
    }
    observationsDriver.findByIdAndRemove(id, options, function(err,removedObservation){
        if(callback) callback(err,removedObservation);
        if(removedObservation)
            redisHandler.removeObservationsFromCache([removedObservation.deviceId.toString()]);
    });
};

/* GET Observations list */
module.exports.find = function(conditions, fields, options, callback) {
    observationsDriver.find(conditions, fields, options,callback);
};

/* GET/SET Observations ObjectId. */
module.exports.ObjectId = function(ObjectId) {
    return (observationsDriver.ObjectId(ObjectId));
}


/* Create Observations. */
module.exports.errorResponse = function(res, err) {
    observationsDriver.errorResponse(res,err);
};

// module.exports.getModel = function() {
//     return (observationsDriver.getModel());
// };

module.exports.validateObservationsBeforeUpdate = observationUtility.validateObservationsBeforeUpdate;

module.exports.validateAndCreateObservations = function (deviceId, observations, callback) {

    observationUtility.validateAndUpdateDeviceObservations(null,deviceId, observations, function (err, validatedObservations) {
        if (err){
            err.message = "Unprocessable observation " + (err.observation ? err.observation + " " : "")  + "for a device " + deviceId + " due to " + err.message;
            callback(err,null);
        } else{
            observationUtility.createObservations(validatedObservations,callback);
        }
    });

};

module.exports.checkIfValid = function (deviceId, observation, callback) {

    observationUtility.validateAndUpdateDeviceObservations(null,deviceId, [observation], function (err, validatedObservations,deviceStatus) {
        if (err){
            callback(err,null);
        } else{
            callback(null,{authorized:true,authInfo:deviceStatus});
        }
    });
};


module.exports.validateAndCreateThingObservations = function (thingId, observations, callback) {
    var validatedObservationsList={};
    thingAndDeviceHandlerUtility.getThingStatus(thingId,function(err,thingStatus){
       if(!err){
           async.eachOf(observations, function (deviceObservations,deviceId ,callbackfunction) {
               observationUtility.validateThingObservations(thingId,thingStatus, deviceId, deviceObservations, function (err, validatedDeviceObservations) {
                   validatedObservationsList[deviceId]=validatedDeviceObservations;
                   callbackfunction(err);
               });
           }, function (err) {
                if(!err){
                    var createdObservationsList={};
                    async.eachOfSeries(validatedObservationsList, function (deviceObservations,deviceId ,callbackfunction) {
                        observationUtility.createObservations(deviceObservations,function(err,crestedObservations){
                                if(!err)
                                    createdObservationsList[deviceId]=crestedObservations;
                                callbackfunction(err);
                            });
                    }, function (err) {
                        if(!err){
                            callback(null,createdObservationsList);
                        }else{
                            observationUtility.restoreThingsObservationsStatus(createdObservationsList,function(errRestore){
                                if(errRestore){
                                    callback(errRestore,null);
                                }else{
                                    callback(err,null)
                                }
                            });
                        }
                    });
                }else{
                    callback(err,null)
                }
           });
       } else{
           callback(err,null);
       }
    });

};







