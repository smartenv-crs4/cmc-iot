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
var async=require('async');
var config = require('propertiesmanager').conf;
var observationsDriver = require('../../DBEngineHandler/drivers/observationDriver');
var observationUtility=require('./handlerUtility/observationUtility');


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
 * @apiParam (Query Parameter) {Boolean}    [disabled]      Filter by thing status
 * @apiParam (Query Parameter) {Boolean}    [mobile]        Filter by mobile status
 * @apiParam (Query Parameter) {String[]}   [ownerId]       Filter by owner
 * @apiParam (Query Parameter) {String[]}   [vendorId]      Filter by Vendor. To get Vendor identifier look at `/vendors` API
 * @apiParam (Query Parameter) {String[]}   [siteId]        Filter by Site. To get Site identifier look at `/sites` API
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
 *        "mobile": "false",
 *        "ownerId" "5d4044fc346a8f0277643ac42",
 *        "api": {"url": "http://iotgw.crs4.it", "access_token": "yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM"},
 *        "disabled": "false",
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
    thingDriver.findByIdAndRemove(id, function (err, deletedThing) {
        res.httpResponse(err,null,deletedThing);
    });
}



function enableDisableThingById(id,action,res){
    thingDriver.findByIdAndUpdate(id,{disabled:action}, function (err, updatedThing) {
        res.httpResponse(err,200,updatedThing);
    });
}


function enableDisableDeviceyId(deviceId,thingId,action,callback){

    deviceDriver.findByIdAndUpdate(deviceId,{disabled:action},function(err,disabledDevice){
        if(err){
            return callback(err);
        }else{
            if(action){
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
 *  Body:{ "name": "customThing" , "description":"Weather station developed by crs4", "ownerId":"5d4044fc346a8f0277643ac42", "vendorId":"5d4044fc346a8f0277643bf2", "siteId":"5d4044fc346a8f0277643bf4",}
 *
 * @apiUse PostThingResource
 * @apiUse PostThingResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateThing = function (req, res, next) {
    thingDriver.create(req.body.thing, function (err, results) {
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
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
// TODO notificare  tramite REDIS??
module.exports.updateThing = function (req, res, next) {
    thingDriver.findById(req.params.id,"dismissed",function(err,thingItem){
        if(err) return res.httpResponse(err,null,null);
        else{
            if(thingItem.dismissed){
                var Err = new Error("The thing '" +req.params.id + "' was removed from available devices/things.");
                Err.name = "DismissedError";
                return res.httpResponse(Err,null,null);
            }else{
                thingDriver.findByIdAndUpdateStrict(req.params.id, req.body.thing,["dismissed","disabled"], function (err, results) {
                    res.httpResponse(err,null,results);
                });
            }
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
 * @apiName GetThing
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
 * @apiUse Metadata
 * @apiUse GetAllThingResource
 * @apiUse GetAllThingResourceExample
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
        if(req.disableThing){ // disable

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
                            enableDisableDeviceyId(device._id,id,true,function(err){
                               callbackDevice(err);
                            });
                        }, function(err) {
                            if(err){
                                return res.httpResponse(err,null,null);
                            }else {
                                enableDisableThingById(id, true, res);
                            }
                        });
                    } else { // there aren't associated device then disable
                        enableDisableThingById(id,true,res);
                    }
                }
            });
        }else{  //enable


            //  Get All associated devices previously disabled

            disabledDeviceDriver.findAll({thingId: id}, null, {totalCount: true}, function (err, results) {
                if (err) {
                    return res.httpResponse(err,null,null);
                } else {
                    if ((results._metadata.totalCount) > 0) { // there are associated device

                        //  1. For Each Device
                        //      - set device as enabled
                        //  2. Delete all previously disabled device list

                        async.each(results.disabledDevices, function(device, callbackDevice) {
                            enableDisableDeviceyId(device.deviceId,id,false,function(err){
                                callbackDevice(err);
                            });
                        }, function(err) {
                            if(err){
                                return res.httpResponse(err,null,null);
                            }else {
                                disabledDeviceDriver.deleteMany({thingId:id},function(err){
                                    if(err){
                                        return res.httpResponse(err,null,null);
                                    }else {
                                        enableDisableThingById(id, false, res);
                                    }
                                });
                            }
                        });
                    } else { // there aren't associated device then disable
                        enableDisableThingById(id,false,res);
                    }
                }
            });
        }

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
                        thingDriver.findByIdAndUpdate(id, {dismissed: true,ownerId:config.cmcIoTThingsOwner._id}, function (err, dismissedThing) {
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




//todo set documentation
module.exports.createObservations = function (req, res, next) {
    var id = req.params.id;
    observationUtility.validateAndCreateThingObservations(id,req.body.observations,function(err, observations){
        res.httpResponse(err,200,observations);
    });
};