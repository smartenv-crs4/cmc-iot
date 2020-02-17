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

var deviceDriver = require('../../../DBEngineHandler/drivers/deviceDriver');
var observationsDriver = require('../../../DBEngineHandler/drivers/observationDriver');
var thingDriver = require('../../../DBEngineHandler/drivers/thingDriver');
var thingAndDeviceHandlerUtility=require("./thingAndDeviceHandlerUtility");
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var async = require('async');

var _ = require('underscore');



function validateUnitAndValueRange(deviceStatus, observation, callback) {

    var valid = false;
    var interval = false;
    deviceStatus.units.forEach(function (unit) {

        if (unit._id.toString() === observation.unitId.toString()) {
            valid = true;
            if ((observation.value >= unit.minValue) && (observation.value <= unit.maxValue))
                interval = true;
        }
    });
    if (valid) {
        if (interval) { // it pass all verification tests
            callback(null);
        } else { // observation out of range
            var Err = new Error("The observation value is out of range.");
            Err.name = "outOfRangeError";
            callback(Err);
        }

    } else { // not valid unitId for this device Type
        var Err = new Error("Not a valid unitId for this device type.");
        Err.name = "DeviceTypeError";
        callback(Err);
    }
}



function locationHandler(observation, deviceStatus, callback){


    if(deviceStatus.thing.mobile){ // it is a mobile device
        if(observation.location && observation.location.coordinates){ // valid coordinates
            siteDriver.locationValidator(observation.location,function(err){
                callback(err,observation);
            });

            // callback(null,observation);

        }else{
            var Err = new Error("Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices");
            Err.name = "BadRequestError";
            callback(Err, null, null);
        }
    }else{ // it is a not mobile device
        if(observation.location){ // has location
            var Err = new Error("Location field must be set only for mobile devices.");
            Err.name = "unprocessableError";
            callback(Err, null, null);

        }else{
            observation.location=deviceStatus.location;
            callback(null,observation);
        }
    }
}


function validateAndUpdateObservationContent(id, observation, deviceStatus, callback) {

    // -  verifica se il device può fare una scrittura [disabled,dismissed]
    // e se è l'unitadi misura è compattibile col suo device Type
    // - se non c'è su memm cache allora controlla sul database
    // - Salva su mem cache Redis le autorizzazioni del device [dismissed, disabled, validUnits[unit1,unit2,.....]

    locationHandler(observation,deviceStatus,function(err,updateObservation){
        if(!err){

            if (deviceStatus.dismissed) {
                Err = new Error("The device/thing was removed from available devices/things.");
                Err.name = "DismissedError";
                callback(Err)
            } else {
                if (deviceStatus.disabled) {
                    Err = new Error("The device/thing was disable. It must be enabled to set observations.");
                    Err.name = "DisabledError";
                    callback(Err)
                }else{
                    if (!(updateObservation.value==undefined)) {
                        if (updateObservation.unitId) {

                            validateUnitAndValueRange(deviceStatus, updateObservation, function(err){
                                if(!err){
                                    updateObservation.deviceId=id;
                                    callback(null,{authorized:true,updatedObservation:updateObservation})
                                }else {
                                    callback(err);
                                }
                            });
                        } else {
                            var Err = new Error("Observation 'unitId' field missing");
                            Err.name = "ValidatorError";
                            callback(Err)
                        }
                    } else {
                        var Err = new Error("Observation 'value' field missing");
                        Err.name = "ValidatorError";
                        callback(Err)
                    }
                }
            }
        }else {
            callback(err);
        }
    });
}





// function getDeviceLocation(deviceInfo,callback){
//     //{type: "Point", coordinates: [1, 1]},
//
//
//     if(deviceInfo){
//         if(deviceInfo.thing.mobile){ // it is a mobile device
//             callback(null,deviceInfo);
//         }else{ // it is a not mobile device
//             var siteLocation=null;
//             var siteId=deviceInfo.thing.siteId;
//             async.whilst(
//                 function test() {
//                     return (siteLocation==null);
//                 },
//                 function iter(next) {
//                     siteDriver.findById(siteId,null,null,function(err,siteInfo){
//                         if(!err) {
//                             siteLocation = (siteInfo && siteInfo.location && siteInfo.location.coordinates && (siteInfo.location.coordinates.length > 0)) ? siteInfo.location : null;
//                             siteId = siteInfo.locatedInSiteId;
//                         }
//                         next(err,siteLocation);
//                     })
//                 },
//                 function (err, locationSite) {
//                     if(!err){
//                         deviceInfo.location=locationSite;
//                     }
//                     callback(err,deviceInfo);
//                 }
//             );
//         }
//     }else{
//         Err = new Error("The device/thing not exist.");
//         Err.name = "NotExistError";
//         callback(Err, null);
//     }
// }


