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

var observationUtility = require('./handlerUtility/observationHandlerUtility');
var async=require("async");


//Begin macro
/**
 * @apiDefine ObservationBodyParams
 * @apiParam (Body Parameter)   {Object}    observation                         Observation dictionary with all the fields
 * @apiParam (Body Parameter)   {Number}    observation.timestamp               Observation timestamp
 * @apiParam (Body Parameter)   {Number}    observation.value                   Observation value
 * @apiParam (Body Parameter)   {Object}    [observation.location]              Observation location parent object
 * @apiParam (Body Parameter)   {Object}    [observation.location.coordinates]  Coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiParam (Body Parameter)   {ObjectId}  observation.deviceId                Observation Foreign Key to Device (See `/devices` API reference)
 * @apiParam (Body Parameter)   {ObjectId}  observation.unitId                  Observation Foreign Key to Unit (See `/units` API reference)
 */
/**
 * @apiDefine ObservationQueryParams
 * @apiParam (Query Parameter)  {String[]}  [observations]                      Search by Observation
 * @apiParam (Query Parameter)  {String[]}  [timestamp]                         Filter by Observation timestamp
 * @apiParam (Query Parameter)  {String[]}  [value]                             Filter by Observation value
 * @apiParam (Query Parameter)  {String[]}  [observation.location.coordinates]  Filter by Observation coordinates
 * @apiParam (Query Parameter)  {String[]}  [deviceId]                          Filter by Device. To get Device identifier look at `/devices` API
 * @apiParam (Query Parameter)  {String[]}  [unitId]                            Filter by Unit. To get Unit identifier look at `/units` API
 */
/**
 * @apiDefine PostObservationResource
 * @apiSuccess (201 - CREATED)  {Number}    timestamp                           Created Observation timestamp
 * @apiSuccess (201 - CREATED)  {Number}    value                               Created Observation value
 * @apiSuccess (201 - CREATED)  {Object}    location                            Created Observation location object
 * @apiSuccess (201 - CREATED)  {Object}    location.coordinates                Created Observation coordinates
 * @apiSuccess (201 - CREATED)  {String}    deviceId                            Created Observation Device identifier
 * @apiSuccess (201 - CREATED)  {String}    unitId                              Created Observation Unit identifier
 */
/**
 * @apiDefine PutObservationResource
 * @apiSuccess                  {Number}    timestamp                           Updated Observation timestamp
 * @apiSuccess                  {Number}    value                               Updated Observation value
 * @apiSuccess                  {Number}    location                            Updated Observation location object
 * @apiSuccess                  {Number}    location.coordinates                Updated Observation coordinates
 * @apiSuccess                  {String}    deviceId                            Updated Observation Device identifier
 * @apiSuccess                  {String}    unitId                              Updated Observation Unit identifier
 */
/**
 * @apiDefine GetAllObservationResource
 * @apiSuccess                  {Object[]}  observations                        Array list of Observation objects
 * @apiSuccess                  {String}    observations._id                    Observation identifier
 * @apiSuccess                  {Number}    observations.timestamp              Observation timestamp
 * @apiSuccess                  {Number}    observations.value                  Observation value
 * @apiSuccess                  {Object}    observations.location               Observation location parent object
 * @apiSuccess                  {Point}     observations.location.coordinates   Coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiSuccess                  {String}    observations.deviceId               Observation Device identifier
 * @apiSuccess                  {String}    observations.unitId                 Observation Unit identifier
 */
/**
 * @apiDefine GetObservationResource
 * @apiSuccess                  {String}    _id                                 Observation id
 * @apiSuccess                  {Number}    timestamp                           Observation timestamp
 * @apiSuccess                  {Number}    value                               Observation value
 * @apiSuccess                  {Object}    location                            Observation location parent object
 * @apiSuccess                  {Point}     location.coordinates                Coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiSuccess                  {String}    deviceId                            Observation Device identifier
 * @apiSuccess                  {String}    unitId                              Observation Unit identifier
 */
/**
 * @apiDefine PostObservationResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "timestamp": 1590364800,
 *        "value": 1,
 *        "location": {"coordinates": [83.4,78.3]},
 *        "deviceId": "543fdd60579e1281b8f6aa32",
 *        "unitId": "543fdd60579e1281b8f6de22"
 *      }
 */
/**
 * @apiDefine GetAllObservationResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "observations": [
 *                        {
 *                         "_id": "543fdd60579e1281b8f6cd34",
 *                         "timestamp": 1590364800,
 *                         "value": 1
 *                         "location": {"coordinates": [83.4,78.3]},
 *                         "deviceId": "543fdd60579e1281b8f6ce32",
 *                         "unitId": "543fdd60579e1281b8f6de22"
 *                        },
 *                        {
 *                         "_id": "543fdd60579e1281b8f6cd14",
 *                         "timestamp": 1590364801,
 *                         "value": 1.5
 *                         "location": {"coordinates": [83.4,78.3]},
 *                         "deviceId": "543fdd60579e1281b8f6ce32",
 *                         "unitId": "543fdd60579e1281b8f6de22"
 *                        }
 *                       ],
 *     }
 */
/**
 * @apiDefine GetObservationResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *          "_id": "543fdd60579e1281sdaf6da92",
 *          "timestamp": 1590364800,
 *          "value": 1
 *          "location": {"coordinates": [83.4,78.3]},
 *          "deviceId": "543fdd60579e1281b8f6ce32",
 *          "unitId": "543fdd60579e1281b8f6de22"
 *     }
 */
//End macro


