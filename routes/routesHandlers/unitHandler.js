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


var unitDriver = require('../../DBEngineHandler/drivers/unitDriver')
var observationUtility = require('./handlerUtility/observationHandlerUtility')


//Begin macro
/**
 * @apiDefine UnitBodyParams
 * @apiParam (Body Parameter)   {Object}    unit                        Unit dictionary with all the fields
 * @apiParam (Body Parameter)   {String}    unit.name                   Unit name
 * @apiParam (Body Parameter)   {String}    unit.symbol                 Unit symbol
 * @apiParam (Body Parameter)   {Number}    unit.minValue               Unit minimum accepted value
 * @apiParam (Body Parameter)   {Number}    unit.maxValue               Unit maximum accepted value
 * @apiParam (Body Parameter)   {ObjectId}  unit.observedPropertyId     Unit Foreign Key to ObservedProperty (See `/observedProperties` API reference)
 */
/**
 * @apiDefine UnitQueryParams
 * @apiParam (Query Parameter)  {String[]}  [units]                     Search by Unit
 * @apiParam (Query Parameter)  {String[]}  [name]                      Filter by Unit name
 * @apiParam (Query Parameter)  {String[]}  [symbol]                    Filter by Unit symbol
 * @apiParam (Query Parameter)  {Number[]}  [minValue]                  Filter by Unit minimum value
 * @apiParam (Query Parameter)  {Number[]}  [maxValue]                  Filter by Unit maximum value
 * @apiParam (Query Parameter)  {String[]}  [observedPropertyId]        Filter by ObservedProperty. To get ObservedProperty identifier look at `/observedProperties` API
 */
/**
 * @apiDefine PostUnitResource
 * @apiSuccess (201 - CREATED)  {String}    name                        Created Unit name
 * @apiSuccess (201 - CREATED)  {String}    symbol                      Created Unit symbol
 * @apiSuccess (201 - CREATED)  {Number}    minValue                    Created Unit minimum value
 * @apiSuccess (201 - CREATED)  {Number}    minValue                    Created Unit maximum value
 * @apiSuccess (201 - CREATED)  {String}    observedPropertyId          Created Unit ObservedProperty identifier
 */
/**
 * @apiDefine PutUnitResource
 * @apiSuccess                  {String}    name                        Updated Unit name
 * @apiSuccess                  {String}    symbol                      Updated Unit symbol
 * @apiSuccess                  {Number}    minValue                    Updated Unit minimum value
 * @apiSuccess                  {Number}    maxValue                    Updated Unit maximum value
 * @apiSuccess                  {String}    observedPropertyId          Updated Unit ObservedProperty identifier
 */
/**
 * @apiDefine GetAllUnitResource
 * @apiSuccess                  {Object[]}  units                       A paginated array list of Unit objects
 * @apiSuccess                  {String}    unit._id                    Unit identifier
 * @apiSuccess                  {String}    unit.name                   Unit name
 * @apiSuccess                  {String}    unit.symbol                 Unit symbol
 * @apiSuccess                  {Number}    unit.minValue               Unit minimum value
 * @apiSuccess                  {Number}    unit.maxValue               Unit maximum value
 * @apiSuccess                  {String}    unit.observedPropertyId     Unit ObservedProperty identifier
 */
/**
 * @apiDefine GetUnitResource
 * @apiSuccess                  {String}    _id                         Unit identifier
 * @apiSuccess                  {String}    name                        Unit name
 * @apiSuccess                  {String}    symbol                      Unit symbol
 * @apiSuccess                  {Number}    minValue                    Unit minimum value
 * @apiSuccess                  {Number}    maxValue                    Unit maximum value
 * @apiSuccess                  {String}    observedPropertyId          Unit ObservedProperty identifier
 */
/**
 * @apiDefine PostUnitResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "Celsius Degrees",
 *        "description": "Temperature unit",
 *        "symbol": "°C",
 *        "minValue": -273,
 *        "maxValue": 999999,
 *        "observedPropertyId": "543fdd60579e1281b8f6da94"
 *      }
 */
