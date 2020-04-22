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


var redis=require('redis');
var conf = require('propertiesmanager').conf;
var async=require('async');
var log=require('../../routes/utility/logHandlerUtility');
var redisDriver=require('../../../DBEngineHandler/drivers/redisDriver');

var redisClient;
var redisStatus=false;
var observationsCacheItems=conf.cmcIoTOptions.observationsCacheItems;



module.exports.create = function (observation,callback) {
    redisDriver.addObservations(observation.deviceId,[observation],callback);
};


module.exports.find = function (deviceId,callback) {
    redisDriver.getObservations(deviceId,{returnAsObject:false},callback);
};


module.exports.update = function (observation,callback) {
    redisDriver.getObservations(observation.deviceId,{returnAsObject:true},function(err,observations){
        if(!err){
            for(var count=0;count< observations.length;++count){
                if(observations[count]._id==observation._id){
                    observations[count]=observation;
                    redisDriver.addObservations(deviceId,observations);
                    count=observations.length+1;
                }
            }
            callback(null,"done");
        }else{
            if(callback) callback(err);
        }
    });
};


module.exports.delete = function (deviceId,observation,callback) {
    redisDriver.getObservations(deviceId,{returnAsObject:true},function(err,observations){
        if(!err){
            for(var count=0;count< observations.length;++count){
                if(observations[count]._id==observation._id){
                    observations[count]=observation;
                    redisDriver.addObservations(deviceId,observations);
                    count=observations.length+1;
                }
            }
            callback(null,"done");
        }else{
            if(callback) callback(err);
        }
    });
};



