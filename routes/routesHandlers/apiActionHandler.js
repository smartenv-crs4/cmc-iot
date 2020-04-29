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


var apiActionDriver = require('../../DBEngineHandler/drivers/apiActionDriver');


//Begin macro
/**
 * @apiDefine ApiActionBodyParams
 * @apiParam (Body Parameter) {Object}      apiAction                       ApiAction dictionary with all the fields
 * @apiParam (Body Parameter) {String}      apiAction.actionName            ApiAction URL
 * @apiParam (Body Parameter) {String}      [apiAction.method]              ApiAction HTTP method. Accepted values are `["GET","POST","PUT","DELETE"]`. Default is `GET`
 * @apiParam (Body Parameter) {Object}      [apiAction.header]              ApiAction HTTP header. Default is `{"Content-Type": "application/json" , "Accept":"application/json"}`
 * @apiParam (Body Parameter) {Object}      [apiAction.bodyPrototype]       ApiAction HTTP body prototype
 * @apiParam (Body Parameter) {ObjectId}    apiAction.deviceTypeId          ApiAction Foreign Key to DeviceType (See `/deviceTypes` API reference)
 */
/**
 * @apiDefine ApiActionQueryParams
 * @apiParam (Query Parameter) {String[]}   [apiActions]                    Search by ApiAction
 * @apiParam (Query Parameter) {String[]}   [actionName]                    Filter by ApiAction URL
 * @apiParam (Query Parameter) {String[]}   [method]                        Filter by ApiAction HTTP method
 * @apiParam (Query Parameter) {String[]}   [deviceTypeId]                  Filter by DeviceType. To get DeviceType identifier look at `/deviceTypes` API
 */
/**
 * @apiDefine PostApiActionResource
 * @apiSuccess (201 - CREATED) {String}     actionName                      Created ApiAction URL
 * @apiSuccess (201 - CREATED) {String}     method                          Created ApiAction HTTP method
 * @apiSuccess (201 - CREATED) {Object}     header                          Created ApiAction HTTP header
 * @apiSuccess (201 - CREATED) {Object}     bodyPrototype                   Created ApiAction HTTP body prototype
 * @apiSuccess (201 - CREATED) {String}     deviceTypeId                    Created ApiAction DeviceType identifier
 */
/**
 * @apiDefine PutApiActionResource
 * @apiSuccess {String}                     actionName                      Updated ApiAction URL
 * @apiSuccess {String}                     method                          Updated ApiAction HTTP method
 * @apiSuccess {Object}                     header                          Updated ApiAction HTTP header
 * @apiSuccess {Object}                     bodyPrototype                   Updated ApiAction HTTP body prototype
 * @apiSuccess {String}                     deviceTypeId                    Updated ApiAction DeviceType identifier
 */
/**
 * @apiDefine GetAllApiActionResource
 * @apiSuccess {Object[]}                   apiActions                      A paginated array list of ApiAction objects
 * @apiSuccess {String}                     apiAction._id                   ApiAction identifier
 * @apiSuccess {String}                     apiAction.actionName            ApiAction URL
 * @apiSuccess {String}                     apiAction.method                ApiAction HTTP method
 * @apiSuccess {Object}                     apiAction.header                ApiAction HTTP header
 * @apiSuccess {Object}                     apiAction.bodyPrototype         ApiAction HTTP body prototype
 * @apiSuccess {String}                     apiAction.deviceTypeId          ApiAction DeviceType identifier
 */
/**
 * @apiDefine GetApiActionResource
 * @apiSuccess {String}                     _id                             ApiAction identifier
 * @apiSuccess {String}                     actionName                      ApiAction URL
 * @apiSuccess {String}                     method                          ApiAction HTTP method
 * @apiSuccess {String}                     header                          ApiAction HTTP header
 * @apiSuccess {String}                     bodyPrototype                   ApiAction HTTP body prototype
 * @apiSuccess {String}                     deviceTypeId                    ApiAction DeviceType identifier
 */
/**
 * @apiDefine PostApiActionResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "actionName": "addSomething",
 *        "method": "POST",
 *        "header": {"Content-Type": "application/json" , "Accept":"application/json"},
 *        "bodyPrototype": {"contentKey": "contentValue"},
 *        "deviceTypeId": "543fdd60579e1281b8f6da94"
 *      }
 */
