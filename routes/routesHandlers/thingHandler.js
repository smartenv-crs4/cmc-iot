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
var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver.js');
var disabledDeviceDriver = require('../../DBEngineHandler/drivers/disabledDeviceDriver.js');
var deviceUtility = require('./handlerUtility/deviceUtility');
var thingAndDeviceHandlerUtility = require('./handlerUtility/thingAndDeviceHandlerUtility');
var async=require('async');
var config = require('propertiesmanager').conf;
var _=require('underscore');
var observationUtility=require('./handlerUtility/observationHandlerUtility');
var conf = require('propertiesmanager').conf;


//Begin macro
/**
 * @apiDefine ThingBodyParams
 * @apiParam (Body Parameter) {Object}   thing                          Thing dictionary with all the fields
 * @apiParam (Body Parameter) {String}   thing.name                     Thing name
 * @apiParam (Body Parameter) {String}   thing.description              Thing description
 * @apiParam (Body Parameter) {String}   [thing.disabled=false]         Thing disable status. If `true`, the device is disabled
 * @apiParam (Body Parameter) {String}   [thing.mobile=false]           Thing spatial behaviour - If `true`, the thing can change its site
 * @apiParam (Body Parameter) {Object}   [thing.api]                    Object for connector middleware/driver
 * @apiParam (Body Parameter) {String}   [thing.api.url]                BaseURL of the connector
 * @apiParam (Body Parameter) {String}   [thing.api.access_token]       Access token of the connector
 * @apiParam (Body Parameter) {Object}   [thing.direct]                 Object describing how directly reaching the Thing, bypassing CMC-Iot
 * @apiParam (Body Parameter) {String}   [thing.direct.url]             URL for Thing direct access
 * @apiParam (Body Parameter) {String}   [thing.direct.access_token]    Access token of Thing direct access
 * @apiParam (Body Parameter) {String}   [thing.direct.username]        Username of Thing direct access
 * @apiParam (Body Parameter) {String}   [thing.direct.password]        Password token of Thing direct access
 * @apiParam (Body Parameter) {ObjectId} thing.vendorId                 Thing Foreign Key to Vendor (See `/vendors` API reference)
 * @apiParam (Body Parameter) {ObjectId} thing.siteId                   Thing Foreign Key to Site (See `/sites` API reference)
 */
/**
 * @apiDefine ThingQueryParams
 * @apiParam (Query Parameter) {String[]}   [things]        Search by thing
 * @apiParam (Query Parameter) {String[]}   [name]          Filter by thing name
 * @apiParam (Query Parameter) {String[]}   [description]   Filter by thing description
 * @apiParam (Query Parameter) {Boolean}    [disabled]      Filter by disabled status
 * @apiParam (Query Parameter) {Boolean}    [mobile]        Filter by mobile status
 * @apiParam (Query Parameter) {String[]}   [ownerId]       Filter by owner
 * @apiParam (Query Parameter) {String[]}   [vendorId]      Filter by Vendor. To get Vendor identifier look at `/vendors` API
 * @apiParam (Query Parameter) {String[]}   [siteId]        Filter by Site. To get Site identifier look at `/sites` API
 */
/**
 * @apiDefine ThingSearchFilterParams
 * @apiParam (Body Parameter)   {Object}        [searchFilters]                 Filters parent object
 * @apiParam (Body Parameter)   {String[]}      [searchFilters.name]            Filter by thing name. It can be a string (e.g. `name=MyStation`),
 * a string array (e.g. `name=Crs4Dev&name=dev2&name=dev3`) or a list of comma separated strings (e.g. `name=thing1,thing2,thing3`)
 * @apiParam (Body Parameter)   {String[]}      [searchFilters.description]     Filter by thing description. It can be a string (e.g. `description=MyStation`),
 * a string array (e.g. `description=desc1&description=desc2&description=desc3`) or a list of comma separated strings (e.g. `description=desc1,desc2,desc3`)
 * @apiParam (Body Parameter)   {Boolean}       [searchFilters.disabled]        Filter by thing status (e.g. `disabled=true`)
 * @apiParam (Body Parameter)   {String[]}      [searchFilters.vendorId]        Filter by Vendor. To get Vendor identifier look at `/vendors` API
 * @apiParam (Body Parameter)   {String[]}      [searchFilters.siteId]          Filter by Site . To get Site identifier look at `/sites` API
 * @apiParam (Body Parameter)   {Object}        [searchFilters.fields]          A list of comma separated field names to project in query results
 */