// function getDeviceStatus(deviceId,callback){
//     // check if Resdis store device Stutus Information. If yes return It otherwise check info into Database
//
//     var redis = false; //TODO: change with redis check
//
//     try {
//         var validDeviceId = deviceDriver.ObjectId(deviceId);
//         if (redis) {
//             callback(redis);  // todo change with deviceInfo from Redis
//         } else {
//             // check device info and valid units into database
//             deviceDriver.aggregate([
//                 {
//                     $match: {_id: validDeviceId}
//                 },
//                 {
//                     $lookup: {
//                         from: 'devicetypes',
//                         localField: 'typeId',
//                         foreignField: '_id',
//                         as: 'deviceType'
//                     }
//
//                 },
//                 {$unwind: "$deviceType"},
//                 {
//                     $lookup: {
//                         from: 'things',
//                         localField: 'thingId',
//                         foreignField: '_id',
//                         as: 'thing'
//                     }
//
//                 },
//                 {$unwind: "$thing"},
//                 {
//                     $lookup: {
//                         from: 'observedproperties',
//                         localField: 'deviceType.observedPropertyId',
//                         foreignField: '_id',
//                         as: 'observedProperty'
//                     }
//
//                 },
//                 {$unwind: "$observedProperty"},
//                 {
//                     $lookup: {
//                         from: 'units',
//                         localField: 'observedProperty._id',
//                         foreignField: 'observedPropertyId',
//                         as: 'units'
//                     }
//
//                 },
//                 {
//                     $project: {
//                         dismissed: 1,
//                         disabled: 1,
//                         "units._id": 1,
//                         "units.minValue": 1,
//                         "units.maxValue": 1,
//                         "thing.mobile":1,
//                         "thing.siteId":1,
//                         "thing._id":1
//                         // name: 0,
//                         // description: 0,
//                         // thingId: 0,
//                         // typeId: 0,
//                         // deviceType: 0,
//                         // observedProperty:0
//                     }
//                 }
//             ], function (err, results) {
//                 if(!err){
//                     thingAndDeviceHandlerUtility.getDeviceLocation(results[0] || null ,callback);
//                 }else{
//                     callback(err);
//                 }
//
//             });
//         }
//     }catch (exception) {
//         var Err = new Error(deviceId + " is a not valid ObjectId");
//         Err.name = "BadRequestError";
//         callback(Err);
//     }
//
//
//
//
// }



function validateAndUpdateDeviceObservations(thingId,deviceId,observations,callback){

    thingAndDeviceHandlerUtility.getDeviceStatus(deviceId,function(err,deviceStatus){
        if(!err){

            if(thingId && thingId!=deviceStatus.thing._id){
                var Err=new Error("Unprocessable request due to device '" + deviceId + "' is not associated to thing '" + thingId + "'");
                Err.name = "unprocessableError";
                callback(Err);
            }else{
                var updatedObservations=[];

                async.each(observations, function (observation, callbackfunction) {
                    validateAndUpdateObservationContent(deviceId, observation, deviceStatus, function (err, validationResults) {
                        if (err){
                            err.observation=JSON.stringify(observation);
                        } else{
                            updatedObservations.push(validationResults.updatedObservation);
                        }
                        callbackfunction(err);

                    });
                }, function (err) {
                    callback(err,updatedObservations,deviceStatus);
                });
            }


        }else{
            err.observation=null;
            callback(err);
        }

    });


}



