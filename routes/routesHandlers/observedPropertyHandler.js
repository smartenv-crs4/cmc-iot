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


var observedPropertyDriver = require('../../DBEngineHandler/drivers/observedPropertyDriver')
var deviceTypeDriver = require('../../DBEngineHandler/drivers/deviceTypeDriver')
var unitDriver = require('../../DBEngineHandler/drivers/unitDriver')


//Begin macro
/**
 * @apiDefine ObservedPropertyBodyParams
 * @apiParam (Body Parameter)   {Object}    observedProperty                ObservedProperty dictionary with all the fields
 * @apiParam (Body Parameter)   {String}    observedProperty.name           ObservedProperty name
 * @apiParam (Body Parameter)   {String}    observedProperty.description    ObservedProperty description
 */
/**
 * @apiDefine ObservedPropertyQueryParams
 * @apiParam (Query Parameter)  {String[]}  [observedProperties]            Search by ObservedProperty
 * @apiParam (Query Parameter)  {String[]}  [name]                          Filter by ObservedProperty name
 * @apiParam (Query Parameter)  {String[]}  [description]                   Filter by ObservedProperty description
 */
/**
 * @apiDefine PostObservedPropertyResource
 * @apiSuccess (201 - CREATED)  {String}    name                            Created ObservedProperty name
 * @apiSuccess (201 - CREATED)  {String}    description                     Created ObservedProperty description
 */
/**
 * @apiDefine PutObservedPropertyResource
 * @apiSuccess                  {String}    name                            Updated ObservedProperty name
 * @apiSuccess                  {String}    description                     Updated ObservedProperty description
 */
/**
 * @apiDefine GetAllObservedPropertyResource
 * @apiSuccess                  {Object[]}  observedProperty                A paginated array list of ObservedProperty objects
 * @apiSuccess                  {String}    observedProperty._id            ObservedProperty identifier
 * @apiSuccess                  {String}    observedProperty.name           ObservedProperty name
 * @apiSuccess                  {String}    observedProperty.description    ObservedProperty description
 */
/**
 * @apiDefine GetObservedPropertyResource
 * @apiSuccess                  {String}    _id                     ObservedProperty identifier
 * @apiSuccess                  {String}    name                    ObservedProperty name
 * @apiSuccess                  {String}    description             ObservedProperty description
 */
/**
 * @apiDefine PostObservedPropertyResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "My new ObservedProperty",
 *        "description": "Relevant IoT ObservedProperty"
 *      }
 */
/**
 * @apiDefine GetAllObservedPropertyResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *          "observedProperties":[
 *                                  {
 *                                      "_id": "543fdd60579e1281b8f6da92",
 *                                      "name": "My ObservedProperty",
 *                                      "description": "My ObservedProperty description"
 *                                  },
 *                                  {
 *                                      "_id": "543fdd60579e1281sdaf6da92",
 *                                      "name": "My other ObservedProperty",
 *                                      "description": "My other ObservedProperty description"
 *                                  },
 *                                  ...
 *                                ],
 *          "_metadata": {
 *                          "skip":10,
 *                          "limit":50,
 *                          "totalCount":100
 *                       }
 *     }
 */
/**
 * @apiDefine GetObservedPropertyResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "_id": "543fdd60579e1281b8f6da92",
 *        "name": "Brand new ObservedProperty",
 *        "description": "Yet another ObservedProperty"
 *     }
 */
//End macro