/**
 * @apiDefine PostThingResource
 * @apiSuccess (201 - CREATED) {String} name                    Created thing name
 * @apiSuccess (201 - CREATED) {String} description             Created thing description
 * @apiSuccess (201 - CREATED) {String} disabled                Created thing `disabled` status
 * @apiSuccess (201 - CREATED) {String} mobile                  Created thing `mobile` status
 * @apiSuccess (201 - CREATED) {String} ownerId                 Created thing owner identifier. Automatically set to the user associated with the access token
 * @apiSuccess (201 - CREATED) {Object} [api]                   Created thing middleware object
 * @apiSuccess (201 - CREATED) {String} [api.url]               Created thing API URL of its connector middleware
 * @apiSuccess (201 - CREATED) {String} [api.access_token]      Created thing API access token of its connector middleware
 * @apiSuccess (201 - CREATED) {Object} [direct]                Created thing direct access
 * @apiSuccess (201 - CREATED) {String} [direct.url]            Created thing direct access URL
 * @apiSuccess (201 - CREATED) {String} [direct.access_token]   Created thing direct access token
 * @apiSuccess (201 - CREATED) {String} [direct.username]       Created thing direct access username
 * @apiSuccess (201 - CREATED) {String} [direct.password]       Created thing direct access password
 * @apiSuccess (201 - CREATED) {String} vendorId                Created thing Vendor identifier
 * @apiSuccess (201 - CREATED) {String} siteId                  Created thing Site identifier
 */
/**
 * @apiDefine PutThingResource
 * @apiSuccess {String} name                    Updated thing name
 * @apiSuccess {String} description             Updated thing description
 * @apiSuccess {String} disabled                Updated thing `disabled` status
 * @apiSuccess {String} mobile                  Updated thing `mobile` status
 * @apiSuccess {String} ownerId                 Updated thing owner identifier. Automatically set to the user associated with the access token
 * @apiSuccess {Object} [api]                   Updated thing middleware object
 * @apiSuccess {String} [api.url]               Updated thing API URL of its connector middleware
 * @apiSuccess {String} [api.access_token]      Updated thing API access token of its connector middleware
 * @apiSuccess {Object} [direct]                Updated thing direct access
 * @apiSuccess {String} [direct.url]            Updated thing direct access URL
 * @apiSuccess {String} [direct.access_token]   Updated thing direct access token
 * @apiSuccess {String} [direct.username]       Updated thing direct access username
 * @apiSuccess {String} [direct.password]       Updated thing direct access password
 * @apiSuccess {String} vendorId                Updated thing Vendor identifier
 * @apiSuccess {String} siteId                  Updated thing Site identifier
 */
/**
 * @apiDefine GetAllThingResource
 * @apiSuccess {Object[]} things                        A paginated array list of Thing objects
 * @apiSuccess {String} thing._id                       Thing identifier
 * @apiSuccess {String} thing.name                      Thing name
 * @apiSuccess {String} thing.description               Thing description
 * @apiSuccess {String} thing.disabled                  Thing status (enabled/disabled)
 * @apiSuccess {String} thing.mobile                    Thing mobile status (can be moved/fixed position)
 * @apiSuccess {String} thing.ownerId                   Thing owner identifier. Automatically set to the user associated with the access token
 * @apiSuccess {Object} [thing.api]                     Object for connector middleware/driver
 * @apiSuccess {String} [thing.api.url]                 BaseURL of the connector
 * @apiSuccess {String} [thing.api.access_token]        Access token of the connector
 * @apiSuccess {Object} [thing.direct]                  Object describing how directly reaching the Thing, bypassing CMC-Iot
 * @apiSuccess {String} [thing.direct.url]              URL for Thing direct access
 * @apiSuccess {String} [thing.direct.access_token]     Access token of Thing direct access
 * @apiSuccess {String} [thing.direct.username]         Username of Thing direct access
 * @apiSuccess {String} [thing.direct.password]         Password token of Thing direct access
 * @apiSuccess {String} thing.vendorId                  Thing Vendor identifier
 * @apiSuccess {String} thing.siteId                    Thing Site identifier
 */
