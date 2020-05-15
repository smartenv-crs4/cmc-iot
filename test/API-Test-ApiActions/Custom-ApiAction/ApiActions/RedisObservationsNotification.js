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
var redisHandler=require('../../../../routes/routesHandlers/handlerUtility/redisHandler');
var _=require('underscore');
var observationDocuments = require('../../../SetTestenv/createObservationsDocuments');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/apiActions";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var webUiToken;
var testTypeMessage="POST /devices/:id/actions/sendObservations";
var testMessage;
var observationId,deviceId,unitId,thingId;
var searchFilter;
var From,To,Middle;




describe('Devices API Test - [ACTIONS TESTS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function (err) {
            if (err) throw (err);
            webUiToken = conf.testConfig.myWebUITokenToSignUP;
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
                    thingId=ForeignKeys.thingId;
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
                redisHandler.flushDb(function(){
                    done()
                });
            });
        });
    });



    testTypeMessage="POST /device/:id/actions/getDeviceObservationsRedisNotification";

    describe(testTypeMessage, function () {
        testMessage="must test access_token authentication";
        it(testMessage, function (done) {

            //body: JSON.stringify({observations:observations})
            request.post({
                url: APIURL +'/device/' + deviceId +'/action/getDeviceObservationsRedisNotification',
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Unauthorized: Access token required, you are not allowed to use the resource");
                    done();
                }
            });

        });
    });


    describe(testTypeMessage, function () {
        testMessage="must test getDeviceObservationsRedisNotification Api Action";
        it(testMessage, function (done) {

            //body: JSON.stringify({observations:observations})
            request.post({
                url: APIURL +'/device/' + deviceId +'/action/getDeviceObservationsRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);
                    done();
                }
            });

        });
    });

    testTypeMessage="POST /device/:id/actions/getThingObservationsRedisNotification";

    describe(testTypeMessage, function () {
        testMessage="must test getThingObservationsRedisNotification Api Action";
        it(testMessage, function (done) {

            //body: JSON.stringify({observations:observations})
            request.post({
                url: APIURL +'/thing/' + thingId +'/action/getThingObservationsRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property(deviceId);
                    results[deviceId].should.have.properties('redisService');
                    results[deviceId].should.have.properties('channel');
                    results[deviceId].redisService.should.have.properties('host','port','db','password');
                    results[deviceId].channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.observation+deviceId);
                    done();
                }
            });
        });
    });


    testTypeMessage="POST /device/:id/actions/getDeviceRedisNotification";
    describe(testTypeMessage, function () {
        testMessage="must test getDeviceRedisNotification Api Action";
        it(testMessage, function (done) {

            //body: JSON.stringify({observations:observations})
            request.post({
                url: APIURL +'/device/' + deviceId +'/action/getDeviceRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('redisService');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.should.have.property('channel');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                    done();
                }
            });

        });
    });

    testTypeMessage="POST /device/:id/actions/getThingRedisNotification";

    describe(testTypeMessage, function () {
        testMessage="must test getThingRedisNotification Api Action";
        it(testMessage, function (done) {

            //body: JSON.stringify({observations:observations})
            request.post({
                url: APIURL +'/thing/' + thingId +'/action/getThingRedisNotification',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('redisService');
                    results.should.have.property('channel');
                    results.should.have.property('devices');
                    results.redisService.should.have.properties('host','port','db','password');
                    results.channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.thing + thingId);

                    results.devices.should.have.property(deviceId);
                    results.devices[deviceId].should.have.properties('redisService');
                    results.devices[deviceId].should.have.properties('channel');
                    results.devices[deviceId].redisService.should.have.properties('host','port','db','password');
                    results.devices[deviceId].channel.should.be.equal(conf.redisPushNotification.notificationChannelsPrefix.device+deviceId);
                    done();
                }
            });
        });
    });


});

