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

var redisClient;
var redisStatus=false;
var redisOptions=null;
var errorNotAvailable=new Error("Redis cache Service is not Available");


//
// "redisCache":{
//     "must": true,
//         "totalRetryTime": 120000,
//         "maxRetryTime": 10000,
//         "connection": {
//         "host": "smartapi.crs4.it/redis",
//             "port":  80,
//             "db": 0,
//             "password": null
//     }
// }


/*
"connectionsOptions":{
    "must": true,
    "totalRetryTime": 120000,
    "maxRetryTime": 10000,
    "connection": {
        "host": "156.148.22.111",
        "port":  3100,
        "db": 0,
        "password": null
    }
}
 */

module.exports.connect = function (connectionsOptions,callback) {
        var options={};
        var atemptSteeps=10;
        var total_retry_time= connectionsOptions.totalRetryTime;
        var max_retry_time=connectionsOptions.maxRetryTime;
        redisOptions=connectionsOptions;

        options['url']="redis://:" +
                        connectionsOptions.connection.password +
                        "@" +
                        connectionsOptions.connection.host +
                        ":"+
                        connectionsOptions.connection.port +
                        "/" +
                        connectionsOptions.connection.db;

        options["retry_strategy"]=function(opt) {
            if (opt.error && opt.error.code === "ECONNREFUSED") {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                console.log("The server refused the connection");

            }
            if (opt.total_retry_time > total_retry_time) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                console.log("Retry time exhausted");
                return new Error("Retry time exhausted");
            }


            var next= Math.min(Math.pow(2,opt.attempt) * atemptSteeps, max_retry_time);

            console.log("Attempt N° " + opt.attempt);
            console.log("Retry in " + next + " ms");
            return next;
        };

        try{
            redisClient = redis.createClient(options);

            redisClient.on("ready", function (error) {
                redisStatus=true;
                log.printLog('Connected to redis ' + connectionsOptions.connection.host + ":" + connectionsOptions.connection.port);
                callback(null, 'Connected to redis ' +  connectionsOptions.connection.host + ":" + connectionsOptions.connection.port);
                callback=function(){}; // close callback
            });

            redisClient.on("error", function (error) {
                if(!(error instanceof redis.ReplyError)) {
                    redisStatus=false;
                    callback(error);
                    callback = function () {}; // close callback
                }
                if(connectionsOptions.logError)
                    log.printLog('Redis connection Error ' + error);
            });
        }catch (ex) {
           throw (ex);
        }
};

function redisNotAvalilable(callback){
    if(callback) {
        callback(errorNotAvailable);
    }
    if(redisOptions && redisOptions.logCommandsFailWhenRedisIsDown)
        log.printLog("Redis cache Service is not Available");
}

module.exports.disconnect = function (callback) {
    if(redisStatus) {
        redisStatus=false;
        redisClient.quit(callback);
    }
    else{
       redisNotAvalilable(callback);
    }
};


module.exports.flushall = function (callback) {
    if(redisStatus)
        redisClient.flushall(callback);
    else{
        redisNotAvalilable(callback);
    }
};


module.exports.on = function (event,callback) {
    redisClient.on(event, callback);
};



module.exports.getRedisStatus = function () {
    return (redisStatus);
};

module.exports.pushValuesToKey = function (key,values, callback) {
    if(redisStatus)
        redisClient.lpush(key,values,callback);
    else{
        redisNotAvalilable(callback);
    }
};

module.exports.getValuesFromKey = function (key,start,stop, callback) {
    if(redisStatus)
        redisClient.lrange(key,start,stop,callback);
    else{
        redisNotAvalilable(callback);
    }
};


module.exports.deleteKeys = function (keys,callback) {
    if(redisStatus)
        redisClient.del(keys,callback);
    else{
        redisNotAvalilable(callback);
    }
};


module.exports.trimKey = function (key,start,stop,callback) {
    if(redisStatus)
        redisClient.ltrim(key,start,stop,callback);
    else{
        redisNotAvalilable(callback);
    }
};


module.exports.getAllKey = function (key,callback) {
    if(redisStatus)
        redisClient.keys(key,callback);
    else{
        redisNotAvalilable(callback);
    }
};


module.exports.get = function (key,callback) {
    if(redisStatus)
        redisClient.get(key,callback);
    else{
        redisNotAvalilable(callback);
    }
};



module.exports.llen = function (key,callback) {
    if(redisStatus)
        redisClient.llen(key,callback);
    else{
        redisNotAvalilable(callback);
    }
};

/*
module.exports.addObservations = function (deviceId,observations,callback) {
    observations=observations.slice(-observationsCacheItems);


    var obs=[];
    async.eachSeries(observations, function(observation, clb) {
        obs.push( JSON.stringify(observation));
        clb();
    }, function(err) {
        redisClient.lpush(deviceId.toString(),obs,function(err,reply){
            reply=reply > observationsCacheItems ? reply-1 : reply;
            if(callback) callback(err,reply);
            if(err) {
                log.printLog("Redis Error " +err);
                redisStatus = false;
            } else{
                redisClient.ltrim(deviceId.toString(),0,observationsCacheItems-1,function(err,reply){
                    if(err) {
                        log.printLog("Redis Error " +err);
                        redisStatus = false;
                    } else{
                        redisStatus=true
                    }
                });
            }
        });
    });
};

module.exports.getObservations = function (deviceId,options,callbackFunction) {
    if(!callbackFunction){
        callbackFunction=options;
        options={};
    }
    redisClient.lrange(deviceId.toString(),0, (options.limit || observationsCacheItems)-1,function(err,reply){
        var returnObservations=[];
        if(options.returnAsObject){
            for(var value in reply){
                returnObservations.push(JSON.parse(reply[value]));
            }
        }else{
            returnObservations=reply;
        }
        return(callbackFunction(err,returnObservations));
    });
};

 */