/**
 * @apiDefine GetThingResource
 * @apiSuccess {String} _id                     Thing identifier
 * @apiSuccess {String} name                    Thing name
 * @apiSuccess {String} description             Thing description
 * @apiSuccess {String} disabled                Thing status (enabled/disabled)
 * @apiSuccess {String} mobile                  Thing mobile status (can be moved/fixed position)
 * @apiSuccess {String} ownerId                 Thing owner identifier. Automatically set to the user associated with the access token
 * @apiSuccess {Object} [api]                   Object for connector middleware/driver
 * @apiSuccess {String} [api.url]               BaseURL of the connector
 * @apiSuccess {String} [api.access_token]      Access token of the connector
 * @apiSuccess {Object} [direct]                Object describing how directly reaching the Thing, bypassing CMC-Iot
 * @apiSuccess {String} [direct.url]            URL for Thing direct access
 * @apiSuccess {String} [direct.access_token]   Access token of Thing direct access
 * @apiSuccess {String} [direct.username]       Username of Thing direct access
 * @apiSuccess {String} [direct.password]       Password token of Thing direct access
 * @apiSuccess {String} vendorId                Thing Vendor identifier
 * @apiSuccess {String} siteId                  Thing Site identifier
 */
 /**
 * @apiDefine PostThingResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "customThing",
 *        "description": "weather station developed by crs4",
 *        "disabled": "false",
 *        "mobile": "false",
 *        "ownerId" "5d4044fc346a8f0277643ac42",
 *        "api": {"url": "http://iotgw.crs4.it", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *        "vendorId": "5d4044fc346a8f0277643bf2",
 *        "siteId": "5d4044fc346a8f0277643bf4",
 *      }
 */
/**
 * @apiDefine GetAllThingResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "things":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92",
 *                          "name": "My thing",
 *                          "description": "My thing description",
 *                          "disabled": "false",
 *                          "mobile": "false",
 *                          "ownerId": "543fdd60579e1281b8f6eb22",
 *                          "api": {"url": "http://iotgw.crs4.it", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *                          "direct": {"url": "http://myIotCloud/123456/action/On", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *                          "vendorId": "543fdd60579e1281b8f6da93",
 *                          "siteId": "543fdd60579e1281b8f6da94"
 *                      },
 *                      {
 *                          "_id": "543fdd60579e1281sdaf6da92",
 *                          "name": "My other thing",
 *                          "description": "My other thing description",
 *                          "disabled": "false",
 *                          "mobile": "true",
 *                          "ownerId": "543fdd60579e1281b8f6eb22",
 *                          "api": {"url": "http://iotgw.crs4.it", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *                          "direct": {"url": "http://myIotCloud/123456/action/On", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *                          "vendorId": "543fdd60579e1281b8f6da93",
 *                          "siteId": "543fdd60579e1281b8f6da94"
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
 * @apiDefine GetThingResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4Thing",
 *        "description": "Crs4 Weather station",
 *        "disabled": "false",
 *        "mobile": "false",
 *        "ownerId": "543fdd60579e1281b8f6eb22",
 *        "api": {"url": "http://iotgw.crs4.it", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *        "direct": {"url": "http://myIotCloud/123456/action/On", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *        "vendorId": "543fdd60579e1281b8f6da93",
 *        "siteId": "543fdd60579e1281b8f6da94"
 *     }
 */
//End macro

function deleteThingById(id,res){
    thingDriver.findByIdAndRemove(id, function (err,deletedThing ) {
        res.httpResponse(err,null,deletedThing);
    });
}


/**
 * @api {post} /things/:id/actions/disable Disable Thing
 * @apiVersion 1.0.0
 * @apiName ThingDisable
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Disables a Thing object
 *
 * @apiParam (URL Parameters) {String}  id  The Thing identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /things/543fdd60579e1281b8f6da92/actions/disable
 *
 * @apiUse GetThingResource
 * @apiUse GetThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */

