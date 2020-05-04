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


var domainDriver = require('../../DBEngineHandler/drivers/domainDriver');
var deviceType_domainDriver = require('../../DBEngineHandler/drivers/deviceType_domainDriver');


//Begin macro
/**
 * @apiDefine DomainBodyParams
 * @apiParam (Body Parameter) {Object}   domain                           Domain dictionary with all the fields
 * @apiParam (Body Parameter) {String}   domain.name                      Domain name
 * @apiParam (Body Parameter) {String}   domain.description               Domain description
 */
/**
 * @apiDefine DomainQueryParams
 * @apiParam (Query Parameter) {String[]}   [domains]                   Search by domain
 * @apiParam (Query Parameter) {String[]}   [name]                      Filter by domain name
 * @apiParam (Query Parameter) {String[]}   [description]               Filter by domain description
 */
/**
 * @apiDefine PostDomainResource
 * @apiSuccess (201 - CREATED) {String} name                    Created domain name
 * @apiSuccess (201 - CREATED) {String} description             Created domain description
 */
/**
 * @apiDefine PutDomainResource
 * @apiSuccess {String} name                    Updated domain name
 * @apiSuccess {String} description             Updated domain description
 */
/**
 * @apiDefine GetAllDomainResource
 * @apiSuccess {Object[]} domains                   A paginated array list of Domain objects
 * @apiSuccess {String} domain._id                  Domain identifier
 * @apiSuccess {String} domain.name                 Domain name
 * @apiSuccess {String} domain.description          Domain description
 */
/**
 * @apiDefine GetDomainResource
 * @apiSuccess {String} _id                     Domain identifier
 * @apiSuccess {String} name                    Domain name
 * @apiSuccess {String} description             Domain description
 */
/**
 * @apiDefine PostDomainResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "My new domain",
 *        "description": "New domain about energy"
 *      }
 */
/**
 * @apiDefine GetAllDomainResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "domains":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92",
 *                          "name": "My domain",
 *                          "description": "My domain description"
 *                      },
 *                      {
 *                          "_id": "543fdd60579e1281sdaf6da92",
 *                          "name": "My other domain",
 *                          "description": "My other domain description"
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
 * @apiDefine GetDomainResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4Domain",
 *        "description": "Crs4 main domain of interest"
 *     }
 */
//End macro


/**
 * @api {post} /domains Create a new Domain
 * @apiVersion 1.0.0
 * @apiName PostDomain
 * @apiGroup Domains
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new Domain object and returns the newly created resource, or an error Object
 *
 * @apiUse DomainBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /domains
 *  Body:{ "name": "customDomain" , "description": "CRS4 main domain of interest"}
 *
 * @apiUse PostDomainResource
 * @apiUse PostDomainResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateDomain = function (req, res, next) {
    domainDriver.create(req.body.domain, function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/**
 * @api {put} /domains Update a Domain
 * @apiVersion 1.0.0
 * @apiName PutDomain
 * @apiGroup Domains
 * @apiPermission Access Token
 *
 * @apiDescription Updates a Domain object and returns the newly updated resource, or an error Object
 *
 * @apiUse DomainBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /domains/543fdd60579e1281b8f6da92
 *  Body:{ "name": "updatedCustomName" , "description": "a more detailed description"}
 *
 * @apiUse PutDomainResource
 * @apiUse GetDomainResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateDomain = function (req, res, next) {
    domainDriver.findByIdAndUpdate(req.params.id, req.body.domain,function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/**
 * @api {get} /domains/:id Get Domain by id
 * @apiVersion 1.0.0
 * @apiName GetDomainById
 * @apiGroup Domains
 * @apiPermission Access Token
 *
 * @apiDescription Returns a Domain object
 *
 * @apiParam (URL Parameter) {String}  id  The Domain identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /domains/543fdd60579e1281b8f6da92
 *
 * @apiUse GetDomainResource
 * @apiUse GetDomainResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getDomainById = function (req, res, next) {
    var id = req.params.id;
    domainDriver.findById(id, req.dbQueryFields, function (err, results) {
        res.httpResponse(err,null,results);
    })
};


/**
 * @api {get} /domains Get all Domains
 * @apiVersion 1.0.0
 * @apiName GetDomain
 * @apiGroup Domains
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Domains
 *
 * @apiUse DomainQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /domains?name=domain1_Crs4,domain2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse Metadata
 * @apiUse GetAllDomainResource
 * @apiUse GetAllDomainResourceExample
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getDomains = function (req, res, next) {
    domainDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        res.httpResponse(err,req.statusCode,results);
    });
};


/**
 * @api {delete} /domains/:id Delete Domain
 * @apiVersion 1.0.0
 * @apiName DeleteDomainById
 * @apiGroup Domains
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given Domain by its identifier and returns the deleted resource. <br>
 * If there are DeviceTypes associated with this Domain, it can't be deleted to preserve data integrity.
 *
 * @apiParam (URL Parameter) {String}  id The Domain identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /domains/543fdd60579e1281b8f6da92
 *
 * @apiUse GetDomainResource
 * @apiUse GetDomainResourceExample

 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteDomain = function (req, res, next) {
    var id = req.params.id;
    deviceType_domainDriver.findOne({domainId:id},function(err,deviceTypeDomain){
        if(err) return res.httpResponse(err,null,null);

        if(deviceTypeDomain){
            var error=new Error("Cannot delete the domain due to associated deviceType(s)");
            error.name="ConflictError";
            res.httpResponse(error,null,null);
        }else{
            domainDriver.findByIdAndRemove(id,function(err,deletedDomain){
                res.httpResponse(err,null,deletedDomain);
            });
        }

    });

};



module.exports.getDeviceTypes = function (req, res, next) {
    var id = req.params.id;

    deviceType_domainDriver.aggregate([
        {
            $match: {domainId:domainDriver.ObjectId(id)}
        },
        {
            $lookup:{
                from: 'devicetypes',
                localField: 'deviceTypeId',
                foreignField: '_id',
                as: 'deviceType'
            }

        },
        { $unwind : "$deviceType" }

    ],function (err, results) {
        var deviceTypes=[];
        results.forEach(function (value){
            deviceTypes.push(value.deviceType);
        });
        deviceTypes=deviceTypes.length===0 ? null : deviceTypes;
        res.httpResponse(err,200,deviceTypes);
    });
};