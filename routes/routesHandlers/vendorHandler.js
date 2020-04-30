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


var vendorDriver = require('../../DBEngineHandler/drivers/vendorDriver')
var thingDriver = require('../../DBEngineHandler/drivers/thingDriver')


//Begin macro
/**
 * @apiDefine VendorBodyParams
 * @apiParam (Body Parameter)   {Object}    vendor                  Vendor dictionary with all the fields
 * @apiParam (Body Parameter)   {String}    vendor.name             Vendor name
 * @apiParam (Body Parameter)   {String}    vendor.description      Vendor description
 */
/**
 * @apiDefine VendorQueryParams
 * @apiParam (Query Parameter)  {String[]}  [vendors]               Search by Vendor
 * @apiParam (Query Parameter)  {String[]}  [name]                  Filter by Vendor name
 * @apiParam (Query Parameter)  {String[]}  [description]           Filter by Vendor description
 */
/**
 * @apiDefine PostVendorResource
 * @apiSuccess (201 - CREATED)  {String}    name                    Created Vendor name
 * @apiSuccess (201 - CREATED)  {String}    description             Created Vendor description
 */
/**
 * @apiDefine PutVendorResource
 * @apiSuccess                  {String}    name                    Updated Vendor name
 * @apiSuccess                  {String}    description             Updated Vendor description
 */
/**
 * @apiDefine GetAllVendorResource
 * @apiSuccess                  {Object[]}  vendor                  A paginated array list of Vendor objects
 * @apiSuccess                  {String}    vendor._id              Vendor identifier
 * @apiSuccess                  {String}    vendor.name             Vendor name
 * @apiSuccess                  {String}    vendor.description      Vendor description
 */
/**
 * @apiDefine GetVendorResource
 * @apiSuccess                  {String}    _id                     Vendor identifier
 * @apiSuccess                  {String}    name                    Vendor name
 * @apiSuccess                  {String}    description             Vendor description
 */
/**
 * @apiDefine PostVendorResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "My new Vendor",
 *        "description": "Brand new IoT Vendor"
 *      }
 */
/**
 * @apiDefine GetAllVendorResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *          "vendors":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92",
 *                          "name": "My Vendor",
 *                          "description": "My Vendor description"
 *                      },
 *                      {
 *                          "_id": "543fdd60579e1281sdaf6da92",
 *                          "name": "My other Vendor",
 *                          "description": "My other Vendor description"
 *                      },
 *                      ...
 *                     ],
 *          "_metadata": {
 *                          "skip":10,
 *                          "limit":50,
 *                          "totalCount":100
 *                       }
 *     }
 */
/**
 * @apiDefine GetVendorResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "_id": "543fdd60579e1281b8f6da92",
 *        "name": "Brand new Vendor",
 *        "description": "Yet another Vendor"
 *     }
 */
//End macro


/**
 * @api {post} /vendors Create a new Vendor
 * @apiVersion 1.0.0
 * @apiName PostVendor
 * @apiGroup Vendors
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new Vendor object and returns the newly created resource, or an error Object
 *
 * @apiUse VendorBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /vendors
 *  Body: {
 *          "vendor": {
 *                      "name": "customVendor",
 *                      "description": "CRS4 Vendor"
 *                    }
 *        }
 *
 * @apiUse PostVendorResource
 * @apiUse PostVendorResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateVendor = function(req, res, next) {
    vendorDriver.create(req.body.vendor, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /vendors Get all Vendors
 * @apiVersion 1.0.0
 * @apiName GetVendor
 * @apiGroup Vendors
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Vendors
 *
 * @apiUse VendorQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /vendors?name=vendor1_Crs4,vendor2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetAllVendorResource
 * @apiUse GetAllVendorResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getVendors = function(req, res, next) {
    vendorDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {get} /vendors/:id Get Vendor by id
 * @apiVersion 1.0.0
 * @apiName GetVendorById
 * @apiGroup Vendors
 * @apiPermission Access Token
 *
 * @apiDescription Returns a Vendor object
 *
 * @apiParam (URL Parameter) {String}  id  The Vendor identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /vendors/543fdd60579e1281b8f6da92
 *
 * @apiUse GetVendorResource
 * @apiUse GetVendorResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getVendorById = function(req, res, next) {
    var id = req.params.id
    vendorDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {put} /domains Update a Vendor
 * @apiVersion 1.0.0
 * @apiName PutVendor
 * @apiGroup Vendors
 * @apiPermission Access Token
 *
 * @apiDescription Updates a Vendor object and returns the newly updated resource, or an error Object
 *
 * @apiUse VendorBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /vendors/543fdd60579e1281b8f6da92
 *  Body: {
 *          "vendor": {
 *                      "name": "updatedCustomName" ,
 *                      "description": "a more detailed description"
 *                    }
 *        }
 *
 * @apiUse PutVendorResource
 * @apiUse GetVendorResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateVendor = function(req, res, next) {
    vendorDriver.findByIdAndUpdate(req.params.id, req.body.vendor, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {delete} /vendors/:id Delete Vendor
 * @apiVersion 1.0.0
 * @apiName DeleteVendorById
 * @apiGroup Vendors
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given Vendor by its identifier and returns the deleted resource. <br>
 *
 * @apiParam (URL Parameter) {String}  id The Vendor identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /vendors/543fdd60579e1281b8f6da92
 *
 * @apiUse GetVendorResource
 * @apiUse GetVendorResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteVendor = function(req, res, next) {
    var id = req.params.id
    thingDriver.findAll({vendorId: id}, null, {totalCount: true}, function (err, results) {
        if (err)
            return next(err)
        else {
            if ((results._metadata.totalCount) > 0) { // there are Things associated with that Vendor, so you cannot delete the Vendor
                res.httpResponse(err, 409, "Cannot delete the Vendor due to associated Thing(s)")
            }
            else { //Deleting that Vendor is safe since there aren't associated Things
                vendorDriver.findByIdAndRemove(id, function(err, deletedVendor) {
                    res.httpResponse(err, null, deletedVendor)
                })
            }
        }
    })
}