/**
 * @api {post} /observedProperties Create a new ObservedProperty
 * @apiVersion 1.0.0
 * @apiName PostObservedProperty
 * @apiGroup ObservedProperties
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new ObservedProperty object and returns the newly created resource, or an error Object
 *
 * @apiUse ObservedPropertyBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /observedProperties
 *  Body: {
 *          "observedProperty": {
 *                                  "name": "customObservedProperty",
 *                                  "description": "CRS4 ObservedProperty"
 *                              }
 *        }
 *
 * @apiUse PostObservedPropertyResource
 * @apiUse PostObservedPropertyResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateObservedProperty = function(req, res, next) {
    observedPropertyDriver.create(req.body.observedProperty, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /observedProperties Get all ObservedProperties
 * @apiVersion 1.0.0
 * @apiName GetObservedProperty
 * @apiGroup ObservedProperties
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all ObservedProperties
 *
 * @apiUse ObservedPropertyQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /observedProperties?name=observedProperty1_Crs4,observedProperty2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetAllObservedPropertyResource
 * @apiUse GetAllObservedPropertyResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getObservedProperties = function(req, res, next) {
    observedPropertyDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /observedProperties/:id Get ObservedProperty by id
 * @apiVersion 1.0.0
 * @apiName GetObservedPropertyById
 * @apiGroup ObservedProperties
 * @apiPermission Access Token
 *
 * @apiDescription Returns an ObservedProperty object
 *
 * @apiParam (URL Parameter) {String}  id  The ObservedProperty identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /observedProperties/543fdd60579e1281b8f6da92
 *
 * @apiUse GetObservedPropertyResource
 * @apiUse GetObservedPropertyResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getObservedPropertyById = function(req, res, next) {
    var id = req.params.id
    observedPropertyDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {put} /observedProperties Update an ObservedProperty
 * @apiVersion 1.0.0
 * @apiName PutObservedProperty
 * @apiGroup ObservedProperties
 * @apiPermission Access Token
 *
 * @apiDescription Updates an ObservedProperty object and returns the newly updated resource, or an error Object
 *
 * @apiUse ObservedPropertyBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /observedProperties/543fdd60579e1281b8f6da92
 *  Body: {
 *          "observedProperty": {
 *                                  "name": "updatedCustomName" ,
 *                                  "description": "a more detailed description"
 *                              }
 *        }
 *
 * @apiUse PutObservedPropertyResource
 * @apiUse GetObservedPropertyResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateObservedProperty = function(req, res, next) {
    observedPropertyDriver.findByIdAndUpdate(req.params.id, req.body.observedProperty, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {delete} /observedProperties/:id Delete ObservedProperty
 * @apiVersion 1.0.0
 * @apiName DeleteObservedPropertyById
 * @apiGroup ObservedProperties
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given ObservedProperty by its identifier and returns the deleted resource. <br>
 *     If there are DeviceTypes and/or Units associated with that ObservedProperty, it can't be deleted to preserve data integrity.
 *
 * @apiParam (URL Parameter) {String}  id The ObservedProperty identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /observedProperties/543fdd60579e1281b8f6da92
 *
 * @apiUse GetObservedPropertyResource
 * @apiUse GetObservedPropertyResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteObservedProperty = function(req, res, next) {
    var id = req.params.id
    deviceTypeDriver.findAll({observedPropertyId: id}, null, {totalCount: true}, function(err, results) {
        if (err)
            return next(err)
        else {
            if ((results._metadata.totalCount) > 0) { // there are DeviceTypes associated with that ObservedProperty, so you cannot delete the ObservedProperty
                res.httpResponse(err, 409, "Cannot delete the ObservedProperty due to associated DeviceType(s)")
            } else { //Deleting that ObservedProperty could be safe since there aren't associated DeviceTypes. What about associated Units?
                unitDriver.findAll({observedPropertyId: id}, null, {totalCount: true}, function(err, results) {
                    if (err)
                        return next(err)
                    else {
                        if ((results._metadata.totalCount) > 0) { // there are Units associated with that ObservedProperty, so you cannot delete the ObservedProperty
                            res.httpResponse(err, 409, "Cannot delete the ObservedProperty due to associated Unit(s)")
                        } else { //Deleting that ObservedProperty is safe since there aren't associated Units
                            observedPropertyDriver.findByIdAndRemove(id, function(err, deletedObservedProperty) {
                                res.httpResponse(err, null, deletedObservedProperty)
                            })
                        }
                    }
                })
            }
        }
    })
}