/**
 * @api {post} /observations Create a new Observation
 * @apiVersion 1.0.0
 * @apiName PostObservation
 * @apiGroup Observations
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new Observation object and returns the newly created resource, or an error Object
 *
 * @apiUse ObservationBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /observations
 *  Body: {
 *          "observation": {
 *                          "timestamp": 1590364800,
 *                          "value": 1
 *                          "location": {"coordinates": [83.4,78.3]},
 *                          "deviceId": "543fdd60579e1281b8f6ce32",
 *                          "unitId": "543fdd60579e1281b8f6de22"
 *                         }
 *        }
 *
 * @apiUse PostObservationResource
 * @apiUse PostObservationResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateObservation = function(req, res, next) {
    if(!req.body.observation.deviceId){
        return res.httpResponse(null, 400, "Observation 'deviceId' field missing");
    }else {
        observationUtility.checkIfValid(req.body.observation.deviceId, req.body.observation, function (err, validityTestResult) {
            if (err) return res.httpResponse(err, null, null);
            else {
                observationUtility.create(req.body.observation, function (err, results) {
                    res.httpResponse(err, null, results);

                });
            }
        });
    }
};


/**
 * @api {get} /observations Get all Observations
 * @apiVersion 1.0.0
 * @apiName GetObservation
 * @apiGroup Observations
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Observations
 *
 * @apiUse ObservationQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /observations?value=1,1.5&field=timestamp,value&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse GetAllObservationResource
 * @apiUse GetAllObservationResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getObservations = function(req, res, next) {
    observationUtility.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
};


/**
 * @api {get} /observations/:id Get Observation by id
 * @apiVersion 1.0.0
 * @apiName GetObservationById
 * @apiGroup Observations
 * @apiPermission Access Token
 *
 * @apiDescription Returns an Observation object
 *
 * @apiParam (URL Parameter) {String}  id  The Observation identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /observations/543fdd60579e1281b8f6da92
 *
 * @apiUse GetObservationResource
 * @apiUse GetObservationResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getObservationById = function(req, res, next) {
    var id = req.params.id
    observationUtility.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
};


/**
 * @api {delete} /observations/:id Delete Observation
 * @apiVersion 1.0.0
 * @apiName DeleteObservationById
 * @apiGroup Observations
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given Observation by its identifier and returns the deleted resource
 *
 * @apiParam (URL Parameter) {String}  id The Observation identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /observations/543fdd60579e1281b8f6da92
 *
 * @apiUse GetObservationResource
 * @apiUse GetObservationResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteObservation = function(req, res, next) {
    var id = req.params.id
    observationUtility.findByIdAndRemove(id, function(err, deletedObservation) {
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


/**
 * @api {put} /observations Update an Observation
 * @apiVersion 1.0.0
 * @apiName PutObservation
 * @apiGroup Observations
 * @apiPermission Access Token
 *
 * @apiDescription Updates an Observation and returns the newly updated resource, or an error Object
 *
 * @apiUse ObservationBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /observations/543fdd60579e1281b8f6da92
 *  Body: {
 *          "observation": {"timestamp": 1590364800 , "value": 2}
 *        }
 *
 * @apiUse PutObservationResource
 * @apiUse GetObservationResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateObservation = function(req, res, next) {
    observationUtility.findById(req.params.id,null,null,function(err,observatonToUpdate){
        if(err || (!observatonToUpdate)){
            return res.httpResponse(err,null,null);
        } else{
            composeObservation(observatonToUpdate,req.body.observation,function(err,newObservation){
                observationUtility.validateObservationsBeforeUpdate(newObservation, function (err, validityTestResult) {
                    if (err) return res.httpResponse(err, null, null);
                    else {
                        observationUtility.findByIdAndUpdate(req.params.id, newObservation, function(err, results) {
                            res.httpResponse(err, null, results)
                        })
                    }
                });
            });
        }
    });
};


// devicesId: [ids]
// unitsId: { ids:}
/**
 * @api {post} /devices/actions/search Search Observations
 * @apiVersion 1.0.0
 * @apiName ObservationSearch
 * @apiGroup Observations
 * @apiPermission Access Token
 *
 * @apiDescription Search for Observations, using a great deal of filters
 *
 * @apiUse SearchObservationParams
 * @apiParam (Body Parameter)   {String[]}     [searchFilters.unitsId]          Array list of Observation Unit identifiers
 * @apiParam (Body Parameter)   {String[]}     [searchFilters.devicesId]        Array list of Observation Device identifiers
 * @apiUse LocationCentreBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /observations/actions/search
 *  Body: {"searchFilters": [
 *                              {"timestamp": {"from": 1590364800, "to": 1590364801},
 *                               "value": {0, 100},
 *                               "location": {"centre": {"coordinates": [0,0]},
 *                               "distance": 1,
 *                               "distanceOptions": {"mode": "bbox"}
 *                                    },
 *                               "devicesId": ["543fdd60579e1281sdaf6da92", "543fdd60579e1281sdaf6da93"],
 *                               "unitsId": ["543fdd60579e1281sdcf6da34", "543fdd60579e1281sdcf6da35"]
 *                              }
 *                          ]
 *        }
 *
 * @apiUse GetAllObservationResource
 * @apiSuccess {String[]}   distances     Array list of the distances of each returned Observation from the search coordinates (if returnDistance is true)
 *
 * @apiUse SearchObservationResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.searchFilter= function(req, res, next) {

    observationUtility.searchFilter(req.body.searchFilters,true,function(err,foundedObservations){
        if(err) {
            return res.httpResponse(err,null,null);
        }else{
            res.httpResponse(null,req.statusCode,foundedObservations);
        }
    });
};

