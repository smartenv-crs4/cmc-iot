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


var thingDriver = require('../../DBEngineHandler/drivers/thingDriver');
var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver');
var deviceUtility=require('./handlerUtility/deviceUtility');


// Begin Macro
/**
 * @apiDefine NotFound
 * @apiError {Object} ResourceNotFound[404] The resource was not found <BR>
 * `response.body.StatusCode` contains the error status code <BR>
 * `response.body.error` contains the error name <BR>
 * `request.body.message` contains an error message specifying the error <BR>
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
 * @apiError 5xx {Object} InternalServerError[500] An internal server error occurred <BR>
 * `response.body.StatusCode` contains the error status code <BR>
 * `response.body.error` contains the error name <BR>
 * `request.body.message` contains an error message specifying the error <BR>
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
 * `response.body.StatusCode` contains the error status code <BR>
 * `response.body.error` contains the error name <BR>
 * `request.body.message` contains an error message specifying the error <BR>
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
 * `response.body.StatusCode` contains the error status code <BR>
 * `response.body.error` contains the error name <BR>
 * `request.body.message` contains an error message specifying the error <BR>
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

/**
 * @apiDefine Metadata
 * @apiSuccess {Object} _metadata Object containing metadata info for pagination
 * @apiSuccess {Number} _metadata.skip Number of results of this query skipped
 * @apiSuccess {Number} _metadata.limit Limits the number of results returned by this query
 * @apiSuccess {Number} _metadata.totalCount If specified in the request, it contains the total number of query results; it is false otherwise
 */

/**
 * @apiDefine GetResource
 * @apiSuccess {Object[]} devices           A paginated array list of device objects
 * @apiSuccess {String} device._id          Device identifier
 * @apiSuccess {String} device.name         Device name
 * @apiSuccess {String} device.description  Device description
 * @apiSuccess {String} device.disabled     Device status (enabled/disabled)
 * @apiSuccess {String} device.typeId       Device type identifier
 * @apiSuccess {String} device.thingId      Device thing identifier
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
// End Macro





/**
 * @api {post} /devices Create a new Device
 * @apiVersion 1.0.0
 * @apiName PostDevice
 * @apiGroup Devices
 *
 * @apiDescription Creates a new Device object and returns the newly created resource, or an error Object. Protected by access token.
 *
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL param.
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (Body Parameter) {Object}   device                    Device dictionary with all the fields.
 * @apiParam (Body Parameter) {String}   device.name               Device name
 * @apiParam (Body Parameter) {String}   device.description        Device description
 * @apiParam (Body Parameter) {ObjectId} device.typeId             Device Foreign Key to Device Type (See `/devicetypes` API reference)
 * @apiParam (Body Parameter) {ObjectId} device.thingId            Device Foreign Key to Thing (See `/things` API reference)
 * @apiParam (Body Parameter) {String}   [device.disabled=false]   Device disable status. If `true`, the device is disabled

 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST request
 *  Body:{ "name": "customDevice" , "description":"touch device developed by crs4", "typeId":"5d4044fc346a8f0277643bf2", "thingId":"5d4044fc346a8f0277643bf4",}
 *
 * @apiSuccess (201 - CREATED) {String} name         Created device name
 * @apiSuccess (201 - CREATED) {String} description  Created device description
 * @apiSuccess (201 - CREATED) {String} dismissed    Created device `dismissed` status. It is set to `false` at creation time
 * @apiSuccess (201 - CREATED) {String} disabled     Created device `disabled` status
 * @apiSuccess (201 - CREATED) {String} typeId       Created device Foreign Key to Device Type (See `/devicetypes` API reference)
 * @apiSuccess (201 - CREATED) {String} thingId      Created device Foreign Key to Thing (See `/things` API reference)
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
 * @api {put} /devices Update a Device
 * @apiVersion 1.0.0
 * @apiName PutDevice
 * @apiGroup Devices
 *
 * @apiDescription Updates a Device object and returns the newly updated resource, or an error Object. Protected by access token.
 *
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter.
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (Body Parameter) {Object}   device                 Device dictionary with all the fields.
 * @apiParam (Body Parameter) {String}   [device.name]          Device name
 * @apiParam (Body Parameter) {String}   [device.description]   Device description
 * @apiParam (Body Parameter) {ObjectId} [device.typeId]        Device Foreign Key to Device Type (See `/devicetypes` API reference)
 * @apiParam (Body Parameter) {ObjectId} [device.thingId]       Device Foreign Key to Thing (See `/things` API reference)
 * @apiParam (Body Parameter) {String}   [device.disabled]      Device status (enabled/disabled). If `true`, the device is disabled

 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT request
 *  Body:{ "name": "updatedCustomName" , "description": "touch sensor developed by crs4"}
 *
 * @apiSuccess (201 - CREATED) {String} name         Updated device name
 * @apiSuccess (201 - CREATED) {String} description  Updated device description
 * @apiSuccess (201 - CREATED) {String} disabled     Updated device disabled status
 * @apiSuccess (201 - CREATED) {String} typeId       Updated device Foreign Key to Device Type (See `/devicetypes` API reference)
 * @apiSuccess (201 - CREATED) {String} thingId      Updated device Foreign Key to Thing (See `/things` API reference)
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
module.exports.updateDevice = function (req, res, next) {
    deviceDriver.findByIdAndUpdateStrict(req.params.id, req.body.device,["disabled","dismissed"] ,function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/**
 * @api {get} /devices/:id/actions/disable Disable Device
 * @apiVersion 1.0.0
 * @apiName DeviceDisable
 * @apiGroup Devices
 *
 * @apiDescription Disables a Device object. Protected by access token.
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter.
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (URL Parameter) {String}  id  The device identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /devices/543fdd60579e1281b8f6da92/actions/disable
 *
 * @apiUse GetResource
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4Device",
 *        "description": "Crs4 Temperature device",
 *        "disabled": "true",
 *        "thingId": "543fdd60579e1281b8f6da93",
 *        "typeId": "543fdd60579e1281b8f6da94"
 *     }

 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */

/**
 * @api {get} /devices/:id/actions/enable Enable Device
 * @apiVersion 1.0.0
 * @apiName DeviceEnable
 * @apiGroup Devices
 *
 * @apiDescription Enables a Device object. Protected by access token.
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter.
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (URL Parameter) {String}  id  The device identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /devices/543fdd60579e1281b8f6da92/actions/enable
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
function enableDisableDeviceById(id,action,res){
    deviceDriver.findByIdAndUpdate(id,{disabled:action}, function (err, updatedDevice) {
        res.httpResponse(err,200,updatedDevice);
    });
}

module.exports.disableEnableDevice = function (req, res, next) {
    if(req.disableDevice==undefined){
        const err = new Error("req.disableDevice==undefined. It must be true to disable or false to enable");
        err.name="GeneralError";
        res.httpResponse(err,null,null);
    }else{
        var id=req.params.id;
        if(req.disableDevice){ // disable
            enableDisableDeviceById(id,true,res);
        }else{  //enable

            //  Get device info to capture associated thing id then
            //  -  Get associated thing  then
            //       - if thing is disabled then device cannot be enabled
            //       - if thing is not disabled then enable device

            deviceDriver.findById(id,"thingId",function(err,device){
                if (err) {
                    return res.httpResponse(err,null,null);
                } else {
                    thingDriver.findById(device.thingId,"disabled",function(err,thing){
                        if (err) {
                            return res.httpResponse(err,null,null);
                        } else {
                            if(thing && thing.disabled){
                                res.httpResponse(null,400,"Cannot enable device due to associated thing is not enabled");
                            }else{
                                if(!thing){
                                    res.httpResponse(null,409,"Cannot enable device due to associated thing is not available");
                                }else
                                    enableDisableDeviceById(id,false,res);
                            }
                        }
                    });
                }
            });
        }
    }
};


/**
 * @api {get} /devices/:id Get Device by id
 * @apiVersion 1.0.0
 * @apiName GetDeviceById
 * @apiGroup Devices
 *
 * @apiDescription Returns a Device object. Protected by access token.
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter.
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (URL Parameter) {String}  id  The device identifier
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
 * @api {get} /devices Get all Devices
 * @apiVersion 1.0.0
 * @apiName GetDevice
 * @apiGroup Devices
 *
 * @apiDescription Returns a paginated list of all Devices. Protected by access token. <br>
 * Pagination settings (skip/limit) and field filters in the URL request, e.g. `GET /devices?skip=10&limit=50&name=deviceCrs4` <br>
 * To filter/search by device type you need the device type id from `/deviceTypes` API and then filter by `deviceTypeId` field. <br>
 * To filter/search by thing you need the thing id from `/things` API and then filter by `thingId` field. <br>
 * To filter/search by device _id (one or more), simply set the URL parameter 'devices', which can be a comma separated list or array of ids,
 * e.g. `GET /devices?devices=12345,54321`, `GET /devices?devices=12345&devices=54321`
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (Query Parameter) {String[]}   [name]         Filter by device name. It can be a string (e.g. `name=Crs4Dev`),
 * a string array (e.g. `name=Crs4Dev&name=dev2&name=dev3`) or a list of comma separated strings (e.g. `name=dev1,dev2,dev3`)
 * @apiParam (Query Parameter) {String[]}   [description]  Filter by device description. It can be a string (e.g. `description=Crs4Dev`),
 * a string array (e.g. `description=desc1&description=desc2&description=desc3`) or a list of comma separated strings (e.g. `description=desc1,desc2,desc3`)
 * @apiParam (Query Parameter) {Boolean}    [disabled]     Filter by device status (e.g. `disabled=true`)
 * @apiParam (Query Parameter) {String[]}   [typeId]       Filter by device type. To get device type identifier look at `/deviceTypes` API
 * @apiParam (Query Parameter) {String[]}   [thingId]      Filter by thing . To get thing identifier look at `/things` API
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
 * @api {post} /actions/searchDismissed Get all dismissed Devices
 * @apiVersion 1.0.0
 * @apiName SearchDismissedDevices
 * @apiGroup Devices
 *
 * @apiDescription Returns a paginated list of all dismissed Devices. Protected by access token. <br>
 * Pagination settings (skip/limit) and field filters in the URL request, e.g. `GET /devices/actions/searchDismissed?skip=10&limit=50&name=deviceCrs4` <br>
 * To filter/search by device type you need the device type id from `/deviceTypes` API and then filter by `deviceTypeId` field. <br>
 * To filter/search by thing you need the thing id from `/things` API and then filter by `thingId` field. <br>
 *
 * @apiHeader {String} [Authorization] Unique access token. If set, the same `access_token` in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter
 * If set, the same token sent in `Authorization` header must be `undefined`
 * @apiParam (Query Parameter) {String[]}   [name]         Filter by device name. It can be a string (e.g. `name=Crs4Dev`),
 * a string array (e.g. `name=Crs4Dev&name=dev2&name=dev3`) or a list of comma separated strings (e.g. `name=dev1,dev2,dev3`)
 * @apiParam (Query Parameter) {String[]}   [description]  Filter by device description. It can be a string (e.g. `description=Crs4Dev`),
 * a string array (e.g. `description=desc1&description=desc2&description=desc3`) or a list of comma separated strings (e.g. `description=desc1,desc2,desc3`)
 * @apiParam (Query Parameter) {Boolean}    [disabled]     Filter by device status (e.g. `disabled=true`)
 * @apiParam (Query Parameter) {String[]}   [typeId]       Filter by device type. To get device type identifier look at `/deviceTypes` API
 * @apiParam (Query Parameter) {String[]}   [thingId]      Filter by thing . To get thing identifier look at `/things` API
 * @apiUse Pagination
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /devices/actions/searchDismissed?name=dev1_Crs4 dev2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
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



/**
 * @api {delete} /devices/:id Delete Device
 * @apiVersion 1.0.0
 * @apiName DeleteDeviceById
 * @apiGroup Devices
 *
 * @apiDescription Deletes a given Device by its identifier and returns the deleted resource. Protected by access token. <br>
 * If there are Observations associated with that Device, it can't be deleted to preserve the observation history. Instead, it is set in dismissed status.
 * The dismissed status cannot be reverted.
 *
 * @apiHeader {String} [Authorization] Unique access_token. If set, the same `access_token `in body or in URL parameter must be `undefined`
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"
 *     }
 *
 * @apiParam (Query Parameter) {String} [access_token] Access token that grants access to this resource. It must be sent in body or as URL parameter.
 * If set, the same token sent in `Authorization` header must be `undefined`
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