/**
 * @apiDefine GetAllApiActionResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "apiActions":[
 *                          {
 *                              "actionName": "/actions/getAllSpecialEntities",
 *                              "method": "GET",
 *                              "header": {"Content-Type": "application/json" , "Accept":"application/json"},
 *                              "deviceTypeId": "543fdd60579e1281b8f6da94"
 *                          },
 *                          {
 *                              "actionName": "/actions/addSomething",
 *                              "method": "POST",
 *                              "header": {"Content-Type": "application/json" , "Accept":"application/json"},
 *                              "bodyPrototype": {"contentKey": "contentValue"},
 *                              "deviceTypeId": "543fdd60579e1281b8f6da94"
 *                          },
 *                          ...
 *                    ],
 *       "_metadata": {
 *                     "skip":10,
 *                     "limit":50,
 *                     "totalCount":100
 *                    }
 *     }
 */
/**
 * @apiDefine GetApiActionResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "_id": "543fdd60579e1281b8f6da92",
 *        "actionName": "/actions/getAllSpecialEntities",
 *        "method": "GET",
 *        "header": {"Content-Type": "application/json" , "Accept":"application/json"},
 *        "deviceTypeId": "543fdd60579e1281b8f6da94"
 *     }
 */
//End macro


/**
 * @api {post} /apiActions Create a new ApiAction
 * @apiVersion 1.0.0
 * @apiName PostApiAction
 * @apiGroup ApiActions
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new ApiAction object and returns the newly created resource, or an error Object
 *
 * @apiUse ApiActionBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /apiActions
 *  Body: {
 *          "apiAction": {
 *                          "actionName": "/actions/addSomething",
 *                          "method": "POST",
 *                          "header": {"Content-Type": "application/json" , "Accept":"application/json"},
 *                          "bodyPrototype": {"contentKey": "contentValue"},
 *                          "deviceTypeId": "543fdd60579e1281b8f6da94"
 *                       }
 *        }
 *
 * @apiUse PostApiActionResource
 * @apiUse PostApiActionResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateApiAction = function(req, res, next) {
    apiActionDriver.create(req.body.apiAction, function(err, results) {
        res.httpResponse(err, null, results)
    })
};


/**
 * @api {put} /domains Update an ApiAction
 * @apiVersion 1.0.0
 * @apiName PutApiAction
 * @apiGroup ApiActions
 * @apiPermission Access Token
 *
 * @apiDescription Updates an ApiAction object and returns the newly updated resource, or an error Object
 *
 * @apiUse ApiActionBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /apiActions/543fdd60579e1281b8f6da92
 *  Body: {
 *          "apiAction": {"actionName": "/actions/correctedURL" , "method": "POST"}
 *        }
 *
 * @apiUse PutApiActionResource
 * @apiUse GetApiActionResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateApiAction = function(req, res, next) {
    apiActionDriver.findByIdAndUpdate(req.params.id, req.body.apiAction, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /apiActions/:id Get ApiAction by id
 * @apiVersion 1.0.0
 * @apiName GetApiActionById
 * @apiGroup ApiActions
 * @apiPermission Access Token
 *
 * @apiDescription Returns an ApiAction object
 *
 * @apiParam (URL Parameter) {String}  id  The ApiAction identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /apiActions/543fdd60579e1281b8f6da92
 *
 * @apiUse GetApiActionResource
 * @apiUse GetApiActionResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getApiActionById = function(req, res, next) {
    var id = req.params.id
    apiActionDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /apiActions Get all ApiActions
 * @apiVersion 1.0.0
 * @apiName GetApiAction
 * @apiGroup ApiActions
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all ApiActions
 *
 * @apiUse ApiActionQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /apiActions?method="GET","POST"&field=actionName,method&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetAllApiActionResource
 * @apiUse GetAllApiActionResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getApiActions = function(req, res, next) {
    apiActionDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, req.statusCode, results)
    })
}


/**
 * @api {delete} /devices/:id Delete ApiAction
 * @apiVersion 1.0.0
 * @apiName DeleteApiActionById
 * @apiGroup ApiActions
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given ApiAction by its identifier and returns the deleted resource. <br>
 *
 * @apiParam (URL Parameter) {String}  id The ApiAction identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /apiActions/543fdd60579e1281b8f6da92
 *
 * @apiUse GetApiActionResource
 * @apiUse GetApiActionResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteApiAction = function(req, res, next) {
    var id = req.params.id
    apiActionDriver.findByIdAndRemove(id, function(err, deletedApiAction) {
        res.httpResponse(err, null, deletedApiAction)
    })
}