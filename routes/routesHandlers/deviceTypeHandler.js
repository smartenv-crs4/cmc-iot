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


var deviceTypeDriver = require('../../DBEngineHandler/drivers/deviceTypeDriver')
var apiActionsDriver = require('../../DBEngineHandler/drivers/apiActionDriver')
var deviceTypeDomainDriver = require('../../DBEngineHandler/drivers/deviceType_domainDriver')
var async = require("async")


//Begin macro
/**
 * @apiDefine DeviceTypeBodyParams
 * @apiParam (Body Parameter) {Object}      deviceType                      DeviceType dictionary with all the fields
 * @apiParam (Body Parameter) {String}      deviceType.name                 DeviceType name
 * @apiParam (Body Parameter) {String}      deviceType.description          DeviceType description
 * @apiParam (Body Parameter) {ObjectId}    deviceType.observedPropertyId   DeviceType Foreign Key to ObservedProperty (See `/observedProperties` API reference)
 * @apiParam (Body Parameter) {Object[]}    domains                         Array of Domain identifiers
 * @apiParam (Body Parameter) {String}      domains.domainId                Domain identifier
 */
/**
 * @apiDefine DeviceTypeDomainBodyParams
 * @apiParam (Body Parameter) {Object[]}    domains                         Array of Domain identifiers
 * @apiParam (Body Parameter) {String}      domains.domainId                Domain identifier
 */
/**
 * @apiDefine DeviceTypeQueryParams
 * @apiParam (Query Parameter) {String[]}   [deviceTypes]                   Search by deviceType
 * @apiParam (Query Parameter) {String[]}   [name]                          Filter by deviceType name
 * @apiParam (Query Parameter) {String[]}   [description]                   Filter by deviceType description
 * @apiParam (Query Parameter) {String[]}   [observedPropertyId]            Filter by ObservedProperty. To get ObservedProperty identifier look at `/observedProperties` API
 */
/**
 * @apiDefine PostDeviceTypeResource
 * @apiSuccess (201 - CREATED) {String} name                    Created deviceType name
 * @apiSuccess (201 - CREATED) {String} description             Created deviceType description
 * @apiSuccess (201 - CREATED) {String} observedPropertyId      Created deviceType ObservedProperty identifier
 */
/**
 * @apiDefine PutDeviceTypeResource
 * @apiSuccess {String} name                                    Updated deviceType name
 * @apiSuccess {String} description                             Updated deviceType description
 * @apiSuccess {String} observedPropertyId                      Updated deviceType ObservedProperty identifier
 */
/**
 * @apiDefine GetAllDeviceTypeResource
 * @apiSuccess {Object[]} deviceTypes                           A paginated array list of DeviceType objects
 * @apiSuccess {String} deviceType._id                          DeviceType identifier
 * @apiSuccess {String} deviceType.name                         DeviceType name
 * @apiSuccess {String} deviceType.description                  DeviceType description
 * @apiSuccess {String} deviceType.observedPropertyId           DeviceType ObservedProperty identifier
 */
/**
 * @apiDefine GetDeviceTypeResource
 * @apiSuccess {String} _id                                     DeviceType identifier
 * @apiSuccess {String} name                                    DeviceType name
 * @apiSuccess {String} description                             DeviceType description
 * @apiSuccess {String} observedPropertyId                      DeviceType ObservedProperty identifier
 */
/**
 * @apiDefine PostDeviceTypeResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "My new deviceType",
 *        "description": "New sensor deviceType",
 *        "observedPropertyId": "543fdd60579e1281b8f6da94"
 *      }
 */
/**
 * @apiDefine GetAllDeviceTypeResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "deviceTypes":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92",
 *                          "name": "My deviceType",
 *                          "description": "My deviceType description",
 *                          "observedPropertyId": "543fdd60579e1281b8f6da93",
 *                      },
 *                      {
 *                          "_id": "543fdd60579e1281sdaf6da92",
 *                          "name": "My other deviceType",
 *                          "description": "My other deviceType description",
 *                          "observedPropertyId": "543fdd60579e1281b8f6da94"
 *                     },
 *                    ...
 *                 ],
 *       "_metadata":{
 *                   "skip":10,
 *                   "limit":50,
 *                   "totalCount":100
 *                   }
 *     }
 */
