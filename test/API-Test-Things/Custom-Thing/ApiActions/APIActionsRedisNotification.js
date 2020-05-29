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
var deviceDriver=require('../../../../DBEngineHandler/drivers/deviceDriver');
var redis=require('redis');
var _=require('underscore');
var observationDocuments = require('../../../SetTestenv/createObservationsDocuments');
var observationsUtility=require('../../../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/things";
// var APIURLActions = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/apiActions";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var async = require('async');
var geoLatLon=require('../../../../routes/routesHandlers/handlerUtility/geoLatLon');
var webUiToken;
var testTypeMessage="POST /devices/:id/actions/sendObservations";
var testMessage;
var observationId,deviceId,unitId,thingId,typeId,otherDevice;;
var searchFilter;
var From,To,Middle;
var pagination={skip:0,limit:conf.pagination.limit};
var options={};
var connectionsOptions=conf.redisPushNotification;
var redisHandler;



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
                otherDevice=ForeignKeys.deviceId;
                Middle=new Date().getTime();
                observationDocuments.createDocuments(60, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - beforreEach - Observations.create ---> " + err);
                    observationId = ForeignKeys.observationId;
                    deviceId=ForeignKeys.deviceId;
                    unitId=ForeignKeys.unitId;
                    thingId=ForeignKeys.thingId;
                    typeId=ForeignKeys.deviceTypeId;
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



    testTypeMessage="Thing Observation Notification";



    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis device notification";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURL  + '/' + thingId +'/actions/getThingObservationsRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property(deviceId.toString());
                    results[deviceId.toString()].should.have.property('redisService');
                    results[deviceId.toString()].redisService.should.have.properties('host','port','db','password');
                    results[deviceId.toString()].should.have.property('channel');
                    results[deviceId.toString()].channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);
                    var messages=0;
                    var callback=null;

                    redisHandler.on("message",function(channel,message){
                        var obs=JSON.parse(message);
                        channel.should.be.equal(results[deviceId.toString()].channel);
                        obs.value.should.be.equal(messages);
                        messages++;
                        callback();
                        // if(messages==99){
                        //     done();
                        // }
                    });

                    redisHandler.subscribe(results[deviceId.toString()].channel);

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

    testTypeMessage="Thing Notification";

    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis thing update notification";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURL  + '/' + thingId +'/actions/getThingRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);



                    var nameUpdated="redisDevice";
                    bodyParam=JSON.stringify({thing:{name:nameUpdated}, access_token:webUiToken});
                    requestParams={
                        url:APIURL+"/" + thingId,
                        headers:{'content-type': 'application/json'},
                        body:bodyParam
                    };
                    var completed=0;

                    redisHandler.on("message",function(channel,message){
                        var dev=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                        dev.should.have.property('action');
                        dev.action.should.be.equal("Thing Update")
                        dev.should.have.property('message');
                        dev.message.should.have.property('name');
                        dev.message.should.have.property('description');
                        dev.message.should.have.property('disabled');
                        dev.message.should.have.property('mobile');
                        dev.message.should.have.property('dismissed');
                        dev.message._id.should.be.eql(thingId.toString());
                        dev.message.name.should.be.eql(nameUpdated);
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                        redisHandler.flushall();
                        redisHandler.quit();
                        completed++;
                        if(completed==2) done();
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);

                    request.put(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsById.should.have.property('name');
                            resultsById.should.have.property('description');
                            resultsById.should.have.property('mobile');
                            resultsById.should.have.property('ownerId');
                            resultsById.should.have.property('dismissed');
                            resultsById.should.have.property('disabled');
                            resultsById._id.should.be.eql(thingId.toString());
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
        testMessage="must test redis thing delete notification";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURL  + '/' + thingId +'/actions/getThingRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);



                    requestParams={
                        url:APIURL+"/" + thingId,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    };
                    var completed=0;

                    redisHandler.on("message",function(channel,message){
                        var dev=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                        dev.should.have.property('action');
                        dev.action.should.be.equal("This channel must be dismissed because the linked Thing was deleted. Please unsubscribe");
                        dev.should.have.property('message');
                        dev.message.should.have.property('name');
                        dev.message.should.have.property('description');
                        dev.message.should.have.property('disabled');
                        dev.message.should.have.property('mobile');
                        dev.message.should.have.property('dismissed');
                        dev.message._id.should.be.eql(thingId.toString());
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                        redisHandler.flushall();
                        redisHandler.quit();
                        completed++;
                        if(completed==2) done();
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);

                    request.delete(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsById.should.have.property('name');
                            resultsById.should.have.property('description');
                            resultsById.should.have.property('mobile');
                            resultsById.should.have.property('ownerId');
                            resultsById.should.have.property('dismissed');
                            resultsById.should.have.property('disabled');
                            resultsById._id.should.be.eql(thingId.toString());

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
        testMessage="must test redis notification - thing add device action";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            request.post({
                url: APIURL  + '/' + thingId +'/actions/getThingRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);


                    var nameUpdated="Redis Device";
                    var bodyParam=JSON.stringify({devices:[{name:nameUpdated, description:"desc",typeId:typeId}], access_token:webUiToken});
                    requestParams={
                        url:APIURL+"/" + thingId +"/actions/addDevices",
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                        body:bodyParam
                    };
                    var completed=0;

                    redisHandler.on("message",function(channel,message){
                        var dev=JSON.parse(message);
                        channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                        dev.should.have.property('action');
                        dev.action.should.be.equal("Add Devices");
                        dev.should.have.property('message');
                        dev.message.should.have.property('results');
                        dev.message.should.have.property('successfulAssociatedDevices');
                        dev.message.should.have.property('unsuccessfulAssociatedDevices');
                        dev.message.successfulAssociatedDevices[0].should.have.property('name');
                        dev.message.successfulAssociatedDevices[0].should.have.property('description');
                        dev.message.successfulAssociatedDevices[0].should.have.property('typeId');
                        dev.message.successfulAssociatedDevices[0].should.have.property('thingId');
                        dev.message.successfulAssociatedDevices[0].should.have.property('disabled');
                        dev.message.successfulAssociatedDevices[0].thingId.should.be.eql(thingId.toString());
                        redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                        redisHandler.flushall();
                        redisHandler.quit();
                        completed++;
                        if(completed==2) done();
                    });

                    redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);

                    request.post(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsById.should.have.property('results');
                            resultsById.should.have.property('successfulAssociatedDevices');
                            resultsById.should.have.property('unsuccessfulAssociatedDevices');
                            resultsById.successfulAssociatedDevices[0].should.have.property('name');
                            resultsById.successfulAssociatedDevices[0].should.have.property('description');
                            resultsById.successfulAssociatedDevices[0].should.have.property('thingId');
                            resultsById.successfulAssociatedDevices[0].should.have.property('typeId');
                            resultsById.successfulAssociatedDevices[0].should.have.property('disabled');
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
        testMessage="must test redis notification - thing disable action";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            var redisHandlerDevice=redis.createClient(options);


            deviceDriver.findByIdAndUpdate(otherDevice,{thingId:thingId},function(error,updated){
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    request.post({
                        url: APIURL  + '/' + thingId +'/actions/getThingRedisNotification',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('redisService');
                            results.redisService.should.have.properties('host','port','db','password');
                            results.should.have.property('channel');
                            results.should.have.property('devices');
                            results.devices.should.have.property(deviceId.toString());
                            results.devices.should.have.property(otherDevice.toString());
                            results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);


                            var dev1Channel=results.devices[deviceId.toString()].channel;
                            var dev2Channel=results.devices[otherDevice.toString()].channel;

                            requestParams={
                                url:APIURL+"/" + thingId +"/actions/disable",
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
                            };
                            var completed=0;
                            var devicecompleted=0;


                            redisHandlerDevice.on("message",function(channel,message){
                                var dev=JSON.parse(message);
                                channel.should.be.equalOneOf(dev1Channel,dev2Channel);
                                dev.should.have.property('action');
                                dev.action.should.be.equal("Enable/Disable Device");
                                dev.should.have.property('message');
                                dev.message.should.have.property('name');
                                dev.message.should.have.property('description');
                                dev.message.should.have.property('disabled');
                                dev.message.should.have.property('thingId');
                                dev.message._id.should.be.equalOneOf(deviceId.toString(),otherDevice.toString());
                                dev.message.disabled.should.be.equal(true);
                                devicecompleted++;
                                if(devicecompleted==2) {
                                    redisHandlerDevice.unsubscribe(dev1Channel);
                                    redisHandlerDevice.unsubscribe(dev2Channel);
                                    redisHandlerDevice.flushall();
                                    redisHandlerDevice.quit();
                                }
                                completed++;
                                if(completed==4) done();
                            });

                            redisHandler.on("message",function(channel,message){
                                var dev=JSON.parse(message);
                                channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                                dev.should.have.property('action');
                                dev.action.should.be.equal("Enable/Disable Thing");
                                dev.should.have.property('message');
                                dev.message.should.have.property('name');
                                dev.message.should.have.property('description');
                                dev.message.should.have.property('disabled');
                                dev.message.should.have.property('mobile');
                                dev.message._id.should.be.eql(thingId.toString());
                                dev.message.disabled.should.be.equal(true);
                                redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                                redisHandler.flushall();
                                redisHandler.quit();
                                completed++;
                                if(completed==4) done();
                            });

                            redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                            redisHandlerDevice.subscribe(dev1Channel);
                            redisHandlerDevice.subscribe(dev2Channel);

                            request.post(requestParams,function(error, response, body){
                                if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                                else{
                                    var resultsById = JSON.parse(body);
                                    response.statusCode.should.be.equal(200);
                                    resultsById.should.have.property('name');
                                    resultsById.should.have.property('description');
                                    resultsById.should.have.property('mobile');
                                    resultsById.should.have.property('ownerId');
                                    resultsById.should.have.property('disabled');
                                    resultsById._id.should.be.eql(thingId.toString());
                                    resultsById.disabled.should.be.eql(true);
                                }
                                completed++;
                                if(completed==4) done();
                            });
                        }
                    });
                }
            });


        });
    });


    describe(testTypeMessage, function () {
        this.timeout(5000);
        testMessage="must test redis notification - thing deletion action, associated device Deletion";
        it(testMessage, function (done) {
            redisHandler=redis.createClient(options);
            var redisHandlerDevice=redis.createClient(options);


            deviceDriver.findByIdAndUpdate(otherDevice,{thingId:thingId},function(error,updated){
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    request.post({
                        url: APIURL  + '/' + thingId +'/actions/getThingRedisNotification',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('redisService');
                            results.redisService.should.have.properties('host','port','db','password');
                            results.should.have.property('channel');
                            results.should.have.property('devices');
                            results.devices.should.have.property(deviceId.toString());
                            results.devices.should.have.property(otherDevice.toString());
                            results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);


                            var dev1Channel=results.devices[deviceId.toString()].channel;
                            var dev2Channel=results.devices[otherDevice.toString()].channel;

                            requestParams={
                                url:APIURL+"/" + thingId ,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
                            };
                            var completed=0;
                            var devicecompleted=0;


                            redisHandlerDevice.on("message",function(channel,message){
                                var dev=JSON.parse(message);
                                channel.should.be.equalOneOf(dev1Channel,dev2Channel);
                                dev.should.have.property('action');
                                dev.action.should.be.equal("This channel must be dismissed because the linked device was deleted. Please unsubscribe");
                                dev.should.have.property('message');
                                dev.message.should.have.property('name');
                                dev.message.should.have.property('description');
                                dev.message.should.have.property('disabled');
                                dev.message.should.have.property('thingId');
                                dev.message._id.should.be.equalOneOf(deviceId.toString(),otherDevice.toString());
                                devicecompleted++;
                                if(devicecompleted==2) {
                                    redisHandlerDevice.unsubscribe(dev1Channel);
                                    redisHandlerDevice.unsubscribe(dev2Channel);
                                    redisHandlerDevice.flushall();
                                    redisHandlerDevice.quit();
                                }
                                completed++;
                                if(completed==4) done();
                            });

                            redisHandler.on("message",function(channel,message){
                                var dev=JSON.parse(message);
                                channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                                dev.should.have.property('action');
                                dev.action.should.be.equal("This channel must be dismissed because the linked Thing was deleted. Please unsubscribe");
                                dev.should.have.property('message');
                                dev.message.should.have.property('name');
                                dev.message.should.have.property('description');
                                dev.message.should.have.property('disabled');
                                dev.message.should.have.property('mobile');
                                dev.message._id.should.be.eql(thingId.toString());
                                redisHandler.unsubscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                                redisHandler.flushall();
                                redisHandler.quit();
                                completed++;
                                if(completed==4) done();
                            });

                            redisHandler.subscribe(conf.redisPushNotification.notificationChannelsPrefix.thing+thingId);
                            redisHandlerDevice.subscribe(dev1Channel);
                            redisHandlerDevice.subscribe(dev2Channel);

                            request.delete(requestParams,function(error, response, body){
                                if(error) consoleLogError.printErrorLog(testMessage + " -->" + error.message);
                                else{
                                    var resultsById = JSON.parse(body);
                                    response.statusCode.should.be.equal(200);
                                    resultsById.should.have.property('name');
                                    resultsById.should.have.property('description');
                                    resultsById.should.have.property('mobile');
                                    resultsById.should.have.property('ownerId');
                                    resultsById.should.have.property('disabled');
                                    resultsById._id.should.be.eql(thingId.toString());
                                }
                                completed++;
                                if(completed==4) done();
                            });
                        }
                    });
                }
            });


        });
    });

});

