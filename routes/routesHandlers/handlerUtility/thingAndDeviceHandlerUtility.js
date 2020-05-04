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
var thingDriver = require('../../../DBEngineHandler/drivers/thingDriver');
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var async = require('async');

var _ = require('underscore');


//Begin macro
/**
 * @apiDefine Metadata
 * @apiSuccess {Object} _metadata Object containing pagination info
 * @apiSuccess {Number} _metadata.skip Number of query results skipped
 * @apiSuccess {Number} _metadata.limit Limits the number of results returned by this query
 * @apiSuccess {Number} _metadata.totalCount If specified in the request, it contains the total number of query results; it is false otherwise
 */
/**
 * @apiDefine  Pagination
 * @apiParam (Query Parameter) {Number}   [skip]       Pagination skip parameter - skips the first `n` results
 * @apiParam (Query Parameter) {Number}   [limit]      Pagination limit parameter - limits results total size to `n`
 * @apiParam (Query Parameter) {Boolean}  [totalCount] Pagination totalCount parameter. If true, in `_metadata` field `totalCount` parameter contains the total number of returned objects
 * @apiParam (Query Parameter) {String}   [sortAsc]    Ordering parameter - orders results by ascending values
 * @apiParam (Query Parameter) {String}   [sortDesc]   Ordering parameter - orders results by descending values
 */
/**
 * @apiDefine Projection
 * @apiParam (Query Parameter) {String}  [fields]  A list of comma separated field names to project in query results
 */
/**
 * @apiDefine NotFound
 * @apiError {Object} ResourceNotFound[404] The resource was not found <BR>
 *
 * @apiErrorExample {Object} NotFound Error:
 *  HTTP/1.1 404 Resource Not Found
 *   {
 *     "StatusCode": '404'
 *     "error": 'Not Found'
 *     "message": 'The resource was not found'
 *   }
 */
/**
 * @apiDefine  InternalServerError
 * @apiError  (5xx) {Object} InternalServerError[500] An internal server error occurred <BR>
 *
 * @apiErrorExample {Object} InternalServerError Error:
 *  HTTP/1.1 500 Internal Server Error
 *   {
 *     "StatusCode": '500'
 *     "error": 'Internal Server Error'
 *     "message": 'An internal server error occurred'
 *   }
 */
/**
 * @apiDefine  BadRequest
 * @apiError {Object} BadRequest[400] The server cannot or will not process the request due to malformed client request <BR>
 *
 * @apiErrorExample {Object} BadRequest Error:
 *  HTTP/1.1 400 Bad Request
 *   {
 *     "StatusCode": '400'
 *     "error": 'Bad Request'
 *     "message": 'Body field missing'
 *   }
 */
/**
 * @apiDefine  Unauthorized
 * @apiError {Object} Unauthorized[401] The client is not authorized to access this resource <BR>
 *
 * @apiErrorExample {Object} Unauthorized Error:
 *  HTTP/1.1 401 Unauthorized
 *   {
 *     "StatusCode": '401'
 *     "error": 'Unauthorized'
 *     "message": 'You are not authorized to access this resource'
 *   }
 */
/**
 * @apiDefine  NoContent
 * @apiError (2xx) {Object} NoContent[204] The server successfully processed the request but no content is found <BR>
 *
 * @apiErrorExample NoContent Error:
 *  HTTP/1.1 204 NoContent
 *   {
 *   }
 */
//End macro

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