function restoreDeviceObservationsStatus(observationsToDelete,callback){

    if (observationsToDelete.length > 0) {
        var deleteList = _.map(observationsToDelete, function (obs) {
            return obs._id;
        });

        //TODO: Try to handle data inconsistent if deletion is not completed
        observationsDriver.deleteMany({_id: {"$in": deleteList}}, function (errDelete) {
            if (errDelete)
                callback(new Error("Observations: inconsistent data due to error in delete invalid observations--> " + observationsToDelete), null);
            else callback(null);
        });
    } else {
        callback(null);
    }
}



function restoreThingsObservationsStatus(observationsToDelete,callback){

    var observations=[];
    async.each(observationsToDelete, function (observation, clbFun) {
        observations=observations.concat(observation);
       clbFun();
    }, function (err) {
        restoreDeviceObservationsStatus(observations,function(errDeleteDevObs){
            callback(errDeleteDevObs);
        });
    });
}


function createObservations(observations,callback){
    var createdResourcesId = [];
    async.eachSeries(observations, function (observation, clbFun) {
        observationsDriver.create(observation, function (err, createdObservation) {
            if (createdObservation)
                createdResourcesId.push(createdObservation);
            clbFun(err);
        });
    }, function (err) {
        if (!err) {
            callback(null, createdResourcesId);
        } else {

            restoreDeviceObservationsStatus(createdResourcesId,function(errorInRestore){
                if(errorInRestore){
                    callback(errorInRestore,null);
                }else{
                    callback(err,null);
                }
            });
        }
    });
}



function validateThingObservations(thingId, thingStatus,deviceId,observations,callback){


    if(thingStatus){
        if(thingStatus.dismissed){
            Err = new Error("The thing '" +thingId + "' was removed from available devices/things.");
            Err.name = "DismissedError";
            callback(Err)
        }else{
            if(thingStatus.disabled){
                Err = new Error("The thing '" +thingId + "' was disable. It must be enabled to set observations.");
                Err.name = "DisabledError";
                callback(Err)
            }else{

                validateAndUpdateDeviceObservations(thingId,deviceId, observations, function (err, validatedObservations) {
                    if (err){
                        err.message = "Unprocessable observation " + (err.observation ? err.observation + " " : "")  + "for a device " + deviceId + " due to " + err.message;
                        callback(err,null);
                    } else{
                        callback(null,validatedObservations);
                    }
                });

            }
        }
    }else{
        Err = new Error("The thing '" +thingId + "' not exist.");
        Err.name = "DismissedError";
        callback(Err)
    }



}


// function getThingStatus(thingId,callback){
//
//     var redis = false; //TODO: change with redis check
//
//     if (redis) {
//         callback(redis);  // todo change with deviceInfo from Redis
//     } else {
//         thingDriver.findById(thingId, "disabled dismissed", null, function (err, thingStatus) {
//             if (!err) {
//                callback(null,thingStatus);
//             } else {
//                 callback(err, null);
//             }
//         });
//     }
// }

module.exports.validateAndCreateObservations = function (deviceId, observations, callback) {

    validateAndUpdateDeviceObservations(null,deviceId, observations, function (err, validatedObservations) {
        if (err){
            err.message = "Unprocessable observation " + (err.observation ? err.observation + " " : "")  + "for a device " + deviceId + " due to " + err.message;
            callback(err,null);
        } else{
            createObservations(validatedObservations,callback);
        }
    });

};

module.exports.checkIfValid = function (deviceId, observation, callback) {


    validateAndUpdateDeviceObservations(null,deviceId, [observation], function (err, validatedObservations,deviceStatus) {
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
               validateThingObservations(thingId,thingStatus, deviceId, deviceObservations, function (err, validatedDeviceObservations) {
                   validatedObservationsList[deviceId]=validatedDeviceObservations;
                   callbackfunction(err);
               });
           }, function (err) {
                if(!err){
                    var createdObservationsList={};
                    async.eachOfSeries(validatedObservationsList, function (deviceObservations,deviceId ,callbackfunction) {
                            createObservations(deviceObservations,function(err,crestedObservations){
                                if(!err)
                                    createdObservationsList[deviceId]=crestedObservations;
                                callbackfunction(err);
                            });
                    }, function (err) {
                        if(!err){
                            callback(null,createdObservationsList);
                        }else{
                            restoreThingsObservationsStatus(createdObservationsList,function(errRestore){
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