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

var conf = require('propertiesmanager').conf;
var async=require('async');
var log=require('../../utility/logHandlerUtility');
var redisDriver=require('../../../DBEngineHandler/drivers/redisDriver');
var observationsCacheItems=conf.cmcIoTOptions.observationsCacheItems;




module.exports.saveSingleObservationToCache = function (observation,callback) {
    var deviceId=observation.deviceId.toString();
    redisDriver.pushValuesToKey(deviceId,[JSON.stringify(observation)],function(err,reply){
        reply=reply > observationsCacheItems ? observationsCacheItems : reply;
        if(callback) callback(err,reply);
        if(!err) {
            redisDriver.trimKey(deviceId,0,observationsCacheItems-1);
        }
    });
};

module.exports.saveObservationsToCache = function (deviceId,observations,callback) {
    observations=observations.slice(-observationsCacheItems);
    var obs=[];
    async.eachSeries(observations, function(observation, clb) {
        obs.push( JSON.stringify(observation));
        clb();
    }, function(err) {
        redisDriver.pushValuesToKey(deviceId.toString(),obs,function(err,reply){
            reply=reply > observationsCacheItems ? reply-1 : reply;
            if(callback) callback(err,reply);
            if(!err) {
                redisDriver.trimKey(deviceId.toString(),0,observationsCacheItems-1);
            }
        });
    });
};

module.exports.getObservationsFromCache = function (deviceId,options,callbackFunction) {
    if(!callbackFunction){
        callbackFunction=options;
        options={};
    }
    redisDriver.getValuesFromKey(deviceId.toString(),0, (options.limit || observationsCacheItems)-1,function(err,reply){
        var returnObservations = [];
        if(!err) {
            if (options.returnAsObject) {
                for (var value in reply) {
                    returnObservations.push(JSON.parse(reply[value]));
                }
            } else {
                returnObservations = reply;
            }
        }
        return(callbackFunction(err,returnObservations));
    });
};



module.exports.removeObservationsFromCache = function (devicesId,callback) {
    if(devicesId.length>0)
        redisDriver.deleteKeys(devicesId,callback)
};


module.exports.flushDb = function (callback) {
    redisDriver.flushall(callback);
};

module.exports.disconnect = function (callback) {
    redisDriver.disconnect(callback);
};


module.exports.connect = function (connectionOptions,callback) {
    redisDriver.connect(connectionOptions,callback);
};

module.exports.getAllKey = function (key,callback) {
   redisDriver.getAllKey(key,callback)
};


module.exports.getKey = function (key,callback) {
    redisDriver.get(key,callback)
};

module.exports.KeyLength = function (key,callback) {
    redisDriver.llen(key,callback)
};

module.exports.getValuesFromKey = function (key,start,stop,callback) {
    redisDriver.getValuesFromKey(key,start,stop,callback)
};

module.exports.getRedisStatus = function () {
    return (redisDriver.getRedisStatus());
};