/**
 * @apiDefine GetAllUnitResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "units": [
 *                  {
 *                      "_id": "543fdd60579e1281b8f6da92",
 *                      "name": "Celsius Degrees",
 *                      "description": "Temperature unit",
 *                      "symbol": "°C",
 *                      "minValue": -273,
 *                      "maxValue": 999999,
 *                      "observedPropertyId": "543fdd60579e1281b8f6da94"
 *                   },
 *                   {
 *                      "_id": "543fdd60579e1281sdaf6da92",
 *                      "name": "Kelvin Degrees",
 *                      "description": "Temperature unit",
 *                      "symbol": "K",
 *                      "minValue": 0,
 *                      "maxValue": 999999,
 *                      "observedPropertyId": "543fdd60579e1281b8f6da94"
 *                    },
 *                    ...
 *                ],
 *       "_metadata": {
 *                      "skip":10,
 *                      "limit":50,
 *                      "totalCount":100
 *                    }
 *     }
 */
/**
 * @apiDefine GetUnitResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *          "_id": "543fdd60579e1281sdaf6da92",
 *          "name": "Kelvin Degrees",
 *          "description": "Temperature unit",
 *          "symbol": "K",
 *          "minValue": 0,
 *          "maxValue": 999999,
 *          "observedPropertyId": "543fdd60579e1281b8f6da94"
 *     }
 */
//End macro


/**
 * @api {post} /units Create a new Unit
 * @apiVersion 1.0.0
 * @apiName PosUnitType
 * @apiGroup Units
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new Unit object and returns the newly created resource, or an error Object
 *
 * @apiUse UnitBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /units
 *  Body: {
 *          "deviceType": {
 *                          "name": "custom Unit",
 *                          "description": "A newly created Unit",
 *                          "symbol": "Z",
 *                          "minValue": 0,
 *                          "maxValue": 1000,
 *                          "observedPropertyId": "543fdd60579e1281b8f6da94"
 *                        }
 *        }
 *
 * @apiUse PostUnitResource
 * @apiUse PostUnitResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateUnit = function(req, res, next) {
    unitDriver.create(req.body.unit, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/**
 * @api {get} /units Get all Units
 * @apiVersion 1.0.0
 * @apiName GetUnit
 * @apiGroup Units
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Units
 *
 * @apiUse UnitQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /units?name=unit1_Crs4,unit2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetAllUnitResource
 * @apiUse GetAllUnitResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getUnits = function(req, res, next) {
    unitDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/**
 * @api {get} /units/:id Get Unit by id
 * @apiVersion 1.0.0
 * @apiName GetUnitById
 * @apiGroup Units
 * @apiPermission Access Token
 *
 * @apiDescription Returns a Unit object
 *
 * @apiParam (URL Parameter) {String}  id  The Unit identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /units/543fdd60579e1281b8f6da92
 *
 * @apiUse GetUnitResource
 * @apiUse GetUnitResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getUnitById = function(req, res, next) {
    var id = req.params.id
    unitDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/**
 * @api {put} /domains Update a Unit
 * @apiVersion 1.0.0
 * @apiName PutUnit
 * @apiGroup Units
 * @apiPermission Access Token
 *
 * @apiDescription Updates a Unit object and returns the newly updated resource, or an error Object
 *
 * @apiUse UnitBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /units/543fdd60579e1281b8f6da92
 *  Body: {
 *          "unit": {"name": "updatedCustomName" , "description": "a more detailed description"}
 *        }
 *
 * @apiUse PutUnitResource
 * @apiUse GetUnitResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateUnit = function(req, res, next) {
    unitDriver.findByIdAndUpdate(req.params.id, req.body.unit, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/**
 * @api {delete} /units/:id Delete Unit
 * @apiVersion 1.0.0
 * @apiName DeleteUnitById
 * @apiGroup Units
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given Unit by its identifier and returns the deleted resource. <br>
 * If there are Observations associated with that Unit, it can't be deleted to preserve data integrity.
 *
 * @apiParam (URL Parameter) {String}  id The Unit identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /units/543fdd60579e1281b8f6da92
 *
 * @apiUse GetUnitResource
 * @apiUse GetUnitResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteUnit = function(req, res, next) {
    var id = req.params.id
    observationUtility.findAll({unitId: id}, null, {totalCount: true}, function (err, results) {
        if (err)
            return next(err)
        else {
            if ((results._metadata.totalCount) > 0) { // there are Observation associated with that Unit, so you cannot delete the Unit
                res.httpResponse(err, 409, "Cannot delete the Unit due to associated Observation(s)")
            } else { //Deleting that Unit is safe since there aren't associated Observations
                unitDriver.findByIdAndRemove(id, function(err, deletedUnit) {
                    res.httpResponse(err, null, deletedUnit);
                })
            }
        }
    })
}
