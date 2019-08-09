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


var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver');
var deviceUtility=require('./handlerUtility/deviceUtility');


// Begin Macro
/**
 * @apiDefine NotFound
 * @apiError {Object} ResourceNotFound[404] The resource was not found.<BR>
 * <b>response.body.StatusCode</b> contains an error status code.<BR>
 * <b>response.body.error</b> contains an error name.<BR>
 * <b>request.body.message</b> contains an error message specifying the error.<BR>
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
 * @apiError 5xx {Object} InternalServerError[500] An Internal Server Error Occurs. <BR>
 * <b>response.body.StatusCode</b> contains an error Status Code.<BR>
 * <b>response.body.error</b> contains an error Name.<BR>
 * <b>request.body.message</b> contains an error message specifying the error.<BR>
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
 * @apiError {Object} BadRequest[400] The server cannot or will not process the request due to something perceived as a client error<BR>
 * <b>response.body.StatusCode</b> contains an error Status Code.<BR>
 * <b>response.body.error</b> contains an error name.<BR>
 * <b>request.body.message</b> contains an error message specifying the error.<BR>
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
 * @apiError {Object} Unauthorized[401] Not authorized to access this resource.<BR>
 * <b>response.body.StatusCode</b> contains an error Status Code.<BR>
 * <b>response.body.error</b> contains an error name.<BR>
 * <b>request.body.message</b> contains an error message specifying the error.<BR>
 *
 * @apiErrorExample {Object} Unauthorized Error:
 *  HTTP/1.1 401 Unauthorized
 *   {
 *     "StatusCode": '401'
 *     "error": 'Unauthorized'
 *     "message": 'You are unauthorized to access this resource'
 *   }
 */


/**
 * @apiDefine  NoContent
 * @apiError (2xx) {Object} NoContent[204] The server successfully processed the request but no content is found.<BR>
 *
 * @apiErrorExample NoContent Error:
 *  HTTP/1.1 204 NoContent
 *   {
 *   }
 */


/**
 * @apiDefine Metadata
 * @apiSuccess {Object} _metadata Object containing metadata for pagination info
 * @apiSuccess {Number} _metadata.skip Number of results of this query skipped
 * @apiSuccess {Number} _metadata.limit Limits the number of results to be returned by this query.
 * @apiSuccess {Number} _metadata.totalCount If specified in the request, it contains the total number of query results, otherwise it contains false.
 */

/**
 * @apiDefine GetResource
 * @apiSuccess {Object[]} devices A paginated array list of device objects
 * @apiSuccess {String} device._id device id identifier
 * @apiSuccess {String} device.name device name
 * @apiSuccess {String} device.description device description
 * @apiSuccess {String} device.disabled device enabled status
 * @apiSuccess {String} device.typeId device type identifier
 * @apiSuccess {String} device.thingId device thing identifier
 */

/**
 * @apiDefine GetResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "devices":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92", *
 *                          "name": "prova",
 *                          "description": "description About prova"
 *                      },
 *                      {
 *                          "_id": "543fdd60579e1281sdaf6da92",
 *                          "name": "prova1", *
 *                          "description": "description About prova1"
 *
 *                     },
 *                    ...
 *                 ],
 *
 *       "_metadata":{
 *                   "skip":10,
 *                   "limit":50,
 *                   "totalCount":100
 *                   }
 *     }
 */


/**
 * @apiDefine  Pagination
 * @apiParam (Query Parameter) {Number}   [skip]       Pagination skip parameter to skip first N° results
 * @apiParam (Query Parameter) {Number}   [limit]      Pagination limit parameter to limit results total size to N°
 * @apiParam (Query Parameter) {Boolean}  [totalCount] Pagination totalCount parameter. If true in _metadata results fields totalCount parameter contain the total number of object that matches the query
 * @apiParam (Query Parameter) {String}   [sortAsc]    Ordering parameter to order results by ascending values of set fields
 * @apiParam (Query Parameter) {String}   [sortDesc]   Ordering parameter to order results by descending values of set fields
 */


/**
 * @apiDefine Projection
 * @apiParam (Query Parameter) {String}  [fields]  A list of comma separated fields name to project in query results
 */