/**
 * @api {post} /things/:id/actions/enable Enable Thing
 * @apiVersion 1.0.0
 * @apiName ThingEnable
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Enables a Thing object
 *
 * @apiParam (URL Parameter) {String}  id  The Thing identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /things/543fdd60579e1281b8f6da92/actions/enable
 *
 * @apiUse GetThingResource
 * @apiUse GetThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
function enableDisableThingById(currentThing,action,res){
    if(currentThing.disabled!=action){
        thingDriver.findByIdAndUpdate(currentThing._id,{disabled:action}, function (err, updatedThing) {
            if (updatedThing) updatedThing["dismissed"]=undefined;
            res.httpResponse(err,200,updatedThing);
        });
    }else{
        if (currentThing) currentThing["dismissed"]=undefined;
        res.httpResponse(null,200,currentThing);
    }

}


function enableDisableDeviceId(deviceId,thingId,action,callback){

    deviceDriver.findByIdAndUpdate(deviceId,{disabled:action},function(err,disabledDevice){
        if(err){
            return callback(err);
        }else{
            if(action){
                // create associated device disabled
                disabledDeviceDriver.create({deviceId:deviceId,thingId:thingId},function(err,disabledDeviceList){
                    if(err){
                        return callback(err);
                    }else{
                        callback();
                    }
                });
            }else{
                callback();
            }
        }
    });
}



/**
 * @api {post} /things Create a new Thing
 * @apiVersion 1.0.0
 * @apiName PostThing
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new Thing object and returns the newly created resource, or an error Object
 *
 * @apiUse ThingBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /things
 *  Body:{"name": "customThing" , "description":"Weather station developed by crs4", "ownerId":"5d4044fc346a8f0277643ac42", "vendorId":"5d4044fc346a8f0277643bf2", "siteId":"5d4044fc346a8f0277643bf4"}
 *
 * @apiUse PostThingResource
 * @apiUse PostThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateThing = function (req, res, next) {
    thingDriver.create(req.body.thing, function (err, results) {
        if (results) results["dismissed"]=undefined;
        res.httpResponse(err,null,results);
    });
};


/**
 * @api {put} /things Update a Thing
 * @apiVersion 1.0.0
 * @apiName PutThing
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Updates a Thing object and returns the newly updated resource, or an error Object
 *
 * @apiUse ThingBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /things/543fdd60579e1281b8f6da92
 *  Body:{ "name": "updatedCustomName" , "description": "touch sensor developed by crs4"}
 *
 * @apiUse PutThingResource
 * @apiUse GetThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
// TODO notificare  tramite REDIS??
module.exports.updateThing = function (req, res, next) {
        thingDriver.findById(req.params.id, "dismissed", function (err, thingItem) {
            try{
                if (err) return res.httpResponse(err, null, null);
                else {
                    if (thingItem && thingItem.dismissed) {
                        var Err = new Error("The thing '" + req.params.id + "' was removed from available devices/things.");
                        Err.name = "DismissedError";
                        return res.httpResponse(Err, null, null);
                    } else {
                        thingDriver.findByIdAndUpdateStrict(req.params.id, req.body.thing, ["dismissed", "disabled"], req.dbQueryFields ,function (err, results) {
                            res.httpResponse(err, null, results);
                        });
                    }
                }
            }catch (ex) {
                return res.httpResponse(ex,null,null)
            }

        })

};


/**
 * @api {get} /things/:id Get Thing by id
 * @apiVersion 1.0.0
 * @apiName GetThingById
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Returns a Thing object
 *
 * @apiParam (URL Parameter) {String}  id  The Thing identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /things/543fdd60579e1281b8f6da92
 *
 * @apiUse GetThingResource
 * @apiUse GetThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
//todo direct url visibile solamente al proprietario usare la proprieta --di mongoose per toglierlo
module.exports.getThingById = function (req, res, next) {

    var id = req.params.id;

    thingDriver.findById(id, req.dbQueryFields, function (err, results) {
        res.httpResponse(err,null,results);
    })
};


/**
 * @api {get} /things Get all Things
 * @apiVersion 1.0.0
 * @apiName GetThings
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Things
 *
 * @apiUse ThingQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /things?name=thing1_Crs4,thing2_Crs4&disabled=false&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse GetAllThingResource
 * @apiUse GetAllThingResourceExample
 *
 * @apiUse Metadata
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getThings = function (req, res, next) {
    thingDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        res.httpResponse(err,req.statusCode,results);
    });
};

/**
 * @api {post} /things/actions/searchDismissed Get dismissed Things
 * @apiVersion 1.0.0
 * @apiName ThingSearchDismissed
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all dismissed Things
 *
 * @apiUse ThingSearchFilterParams
 * @apiUse PaginationBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /things/actions/searchDismissed?name=thing1_Crs4 thing2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse GetAllThingResource
 * @apiUse GetAllThingResourceExample
 *
 * @apiUse Metadata
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */

