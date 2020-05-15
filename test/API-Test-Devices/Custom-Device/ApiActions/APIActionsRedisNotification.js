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


var should = require('should/should');
var observationUtility = require('../../../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var redis=require('redis');
var _=require('underscore');
var observationDocuments = require('../../../SetTestenv/createObservationsDocuments');
var conf = require('propertiesmanager').conf;
var request = require('request');
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var async = require('async');
var webUiToken;
var testTypeMessage="POST /devices/:id/actions/sendObservations";
var testMessage;
var observationId,deviceId,unitId;
var searchFilter;
var From,To,Middle;
var options={};
var connectionsOptions=conf.redisPushNotification;
var redisHandler;
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/devices";
var APIURLActions = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/apiActions";



describe('Devices API Test - [ACTIONS TESTS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function (err) {
            if (err) throw (err);
            webUiToken = conf.testConfig.myWebUITokenToSignUP;

            var total_retry_time= connectionsOptions.totalRetryTime;
            var max_retry_time=connectionsOptions.maxRetryTime;
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
                    console.log("The push notification service server refused the connection");

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

            done();
        });
    });

    after(function (done) {
        this.timeout(0);
        observationUtility.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {
        From=new Date().getTime();
        observationDocuments.createDocuments(40, function (err, ForeignKeys) {
            if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - beforreEach - Observations.create ---> " + err);
            setTimeout(function(){ // to create other 50 with a different timestamo
                Middle=new Date().getTime();
                observationDocuments.createDocuments(60, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - beforreEach - Observations.create ---> " + err);
                    observationId = ForeignKeys.observationId;
                    deviceId=ForeignKeys.deviceId;
                    unitId=ForeignKeys.unitId;
                    searchFilter={
                        timestamp:{
                            from:new Date().getTime(),
                            to:new Date().getTime(),
                        },
                        value:{
                            min:0,
                            max:1
                        },
                        location:{
                            centre:{
                                coordinates:[0,0]
                            },
                            distance:1,
                            distanceOptions:{
                                mode:"BBOX",
                                returnDistance:false
                            }
                        }
                    };
                    To=new Date().getTime();
                    done();
                });
            },200);

        });
    });


    afterEach(function (done) {
        observationDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - afterEach - deleteMany ---> " + err);
            observationUtility.find({},function(err,data){
                data.length.should.be.equal(0);
               done();
            });

        });
    });



    testTypeMessage="Device Observations Notification";



    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis device observations notification";
        it(testMessage, function (done) {

            redisHandler=redis.createClient(options);
            request.post({
                url: APIURLActions  + '/device/' + deviceId +'/action/getDeviceObservationsRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);
                    var messages=0;
                    var callback=null;

                    redisHandler.on("message",function(channel,message){
                        var obs=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);
                        obs.value.should.be.equal(messages);
                        messages++;
                        callback();
                        // if(messages==99){
                        //     done();
                        // }
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);

                    var range = _.range(100);
                    async.eachSeries(range, function(e,cb){
                        callback=cb;
                        observationUtility.create({
                            timestamp:new Date().getTime(),
                            value:e,
                            deviceId:deviceId,
                            unitId:unitId,
                            location: { coordinates: [0,0] }
                        },function(err,newObservation){
                            if (err) throw err;
                        });

                    }, function(err){
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);
                        redisHandler.flushall();
                        redisHandler.quit();

                        done();
                    });
                }
            });
        });
    });


    testTypeMessage="Device Notification";

    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis device update notification";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURLActions  + '/device/' + deviceId +'/action/getDeviceRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                    var messages=0;


                    var nameUpdated="redisDevice";
                    bodyParam=JSON.stringify({device:{name:nameUpdated}, access_token:webUiToken});
                    requestParams={
                        url:APIURL+"/" + deviceId,
                        headers:{'content-type': 'application/json'},
                        body:bodyParam
                    };
                    var completed=0;

                    redisHandler.on("message",function(channel,message){
                        var dev=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                        dev.should.have.property('action');
                        dev.action.should.be.equal("Device Update")
                        dev.should.have.property('message');
                        dev.message.should.have.property('name');
                        dev.message.should.have.property('description');
                        dev.message.should.have.property('thingId');
                        dev.message.should.have.property('typeId');
                        dev.message.should.have.property('dismissed');
                        dev.message.should.have.property('disabled');
                        dev.message._id.should.be.eql(deviceId.toString());
                        dev.message.name.should.be.eql(nameUpdated);
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                        redisHandler.flushall();
                        redisHandler.quit();
                        completed++;
                        if(completed==2) done();
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);

                    request.put(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsById.should.have.property('name');
                            resultsById.should.have.property('description');
                            resultsById.should.have.property('thingId');
                            resultsById.should.have.property('typeId');
                            resultsById.should.have.property('dismissed');
                            resultsById.should.have.property('disabled');
                            resultsById._id.should.be.eql(deviceId.toString());
                            resultsById.name.should.be.eql(nameUpdated);

                        }
                        completed++;
                        if(completed==2) done();
                    });
                }
            });
        });
    });


    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis disable device notification";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURLActions  + '/device/' + deviceId +'/action/getDeviceRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                    var messages=0;


                    var nameUpdated="redisDevice";
                    bodyParam=JSON.stringify({device:{name:nameUpdated}, access_token:webUiToken});
                    requestParams={
                        url:APIURL+"/" + deviceId +"/actions/disable",
                        headers:{'content-type': 'application/json'},
                        body:bodyParam
                    };
                    var completed=0;

                    redisHandler.on("message",function(channel,message){
                        var dev=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                        dev.should.have.property('action');
                        dev.action.should.be.equal("Enable/Disable Device");
                        dev.should.have.property('message');
                        dev.message.should.have.property('name');
                        dev.message.should.have.property('description');
                        dev.message.should.have.property('thingId');
                        dev.message.should.have.property('typeId');
                        dev.message.should.have.property('disabled');
                        dev.message._id.should.be.eql(deviceId.toString());
                        dev.message.disabled.should.be.eql(true);
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                        redisHandler.flushall();
                        redisHandler.quit();
                        completed++;
                        if(completed==2) done();
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);

                    request.post(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsById.should.have.property('name');
                            resultsById.should.have.property('description');
                            resultsById.should.have.property('thingId');
                            resultsById.should.have.property('typeId');
                            resultsById.should.have.property('disabled');
                            resultsById._id.should.be.eql(deviceId.toString());
                            resultsById.disabled.should.be.eql(true);

                        }
                        completed++;
                        if(completed==2) done();
                    });
                }
            });
        });
    });


    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis device delete notification";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURLActions  + '/device/' + deviceId +'/action/getDeviceRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                    var messages=0;

                    requestParams={
                        url:APIURL+"/" + deviceId,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    };
                    var completed=0;

                    redisHandler.on("message",function(channel,message){
                        var dev=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                        dev.should.have.property('action');
                        dev.action.should.be.equal("This channel must be dismissed because the linked device was deleted. Please unsubscribe");
                        dev.should.have.property('message');
                        dev.message.should.have.property('name');
                        dev.message.should.have.property('description');
                        dev.message.should.have.property('thingId');
                        dev.message.should.have.property('typeId');
                        dev.message.should.have.property('dismissed');
                        dev.message.should.have.property('disabled');
                        dev.message._id.should.be.eql(deviceId.toString());
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                        redisHandler.flushall();
                        redisHandler.quit();
                        completed++;
                        if(completed==2) done();
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);

                    request.delete(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsById.should.have.property('name');
                            resultsById.should.have.property('description');
                            resultsById.should.have.property('thingId');
                            resultsById.should.have.property('typeId');
                            resultsById.should.have.property('dismissed');
                            resultsById.should.have.property('disabled');
                            resultsById._id.should.be.eql(deviceId.toString());

                        }
                        completed++;
                        if(completed==2) done();
                    });
                }
            });
        });
    });
});

