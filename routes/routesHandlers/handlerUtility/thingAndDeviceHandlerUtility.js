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
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var async = require('async');

var _ = require('underscore');





function getDevLocation(deviceInfo,callback){
    //{type: "Point", coordinates: [1, 1]},
    if(deviceInfo){
        if(deviceInfo.thing.mobile){ // it is a mobile device
            callback(null,deviceInfo);
        }else{ // it is a not mobile device
            var siteLocation=null;
            var siteId=deviceInfo.thing.siteId;
            async.whilst(
                function test() {
                    return (siteLocation==null);
                },
                function iter(next) {
                    siteDriver.findById(siteId,null,null,function(err,siteInfo){
                        if(!err) {
                            siteLocation = (siteInfo && siteInfo.location && siteInfo.location.coordinates && (siteInfo.location.coordinates.length > 0)) ? siteInfo.location : null;
                            siteId = siteInfo.locatedInSiteId;
                        }
                        next(err,siteLocation);
                    })
                },
                function (err, locationSite) {
                    if(!err){
                        deviceInfo.location=locationSite;
                    }
                    callback(err,deviceInfo);
                }
            );
        }
    }else{
        Err = new Error("The device/thing not exist.");
        Err.name = "NotExistError";
        callback(Err, null);
    }
}

module.exports.getDeviceLocation =function (deviceInfo,callback){
    getDevLocation(deviceInfo,callback);
}


module.exports.getDeviceStatus=function getDeviceStatus(deviceId,extractLocation,callback){
    // check if Resdis store device Stutus Information. If yes return It otherwise check info into Database

    var redis = false; //TODO: change with redis check

    try {
        var validDeviceId = deviceDriver.ObjectId(deviceId);
        if (redis) {
            callback(redis);  // todo change with deviceInfo from Redis
        } else {
            // check device info and valid units into database
            deviceDriver.aggregate([
                {
                    $match: {_id: validDeviceId}
                },
                {
                    $lookup: {
                        from: 'devicetypes',
                        localField: 'typeId',
                        foreignField: '_id',
                        as: 'deviceType'
                    }

                },
                {$unwind: "$deviceType"},
                {
                    $lookup: {
                        from: 'things',
                        localField: 'thingId',
                        foreignField: '_id',
                        as: 'thing'
                    }

                },
                {$unwind: "$thing"},
                {
                    $lookup: {
                        from: 'observedproperties',
                        localField: 'deviceType.observedPropertyId',
                        foreignField: '_id',
                        as: 'observedProperty'
                    }

                },
                {$unwind: "$observedProperty"},
                {
                    $lookup: {
                        from: 'units',
                        localField: 'observedProperty._id',
                        foreignField: 'observedPropertyId',
                        as: 'units'
                    }

                },
                {
                    $project: {
                        dismissed: 1,
                        disabled: 1,
                        "units._id": 1,
                        "units.minValue": 1,
                        "units.maxValue": 1,
                        "thing.mobile":1,
                        "thing.siteId":1,
                        "thing._id":1
                        // name: 0,
                        // description: 0,
                        // thingId: 0,
                        // typeId: 0,
                        // deviceType: 0,
                        // observedProperty:0
                    }
                }
            ], function (err, results) {
                if(!err){
                    if(extractLocation)
                        getDevLocation(results[0] || null ,callback);
                    else
                        callback(null,results[0]|| null)
                }else{
                    callback(err);
                }

            });
        }
    }catch (exception) {
        var Err = new Error(deviceId + " is a not valid ObjectId");
        Err.name = "BadRequestError";
        callback(Err);
    }
}



module.exports.getThingStatus=function getThingStatus(thingId,callback){
    if(thingId) {
        var redis = false; //TODO: change with redis check

        if (redis) {
            callback(redis);  // todo change with deviceInfo from Redis
        } else {
            thingDriver.findById(thingId, "disabled dismissed", null, function (err, thingStatus) {
                if (!err) {
                    callback(null, thingStatus);
                } else {
                    callback(err, null);
                }
            });
        }
    }else{
        var Err = new Error("data validation failed: thingId is required.");
        Err.name = "BadRequestError";
        callback(Err);
    }
};