/**
 * @api {post} /things/:id/actions/disable Disable Thing
 * @apiVersion 1.0.0
 * @apiName ThingDisable
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Disables a Thing object
 *
 * @apiParam (URL Parameters) {String}  id  The Thing identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /things/543fdd60579e1281b8f6da92/actions/disable
 *
 * @apiUse GetAllThingResource
 * @apiUse GetThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */

/**
 * @api {post} /things/:id/actions/enable Enable Thing
 * @apiVersion 1.0.0
 * @apiName ThingEnable
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Enables a Thing object
 *
 * @apiParam (URL Parameter) {String}  id  The Thing identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /things/543fdd60579e1281b8f6da92/actions/enable
 *
 * @apiUse GetAllThingResource
 * @apiUse GetThingResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.disableEnableThing = function (req, res, next) {

    if(req.disableThing==undefined){
        const err = new Error("req.disableThing==undefined. It must be true to disable or false to enable");
        err.name="GeneralError";
        res.httpResponse(err,null,null);
    }else{
        var id=req.params.id;

        thingDriver.findById(id,function(err,cThing){
           if(err){
               return res.httpResponse(err,null,null);
           } else{
               if(cThing){
                   if(cThing.dismissed){
                       res.httpResponse(null,409,"Dismissed Thing. Status cannot be changed");
                   }else{

                       if(req.disableThing){ // disable

                           if(cThing.disabled){
                               enableDisableThingById(cThing, true,res);
                           }else{

                               //  Get All associated enabled devices then
                               //     - set device as disabled
                               //     - save disabling into disabledDevice collection

                               deviceDriver.findAll({thingId: id, disabled:false}, null, {totalCount: true}, function (err, results) {
                                   if (err) {
                                       return res.httpResponse(err,null,null);
                                   } else {
                                       if ((results._metadata.totalCount) > 0) { // there are associated device

                                           //  For Each Device
                                           //      - set device as disabled
                                           //      - save disabling into disabledDevice collection

                                           async.each(results.devices, function(device, callbackDevice) {
                                               enableDisableDeviceId(device._id,id,true,function(err){
                                                   callbackDevice(err);
                                               });
                                           }, function(err) {
                                               if(err){
                                                   return res.httpResponse(err,null,null);
                                               }else {
                                                   enableDisableThingById(cThing, true, res);
                                               }
                                           });
                                       } else { // there aren't associated device then disable
                                           enableDisableThingById(cThing,true,res);
                                       }
                                   }
                               });
                           }


                       }else{  //enable

                           if(cThing.disabled) {

                               //  Get All associated devices previously disabled

                               disabledDeviceDriver.findAll({thingId: id}, null, {totalCount: true}, function (err, results) {
                                   if (err) {
                                       return res.httpResponse(err, null, null);
                                   } else {
                                       if ((results._metadata.totalCount) > 0) { // there are associated device

                                           //  1. For Each Device
                                           //      - set device as enabled
                                           //  2. Delete all previously disabled device list

                                           async.each(results.disabledDevices, function (device, callbackDevice) {
                                               enableDisableDeviceId(device.deviceId, id, false, function (err) {
                                                   callbackDevice(err);
                                               });
                                           }, function (err) {
                                               if (err) {
                                                   return res.httpResponse(err, null, null);
                                               } else {
                                                   disabledDeviceDriver.deleteMany({thingId: id}, function (err) {
                                                       if (err) {
                                                           return res.httpResponse(err, null, null);
                                                       } else {
                                                           enableDisableThingById(cThing, false, res);
                                                       }
                                                   });
                                                   // enableDisableThingById(id, false, res);
                                               }
                                           });
                                       } else { // there aren't associated device then enable
                                           enableDisableThingById(cThing, false, res);
                                       }
                                   }
                               });
                           }else{
                               enableDisableThingById(cThing, false, res);
                           }
                       }
                   }

               }else{
                   res.httpResponse(null,409,"Thing not exist");
               }
           }
        });

    }
};


/**
 * @api {delete} /devices/:id Delete Thing
 * @apiVersion 1.0.0
 * @apiName DeleteThingById
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given Thing by its identifier and returns the deleted resource. <br>
 * If there are Observations made by any Device associated with that Thing, it can't be deleted to preserve the observation history. Instead, it is set in dismissed status and its owner becomes `Cmc-IoT`
 * The dismissed status cannot be reverted.
 *
 * @apiParam (URL Parameter) {String}  id The Thing identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /things/543fdd60579e1281b8f6da92
 *
 * @apiUse GetThingResource
 * @apiUse GetThingResourceExample

 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.deleteThing = function (req, res, next) {

    var id = req.params.id;

    deviceDriver.findAll({thingId: id}, null, {totalCount: true}, function (err, results) {
        if (err) {
            return res.httpResponse(err,null,null);
        } else {
            if ((results._metadata.totalCount) > 0) { // there are associated device then set dismissed:true

                var dismiss=false;

                //  Remove all associated devices where:
                //     - if a device has observations then set it dismissed
                //     - if a device hasn't observations then delete it
                //
                //  Then remove thing where
                //     - if thing has a associated device in dismissed status then set it to dismissed and set owner to Cmc-Iot
                //     - if thing hasn't a associated device in dismissed status then delete it

                async.each(results.devices, function(device, callbackDevice) {

                    deviceUtility.deleteDevice(device._id,function(err,deletedDevice){
                        if(err){
                            return res.httpResponse(err,null,null);
                        }else{
                            if(deletedDevice && deletedDevice.dismissed ){
                                dismiss=true;
                            }
                            callbackDevice();
                        }
                    });
                }, function(err) {
                    if(dismiss){  // there are devices(dismissed) with observation then thing must be dismissed and owner change to cmc-IoT
                        thingDriver.findByIdAndUpdate(id, {disabled:true,dismissed: true,ownerId:config.cmcIoTThingsOwner._id}, function (err, dismissedThing) {
                            res.httpResponse(err,null,dismissedThing);
                        });
                    }else{ // there aren't devices(dismissed) with observation then thing must be deleted
                       deleteThingById(id,res);
                    }
                });
            } else { // there aren't associated device then delete
                deleteThingById(id,res);
            }
        }
    });

};




/**
 * @api {post} /things/actions/sendObservations Add Observations
 * @apiVersion 1.0.0
 * @apiName ThingSendObservations
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Add one or more Observations associated with a Thing. An Observation must be valid in compliance with its Unit-Value constraints
 *
 * @apiParam (Body Parameter)   {Object[]}  observations                Array list of Observation objects
 * @apiParam (Body Parameter)   {String}    observations.unitId         Observation Foreign Key to Unit (See `/units` API reference)
 * @apiParam (Body Parameter)   {Number}    observations.value          Observation value
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /things/actions/sendObservations
 *  Body: {"observations": [
 *                          {"unitId": "543fdd60579e1281b8f6da92",
 *                           "value": 33,
 *                          }
 *                         ]
 *        }
 *
 * @apiSuccess {Object[]}   ObjectId                        Array data structure of Observation objects. The key is the Device id, the value is the Observation object
 * @apiSuccess {String}     ObjectId._id                    Created Observation id
 * @apiSuccess {Number}     ObjectId.timestamp              Created Observation timestamp
 * @apiSuccess {Number}     ObjectId.value                  Created Observation value
 * @apiSuccess {Object}     ObjectId.location               Created Observation location parent object
 * @apiSuccess {Point}      ObjectId.location.coordinates   Created Coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiSuccess {String}     ObjectId.deviceId               Created Observation Device identifier
 * @apiSuccess {String}     ObjectId.unitId                 Created Observation Unit identifier
 *
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *      {
 *       "543fdd60579e1281b8f6ba94": [
 *                                      {
 *                                          "_id": "1",
 *                                          "timestamp": 1590364800,
 *                                          "value": 1
 *                                          "location": {"coordinates": [83.4,78.3]},
 *                                          "deviceId": "543fdd60579e1281b8f6ae12",
 *                                          "unitId": "543fdd60579e1281b8f6de22"
 *                                      },
 *                                      ...
 *                                   ],
 *       "543fdd60579e1281b8f6ce32": [
 *                                      ...
 *                                   ],
 *                                   ...
 *      }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.createObservations = function (req, res, next) {
    var id = req.params.id;
    observationUtility.validateAndCreateThingObservations(id,req.body.observations,function(err, observations){
        res.httpResponse(err,200,observations);
    });
};


/**
 * @api {post} /things/actions/addDevices Add Devices
 * @apiVersion 1.0.0
 * @apiName ThingAddDevices
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Add one or more Devices to a Thing
 *
 * @apiParam (Body Parameter) {Object[]}   devices         Array list of Device objects
 * @apiParam (Body Parameter) {String}     name            Added Device name
 * @apiParam (Body Parameter) {String}     description     Added Device description
 * @apiParam (Body Parameter) {String}     deviceTypeId    Added Device Foreign key to deviceType (See `/deviceTypes` API reference)
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /things/543fdd60579e1281b8f6da92/actions/enable
 *  Body: {
 *         [
 *          {name:"MyDev", description: "Home temp sensor", typeId:"543fdd60579e1281b8f6da92"},
 *          {name:"MyOtherDev", description: "Home pressure sensor", typeId:"543fdd60579e1281b8f6ba94"}
 *         ]
 *        }
 *
 * @apiSuccess {Object[]}   results                                     Array data structure of add operation results
 * @apiSuccess {Number}     results.total                               Total number of added Devices
 * @apiSuccess {Number}     results.successful                          Number of successfully added Devices
 * @apiSuccess {Number}     results.unsuccessful                        Number of unsuccessfully added Devices
 * @apiSuccess {Object[]}   successfulAssociatedDevices                 Array list of successfully added Device objects
 * @apiSuccess {String}     successfulAssociatedDevices._id             Added Device id
 * @apiSuccess {String}     successfulAssociatedDevices._name           Added Device name
 * @apiSuccess {String}     successfulAssociatedDevices.description     Added Device description
 * @apiSuccess {Object[]}   unsuccessfulAssociatedDevices               Array data structure of unsuccessfully added Device objects
 * @apiSuccess {String}     unsuccessfulAssociatedDevices.error         Error message explaining why the Device couldn't be added
 * @apiSuccess {Object[]}   unsuccessfulAssociatedDevices.device        Unsuccessfully added Device parent object
 * @apiSuccess {String}     unsuccessfulAssociatedDevices._id           Unsuccessfully added Device id
 * @apiSuccess {String}     unsuccessfulAssociatedDevices._name         Unsuccessfully added Device name
 * @apiSuccess {String}     unsuccessfulAssociatedDevices.description   Unsuccessfully added Device description
 *
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "results": {"total": 2, "successful": 1, "unsuccessful": 1},
 *       "successfulAssociatedDevices":
 *                                      [
 *                                       {
 *                                        "_id": "543fdd60579e1281b8f6da92",
 *                                        "name": "My new device",
 *                                        "description": "My new device description"
 *                                       }
 *                                      ],
 *       "unsuccessfulAssociatedDevices":
 *                                      [
 *                                       {
 *                                        "_id": "543fdd60579e1281b8f6aa12",
 *                                        "name": "My new strange device",
 *                                        "description": "My new strange device description"
 *                                       }
 *                                      ]
 *     }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.addDevices = function (req, res, next) {
    var thingId = req.params.id;
    var associatedDevices=[];
    var notAssociatedDevices=[];


    if(_.isArray(req.body.devices)) {
        thingAndDeviceHandlerUtility.getThingStatus(thingId, function (err, thing) {
            if (err) {
                return res.httpResponse(err, null, null);
            } else {

                if (!thing) {
                    res.httpResponse(null, 409, "Cannot create device due to associated thing is not available");
                } else {
                    if (thing.dismissed) {
                        res.httpResponse(null, 409, "Cannot create device due to associated thing is dismissed");
                    } else {

                        async.each(req.body.devices, function (device, callbackDevice) {

                            device.thingId=thingId;
                            deviceDriver.create(device, function (err, results) {
                                if (err) notAssociatedDevices.push({error:err.message,device:device});
                                else {
                                    if (results) results["dismissed"] = undefined;
                                    associatedDevices.push(results);
                                }
                                callbackDevice();

                            });
                        }, function (err) {
                            var resp = {
                                results: {
                                    total: associatedDevices.length + notAssociatedDevices.length,
                                    successful: associatedDevices.length,
                                    unsuccessful: notAssociatedDevices.length
                                },
                                successfulAssociatedDevices: associatedDevices,
                                unsuccessfulAssociatedDevices: notAssociatedDevices,

                            };
                            res.httpResponse(null, 200, resp);
                        });
                    }
                }
            }
        });
    }else{
        res.httpResponse(null, 400, "devices field must be an array of device objects");
    }
};


/**
 * @api {post} /things/actions/getObservations Get Observations
 * @apiVersion 1.0.0
 * @apiName ThingGetObservations
 * @apiGroup Things
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of filtered Observations from a Thing
 *
 * @apiUse SearchObservationParams
 * @apiParam (Body Parameter)   {Number}     [searchFilters.unitId]          Observation Unit identifier
 * @apiUse LocationCentreBodyParams
 * @apiUse PaginationBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /things/actions/getObservations
 *  Body: {"searchFilters": [
 *                              {"timestamp": {"from": 1590364800, "to": 1590364801},
 *                               "value": {0, 100},
 *                               "location": {"centre": {"coordinates": [0,0]},
 *                               "distance": 1,
 *                               "distanceOptions": {"mode": "bbox"}
 *                              },
 *                               "unitId": "543fdd60579e1281sdcf6da34"
 *                              }
 *                          ]
 *        }
 *
 * @apiUse GetAllObservationResource
 * @apiSuccess {String[]}   [distances]     A paginated array list of the distances of each returned Observation from the search coordinates (if returnDistance is true)
 *
 * @apiUse SearchObservationResourceExample
 *
 * @apiUse Metadata
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getObservations = function (req, res, next) {
    var thingId=req.params.id;
    deviceDriver.findAll({thingId:thingId},"_id",{},function(err,devices){
        if(err){
            res.httpResponse(err, null, null);
        }else{
            if(devices && devices.devices && !_.isEmpty(devices.devices)) {
                var foundedDev = _.map(devices.devices, function (item) {
                    return (item._id);
                });
                if (req.body.searchFilters && !_.isEmpty(req.body.searchFilters)) {
                    req.body.searchFilters["devicesId"] = foundedDev;
                    observationUtility.searchFilter(req.body.searchFilters, false, function (err, foundedObservations) {
                        if (foundedObservations) {
                            var totalCount = foundedObservations.observations.length;
                            foundedObservations.observations = foundedObservations.observations.slice(req.dbPagination.skip, req.dbPagination.skip + req.dbPagination.limit);
                            if (foundedObservations.distances) {
                                foundedObservations.distances = foundedObservations.distances.slice(req.dbPagination.skip, req.dbPagination.skip + req.dbPagination.limit);
                            }
                            foundedObservations['_metadata'] = req.dbPagination;
                            foundedObservations._metadata['totalCount'] = totalCount;
                        }
                        res.httpResponse(err, req.statusCode, foundedObservations);
                    });
                } else { // grt from redis
                    //TODO: set query to redis instead database
                    observationUtility.find({deviceId: {"$in": foundedDev}}, null, {
                        skip: 0,
                        limit: conf.cmcIoTOptions.observationsCacheItems,
                        lean: true
                    }, function (err, data) {
                        res.httpResponse(err, req.statusCode, {observations: data});
                    });
                }
            }else{
                res.httpResponse(null, req.statusCode, {observations: [], _metadata:req.dbPagination});
            }
        }
    });


};