/**
 * @apiDefine GetDeviceTypeResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4DeviceType",
 *        "description": "Crs4 sensor deviceType"
 *     }
 */
/**
 * @apiDefine GetDeviceTypeDomainResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *      [
 *          {
 *              "id": "543fdd60579e1281b8f6da92",
 *              "deviceTypeId": "543fdd60579e1281b8f6df34",
 *              "domainId": "543fdd60579e1281b8f6ca66"
 *          },
 *          ...
 *      ]
 */
//End macro


/**
 * @api {post} /deviceTypes/:id/actions/addDomains Add new Domains
 * @apiVersion 1.0.0
 * @apiName DeviceTypeAddDomains
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Adds one or more new Domains to a DeviceType. Returns the associations with the added Domains.
 *
 * @apiParam (URL Parameter) {String}  id  The DeviceType identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /deviceTypes/543fdd60579e1281b8f6da92/actions/addDomains
 * Body:{
 *          "domains": ["543fdd60579e1281b8f6ca66", "543fdd60579e1281b8f3dc69"]
 *      }
 *
 * @apiUse DeviceTypeDomainBodyParams
 * @apiUse GetDeviceTypeDomainResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
function addDomainHandler(id, req, res, next) {
    var results = []
    async.each(req.body.domains, function(domainId, callback) {
        deviceTypeDomainDriver.create({deviceTypeId: id, domainId: domainId}, function(err, deviceTypeDomainItem) {
            results.push(deviceTypeDomainItem)
            callback(err)
        })

    }, function(err) {
        res.httpResponse(err, 200, results)
    })
}

module.exports.addDomains = function(req, res, next) {
    var id = req.params.id
    addDomainHandler(id, req, res, next)
}


/**
 * @api {post} /deviceTypes/:id/actions/removeDomains Remove Domains
 * @apiVersion 1.0.0
 * @apiName DeviceTypeRemoveDomains
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Removes one or more Domains from a DeviceType. Returns the associations with the removed Domains.
 *
 * @apiParam (URL Parameter) {String}  id  The DeviceType identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /deviceTypes/543fdd60579e1281b8f6da92/actions/removeDomains
 * Body:{
 *          "domains": ["543fdd60579e1281b8f6ca66", "543fdd60579e1281b8f3dc69"]
 *      }
 *
 * @apiUse DeviceTypeDomainBodyParams
 * @apiUse GetDeviceTypeDomainResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.removeDomains = function(req, res, next) {
    var id = req.params.id
    var results = []
    async.each(req.body.domains, function(domainId, callback) {
        deviceTypeDomainDriver.findOneAndRemove({
            deviceTypeId: id,
            domainId: domainId
        }, function(err, deviceTypeDomainItem) {
            if (deviceTypeDomainItem) results.push(deviceTypeDomainItem)
            callback(err)
        })

    }, function(err) {
        results = results.length === 0 ? null : results
        res.httpResponse(err, 200, results)
    })
}


/**
 * @api {post} /deviceTypes/:id/actions/setDomains Set Domains
 * @apiVersion 1.0.0
 * @apiName DeviceTypeSetDomains
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Sets the Domains of the DeviceType, removing the existing ones
 *
 * @apiParam (URL Parameter) {String}  id  The DeviceType identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /deviceTypes/543fdd60579e1281b8f6da92/actions/setDomains
 * Body:{
 *          "domains": ["543fdd60579e1281b8f6ca66", "543fdd60579e1281b8f3dc69"]
 *      }
 *
 * @apiUse DeviceTypeDomainBodyParams
 * @apiUse GetDeviceTypeDomainResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.setDomains = function(req, res, next) {
    var id = req.params.id
    deviceTypeDomainDriver.deleteMany({deviceTypeId: id}, function(err) {
        if (!err) {
            addDomainHandler(id, req, res, next)
        } else {
            res.httpResponse(err, null, null)
        }
    })
}


/**
 * @api {post} /deviceTypes/:id/actions/getDomains Get all Domains
 * @apiVersion 1.0.0
 * @apiName DeviceTypeGetDomains
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Gets all Domains associated to a DeviceType
 *
 * @apiParam (URL Parameter) {String}  id  The DeviceType identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /deviceTypes/543fdd60579e1281b8f6da92/actions/getDomains
 *
 * @apiUse GetDeviceTypeDomainResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getDomains = function(req, res, next) {
    var id = req.params.id
    deviceTypeDomainDriver.aggregate([
        {
            $match: {deviceTypeId: deviceTypeDriver.ObjectId(id)}
        },
        {
            $lookup: {
                from: 'domains',
                localField: 'domainId',
                foreignField: '_id',
                as: 'domain'
            }
        },
        {$unwind: "$domain"}

    ], function(err, results) {
        var domanins = []
        results.forEach(function(value) {
            domanins.push(value.domain)
        })
        domanins = domanins.length === 0 ? null : domanins
        res.httpResponse(err, 200, domanins)
    })
}


/**
 * @api {post} /domains Create a new DeviceType
 * @apiVersion 1.0.0
 * @apiName PostDeviceType
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new DeviceType object and returns the newly created resource, or an error Object
 *
 * @apiUse DeviceTypeBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /deviceTypes
 * Body:{
 *          "deviceType": { "name": "customDeviceType" , "description": "CRS4 sensor deviceType"},
 *          "domains": ["543fdd60579e1281b8f6ca66", "543fdd60579e1281b8f3dc69"]
 *      }
 *
 * @apiUse PostDeviceTypeResource
 * @apiUse PostDeviceTypeResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateDeviceType = function(req, res, next) {
    deviceTypeDriver.create(req.body.deviceType, function(err, results) {
        if (err) return (res.httpResponse(err, null, null))
        else {
            var domains = req.body.domains
            async.each(domains, function(domainId, callback) {

                deviceTypeDomainDriver.create({
                    deviceTypeId: results._id,
                    domainId: domainId
                }, function(err, deviceTypeDomainItem) {
                    callback(err)
                })

            }, function(err) {
                res.httpResponse(err, null, results)
            })

        }
    })
}


/**
 * @api {get} /deviceTypes Get all DeviceTypes
 * @apiVersion 1.0.0
 * @apiName GetDeviceType
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all DeviceTypes
 *
 * @apiUse DeviceTypeQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /deviceTypes?name=deviceType1_Crs4,deviceType2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetAllDeviceTypeResource
 * @apiUse GetAllDeviceTypeResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getDeviceTypes = function(req, res, next) {
    deviceTypeDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /deviceTypes/:id Get DeviceType by id
 * @apiVersion 1.0.0
 * @apiName GetDeviceTypeById
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Returns a DeviceType object
 *
 * @apiParam (URL Parameter) {String}  id  The DeviceType identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /deviceTypes/543fdd60579e1281b8f6da92
 *
 * @apiUse GetDeviceTypeResource
 * @apiUse GetDeviceTypeResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getDeviceTypeById = function(req, res, next) {
    var id = req.params.id
    deviceTypeDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {put} /domains Update a DeviceType
 * @apiVersion 1.0.0
 * @apiName PutDeviceType
 * @apiGroup DeviceTypes
 * @apiPermission Access Token
 *
 * @apiDescription Updates a DeviceType object and returns the newly updated resource, or an error Object
 *
 * @apiUse DeviceTypeBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /deviceTypes/543fdd60579e1281b8f6da92
 * Body:{
 *          "deviceType": {"name": "updatedCustomName" , "description": "a more detailed description"}
 *      }
 *
 * @apiUse PutDeviceTypeResource
 * @apiUse GetDeviceTypeResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateDeviceType = function(req, res, next) {
    deviceTypeDriver.findByIdAndUpdate(req.params.id, req.body.deviceType, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* Delete deviceTypes */
module.exports.deleteDeviceType = function(req, res, next) {
    var id = req.params.id

    //delete associated apiActions
    apiActionsDriver.deleteMany({deviceTypeId: id}, function(err) {
        if (!err) {
            //delete associated apiActions
            deviceTypeDomainDriver.deleteMany({deviceTypeId: id}, function(err) {
                if (!err) {
                    deviceTypeDriver.findByIdAndRemove(id, function(err, deletedDeviceType) {
                        res.httpResponse(err, null, deletedDeviceType)
                    })
                } else {
                    res.httpResponse(err, null, null)
                }
            })
        } else {
            res.httpResponse(err, null, null)
        }
    })


}