// End Macro





/**
 * @api {post} /devices Create a new device
 * @apiVersion 1.0.0
 * @apiName PostDevice
 * @apiGroup Devices
 *
 * @apiDescription Protected by access token, creates a new Device object and returns the new created resource or an error Object.
 *
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in url param must be undefined
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as url param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (Body Parameter) {Object}   device                    Device dictionary with all the fields.
 * @apiParam (Body Parameter) {String}   device.name               Device Name
 * @apiParam (Body Parameter) {String}   device.description        Device Description
 * @apiParam (Body Parameter) {ObjectId} device.typeId             Device Type foreign Key (See /devicetype API reference)
 * @apiParam (Body Parameter) {ObjectId} device.thingId            Device Thing foreign Key (See /things API reference)
 * @apiParam (Body Parameter) {String}   [device.disabled=false]   If true the device is not enabled by default

 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "name": "customDevice" , "description":"touch device developed by crs4", "typeId":"5d4044fc346a8f0277643bf2", "thingId":"5d4044fc346a8f0277643bf4",}
 *
 * @apiSuccess (201 - CREATED) {String} name         Created resource device name
 * @apiSuccess (201 - CREATED) {String} description  Created resource device description
 * @apiSuccess (201 - CREATED) {String} dismissed    Created resource device dismissed status. Must be set to false
 * @apiSuccess (201 - CREATED) {String} disabled     Created resource device disabled status. If true the device is disabled
 * @apiSuccess (201 - CREATED) {String} typeId       Created resource device typeId foreign Key to Device Type (See /devicetype API reference to get more info)
 * @apiSuccess (201 - CREATED) {String} thingId      Created resource device thingId foreign Key to Device Type (See /things API reference to get more info)
 *
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name":"customDevice",
 *        "description":"touch device developed by crs4",
 *        "dismissed":"false",
 *        "disabled":"false",
 *        "typeId":"5d4044fc346a8f0277643bf2"
 *        "thingId":"5d4044fc346a8f0277643bf4"
 *
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateDevice = function (req, res, next) {
    deviceDriver.create(req.body.device, function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/**
 * @api {put} /devices Update a device
 * @apiVersion 1.0.0
 * @apiName PutDevice
 * @apiGroup Devices
 *
 * @apiDescription Protected by access token, updates a Device object and returns the new updated resource or an error Object.
 *
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in url param must be undefined
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as url param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (Body Parameter) {Object}   device                 Device dictionary with all the fields.
 * @apiParam (Body Parameter) {String}   [device.name]          Device Name
 * @apiParam (Body Parameter) {String}   [device.description]   Device Description
 * @apiParam (Body Parameter) {ObjectId} [device.typeId]        Device Type foreign Key (See /devicetype API reference)
 * @apiParam (Body Parameter) {ObjectId} [device.thingId]       Device Thing foreign Key (See /things API reference)
 * @apiParam (Body Parameter) {String}   [device.disabled]      Device enabled status

 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT request
 *  Body:{ "name": "updatedCustomName" , "description":"touch sensor developed by crs4"}
 *
 * @apiSuccess (201 - CREATED) {String} name         Updated resource device name
 * @apiSuccess (201 - CREATED) {String} description  Updated resource device description
 * @apiSuccess (201 - CREATED) {String} disabled     Updated resource device disabled status. If true the device is disabled
 * @apiSuccess (201 - CREATED) {String} typeId       Updated resource device typeId foreign Key to Device Type (See /devicetype API reference to get more info)
 * @apiSuccess (201 - CREATED) {String} thingId      Updated resource device thingId foreign Key to Device Type (See /things API reference to get more info)
 *
 * @apiSuccessExample {json} Example: 200 UPDATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name":"customDevice",
 *        "description":"touch device developed by crs4",
 *        "dismissed":"false",
 *        "disabled":"false",
 *        "typeId":"5d4044fc346a8f0277643bf2"
 *        "thingId":"5d4044fc346a8f0277643bf4"
 *
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
// TODO notificare tramite redis???
// TODO disabled false(enble a device) si puo fare solo se thing è enabled
module.exports.updateDevice = function (req, res, next) {
    deviceDriver.findByIdAndUpdateStrict(req.params.id, req.body.device,["dismissed"] ,function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/**
 * @api {get} /devices/:id Get Device by id
 * @apiVersion 1.0.0
 * @apiName GetDeviceById
 * @apiGroup Devices
 *
 * @apiDescription Protected by access token, returns the info about a Device.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in url param must be undefined
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as url param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String}  id  the device identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /devices/543fdd60579e1281b8f6da92
 *
 * @apiUse GetResource
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4Device",
 *        "description": "Crs4 Temperature device",
 *        "disabled": "false",
 *        "thingId": "543fdd60579e1281b8f6da93",
 *        "typeId": "543fdd60579e1281b8f6da94"
 *     }

 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getDeviceById = function (req, res, next) {

    var id = req.params.id;
    deviceDriver.findById(id, req.dbQueryFields, function (err, results) {
        res.httpResponse(err,null,results);
    })
};



/**
 * @api {get} /devices Get/Search all Devices
 * @apiVersion 1.0.0
 * @apiName GetDevice
 * @apiGroup Devices
 *
 * @apiDescription Protected by access token, returns a paginated list of all Devices.
 * Set pagination skip and limit and other filters in the URL request, e.g. "get /devices?skip=10&limit=50&name=deviceCrs4"
 * To filter/search by device type you need to get device type identifier from /deviceTypes APIS and then filter by typeId field.
 * To filter/search by thing you need to get thing identifier from /things APIS and then filter by thingId field.
 * If you need filter/search by _id you can done it by set url field 'devices'. devices field can be ObjectId, ObjectId array, or
 * a string containing ObjectId list comma separated.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in url param must be undefined
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as url param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (Query Parameter) {String[]}  [name]         Filter by device name. It can contain a string(eg name="Crs4Dev"),
 * array of strings(eg name="Crs4Dev"&name="dev2"&name=...) or device names string list comma separated(eg name="dev1 dev2 dev3")
 * @apiParam (Query Parameter) {String[]}  [description]  Filter by device description. It can contain a string(eg description="desc"),
 * array of strings(eg description="desc1"&description="desc2"&description=...) or device descriptions string list comma separated(eg description="des1 des2 des3")
 * @apiParam (Query Parameter) {Boolean} [disabled]       Filter by device enabled status (eg. disabled=true)
 * @apiParam (Query Parameter) {String[]}  [typeId]       Filter by device type. To get device type identifier look at '/deviceTypes' API
 * @apiParam (Query Parameter) {String[]}  [thingId]      Filter by thing . To get thing identifier look at '/things' API
 * @apiUse Pagination
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /devices?name=dev1_Crs4 dev2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetResource
 * @apiUse GetResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
// TODO descrivere che dismissed non è un prametro di ricerca di usare laction per cercare i dsmissed
module.exports.getDevices = function (req, res, next) {
    deviceDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        res.httpResponse(err,req.statusCode,results);
    });
};



/**
 * @api {delete} /devices/:id Delete Device by id
 * @apiVersion 1.0.0
 * @apiName DeleteDeviceById
 * @apiGroup Devices
 *
 * @apiDescription Protected by access token, delete a a given Device by its identifies and return the deleted resource.
 * If device has Observation it can't be deleted due to preserve history observation. It is set in dismissed status.
 * The device in dismissed state cannot be reverted
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same access_token in body or in url param must be undefined
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in [ body || as url param ].
 * If set, the same token sent in Authorization header should be undefined
 * @apiParam (URL Parameter) {String}  id The device identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /devices/543fdd60579e1281b8f6da92
 *
 * @apiUse GetResource
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4Device",
 *        "description": "Crs4 Temperature device",
 *        "disabled": "false",
 *        "thingId": "543fdd60579e1281b8f6da93",
 *        "typeId": "543fdd60579e1281b8f6da94"
 *     }

 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteDevice = function (req, res, next) {

    var id = req.params.id;

    deviceUtility.deleteDevice(id,function(err,deletedDevice){
        res.httpResponse(err,null,deletedDevice);
    });
};