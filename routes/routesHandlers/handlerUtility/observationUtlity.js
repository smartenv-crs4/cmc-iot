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
var redisNotificationServiceHandler = require('../../../DBEngineHandler/drivers/redisPushNotificationDriver');
var thingAndDeviceHandlerUtility = require("./thingAndDeviceHandlerUtility");
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var locationSearchUtility = require("./locationSearchUtility");
var conf=require('propertiesmanager').conf;
var async = require('async');
var _ = require('underscore');
var redisNotificationPrefix=conf.redisPushNotification.notificationChannelsPrefix.observations;


const observationsUtilityFunctions = {

    validateUnitAndValueRange(deviceStatus, observation, callback) {
        var valid = false;
        var interval = false;

        if (deviceStatus.units) {
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
        } else {
            var Err = new Error("No observed property measure unit associated to this device. You must set it before send observation");
            Err.name = "ConflictError";
            callback(Err);
        }
    },


    locationHandler(observation, deviceStatus, callback) {
        if (deviceStatus.thing.mobile) { // it is a mobile device
            if (observation.location && observation.location.coordinates) { // valid coordinates
                siteDriver.locationValidator(observation.location, function (err) {
                    callback(err, observation);
                });
                // callback(null,observation);
            } else {
                var Err = new Error("Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices");
                Err.name = "BadRequestError";
                callback(Err, null, null);
            }
        } else { // it is a not mobile device
            if (observation.location) { // has location
                var Err = new Error("Location field must be set only for mobile devices.");
                Err.name = "unprocessableError";
                callback(Err, null, null);

            } else {
                observation.location = deviceStatus.location;
                callback(null, observation);
            }
        }
    },


    validateAndUpdateObservationContent(id, observation, deviceStatus, callback) {

        // -  verifica se il device può fare una scrittura [disabled,dismissed]
        // e se è l'unitadi misura è compattibile col suo device Type
        // - se non c'è su memm cache allora controlla sul database
        // - Salva su mem cache Redis le autorizzazioni del device [dismissed, disabled, validUnits[unit1,unit2,.....]

        observationsUtilityFunctions.locationHandler(observation, deviceStatus, function (err, updateObservation) {
            if (!err) {

                if (deviceStatus.dismissed) {
                    Err = new Error("The device/thing was removed from available devices/things.");
                    Err.name = "DismissedError";
                    callback(Err)
                } else {
                    if (deviceStatus.disabled) {
                        Err = new Error("The device/thing was disable. It must be enabled to set observations.");
                        Err.name = "DisabledError";
                        callback(Err)
                    } else {
                        if (!(updateObservation.value == undefined)) {
                            if (updateObservation.unitId) {

                                observationsUtilityFunctions.validateUnitAndValueRange(deviceStatus, updateObservation, function (err) {
                                    if (!err) {
                                        updateObservation.deviceId = id;
                                        callback(null, {authorized: true, updatedObservation: updateObservation})
                                    } else {
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
            } else {
                callback(err);
            }
        });
    },

    validateAndUpdateDeviceObservations(thingId, deviceId, observations, callback) {

        thingAndDeviceHandlerUtility.getDeviceStatus(deviceId, true, function (err, deviceStatus) {
            if (!err) {

                if (thingId && thingId != deviceStatus.thing._id) {
                    var Err = new Error("Unprocessable request due to device '" + deviceId + "' is not associated to thing '" + thingId + "'");
                    Err.name = "unprocessableError";
                    callback(Err);
                } else {
                    var updatedObservations = [];

                    async.each(observations, function (observation, callbackfunction) {
                        observationsUtilityFunctions.validateAndUpdateObservationContent(deviceId, observation, deviceStatus, function (err, validationResults) {
                            if (err) {
                                err.observation = JSON.stringify(observation);
                            } else {
                                updatedObservations.push(validationResults.updatedObservation);
                            }
                            callbackfunction(err);
                        });
                    }, function (err) {
                        callback(err, updatedObservations, deviceStatus);
                    });
                }
            } else {
                err.observation = null;
                callback(err);
            }
        });
    },


    validateObservationsBeforeUpdate(updateObservation, callback) {


        thingAndDeviceHandlerUtility.getDeviceStatus(updateObservation.deviceId, false, function (err, deviceStatus) {
            if (!err) {
                if (deviceStatus) {
                    observationsUtilityFunctions.validateUnitAndValueRange(deviceStatus, updateObservation, function (err) {
                        if (!err) {
                            siteDriver.locationValidator(updateObservation.location, function (err) {
                                callback(err, {authorized: true, updatedObservation: updateObservation})
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    Err = new Error("The device not exist.");
                    Err.name = "NotExistError";
                    callback(Err, null);
                }
            } else {
                err.observation = null;
                callback(err);
            }
        });
    },


    restoreDeviceObservationsStatus(observationsToDelete, callback) {

        if (observationsToDelete.length > 0) {
            var deleteList = _.map(observationsToDelete, function (obs) {
                return obs._id;
            });

            //TODO: Try to handle data inconsistent if deletion is not completed
            observationsUtilityFunctions.deleteMany({_id: {"$in": deleteList}}, function (errDelete) {
                if (errDelete)
                    callback(new Error("Observations: inconsistent data due to error in delete invalid observations--> " + observationsToDelete), null);
                else callback(null);
            });
        } else {
            callback(null);
        }
    },


    restoreThingsObservationsStatus(observationsToDelete, callback) {

        var observations = [];
        async.each(observationsToDelete, function (observation, clbFun) {
            observations = observations.concat(observation);
            clbFun();
        }, function (err) {
            observationsUtilityFunctions.restoreDeviceObservationsStatus(observations, function (errDeleteDevObs) {
                callback(errDeleteDevObs);
            });
        });
    },


    createObservations(observations, callback) {
        var createdResourcesId = [];
        async.eachSeries(observations, function (observation, clbFun) {
            observationsUtilityFunctions.create(observation, function (err, createdObservation) {
                if (createdObservation)
                    createdResourcesId.push(createdObservation);
                clbFun(err);
            });
        }, function (err) {
            if (!err) {
                callback(null, createdResourcesId);
            } else {

                observationsUtilityFunctions.restoreDeviceObservationsStatus(createdResourcesId, function (errorInRestore) {
                    if (errorInRestore) {
                        callback(errorInRestore, null);
                    } else {
                        callback(err, null);
                    }
                });
            }
        });
    },


    validateThingObservations(thingId, thingStatus, deviceId, observations, callback) {


        if (thingStatus) {
            if (thingStatus.dismissed) {
                Err = new Error("The thing '" + thingId + "' was removed from available devices/things.");
                Err.name = "DismissedError";
                callback(Err)
            } else {
                if (thingStatus.disabled) {
                    Err = new Error("The thing '" + thingId + "' was disable. It must be enabled to set observations.");
                    Err.name = "DisabledError";
                    callback(Err)
                } else {

                    observationsUtilityFunctions.validateAndUpdateDeviceObservations(thingId, deviceId, observations, function (err, validatedObservations) {
                        if (err) {
                            err.message = "Unprocessable observation " + (err.observation ? err.observation + " " : "") + "for a device " + deviceId + " due to " + err.message;
                            callback(err, null);
                        } else {
                            callback(null, validatedObservations);
                        }
                    });

                }
            }
        } else {
            Err = new Error("The thing '" + thingId + "' not exist.");
            Err.name = "DismissedError";
            callback(Err)
        }


    },

    setError(msg) {
        var customError = new Error(msg);
        customError.name = "ValidatorError";
        return (customError);
    },


    isDefined(item) {
        return (!(_.isUndefined(item) || _.isNull(item)));
    },


    validateSearchFieldsAndGetQuery(searchFields, callback) {

        var queryObj = {};

        async.series({
            one: function (cl) {
                var customError;
                if (searchFields.timestamp) {
                    var from = searchFields.timestamp.from;
                    var to = searchFields.timestamp.to;
                    if (!from && !to) {
                        customError = observationsUtilityFunctions.setError("timestamp filter must be {from:'startDate' , to:'stopDate'}. if timestamp is set, the fields 'from' and 'to' cannot be both null");
                    } else {
                        queryObj["timestamp"] = {};
                        if (from) queryObj.timestamp['$gte'] = from;
                        if (to) queryObj.timestamp['$lte'] = to;
                    }
                }
                if (!customError) {
                    if (searchFields.value) {
                        var min = searchFields.value.min;
                        var max = searchFields.value.max;
                        if (!_.isNumber(min) && !_.isNumber(max)) {
                            customError = observationsUtilityFunctions.setError("value filter must be {min:'minValue' , max:'maxValue'}. if value is set, the fields 'min' and 'max' cannot be both null");
                        } else {
                            queryObj["value"] = {};
                            if (_.isNumber(min)) queryObj.value['$gte'] = min;
                            if (_.isNumber(max)) queryObj.value['$lte'] = max;
                        }
                    }
                    if (!customError) {
                        if (searchFields.devicesId) {
                            if (!(_.isArray(searchFields.devicesId))) {
                                customError = observationsUtilityFunctions.setError("devicesId must be an array of device id");
                            } else {
                                queryObj["deviceId"] = {"$in": searchFields.devicesId};
                            }
                        }

                        if (!customError) {
                            if (searchFields.unitsId) {
                                if (!(_.isArray(searchFields.unitsId))) {
                                    customError = observationsUtilityFunctions.setError("unitsId must be an array of units id");
                                } else {
                                    queryObj["unitId"] = {"$in": searchFields.unitsId};
                                }
                            }
                        }
                    }
                }

                cl(customError, true);
            },
            two: function (cl) {
                if (observationsUtilityFunctions.isDefined(searchFields.location)) {
                    if (searchFields.location.centre) {
                        locationSearchUtility.getSearchByLocationQuery(searchFields.location.centre, searchFields.location.distance, searchFields.location.distanceOptions, function (err, locationQuery) {
                            if (err) {
                                err.message += ". Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}"
                                cl(err, null);
                            } else {
                                queryObj = _.extend(queryObj, locationQuery.query);
                                cl(null, {centre: locationQuery.centre, mode: locationQuery.mode});
                            }
                        });
                    } else {
                        cl(observationsUtilityFunctions.setError("location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}"));
                    }

                } else {
                    cl(null, false)
                }
            }
        }, function (err, results) {
            if (err) callback(err);
            else callback(null, {query: queryObj, locationInfo: results.two});
        });
    },


    deleteMany(conditions, options, callback) {
        if (!callback) {
            if (options) {
                callback = options;
                options = null;
            }
        }
        observationsDriver.deleteMany(conditions, options, function (err, deletedItems) {
            if (callback) callback(err, deletedItems);
            redisHandler.removeObservationsFromCache(_.keys(deletedItems));
        });
    },

    create(observation, callback) {
        observationsDriver.create(observation, function (err, createdObservation) {
            if (callback) callback(err, createdObservation);
            if (createdObservation) {
                redisHandler.saveSingleObservationToCache(createdObservation);
                redisNotificationServiceHandler.publish(redisNotificationPrefix+createdObservation.deviceId,JSON.stringify(createdObservation));
            }
        });
    }
};

module.exports=observationsUtilityFunctions;

