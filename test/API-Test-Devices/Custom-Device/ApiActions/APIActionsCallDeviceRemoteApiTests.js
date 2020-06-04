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
var Devices = require('../../../../DBEngineHandler/drivers/deviceDriver');
var unitDriver = require('../../../../DBEngineHandler/drivers/unitDriver');
var observationUtility = require('../../../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var thingsDriver = require('../../../../DBEngineHandler/drivers/thingDriver');
var sitesDriver = require('../../../../DBEngineHandler/drivers/siteDriver');
var apiActionsDriver=require('../../../../DBEngineHandler/drivers/apiActionDriver');
var redisHandler=require('../../../../routes/routesHandlers/handlerUtility/redisHandler');

var deviceDocuments = require('../../../SetTestenv/createDevicesDocuments');


var _=require('underscore');

var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/devices";
var APIURLActions = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/apiActions";
var APIURLDevice = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/apiActions/test";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var validUnits={first:null,second:null};

var webUiToken,adminToken;
var deviceId,apiActionId;
var associatedThingId, devicetypeId,observedPropertyId,associateSiteId;
var describeMessage="POST /devices/:id/actions/:actionName";
var actionName="openDoor";




describe('Devices API Test - [ACTIONS TESTS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function (err) {
            if (err) throw (err);
            webUiToken = conf.testConfig.myWebUITokenToSignUP;
            adminToken = conf.testConfig.adminToken;
            done();
        });
    });

    after(function (done) {
        this.timeout(0);
        deviceDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });

    beforeEach(function (done) {

        deviceDocuments.createDocuments(5, function (err, deviceForeignKeys) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - beforreEach - Devices.create ---> " + err);
            deviceId = deviceForeignKeys.deviceId;
            associatedThingId=deviceForeignKeys.thingId;
            devicetypeId=deviceForeignKeys.deviceTypeId;
            var apiAct={
                actionName:actionName,
                queryPrototype:{
                    action:"set true to open, false to close"
                },
                deviceTypeId:devicetypeId
            };
            apiActionsDriver.create(apiAct,function(err,api){
                if (err) consoleLogError.printErrorLog("Device CallRemoteApiTest - beforreEach  ---> " + err);
                var thingApi={
                    api:{
                        url:APIURLDevice,
                        access_token:adminToken
                    },
                };
                apiActionId=api._id;
                thingsDriver.findByIdAndUpdate(associatedThingId,thingApi,function(err,updatedThing){
                    if (err) consoleLogError.printErrorLog("Device CallRemoteApiTest - beforreEach  ---> " + err);
                    done();
                });
            });
        });
    });


    afterEach(function (done) {
        deviceDocuments.deleteDocuments(function (err) {
            if (err) {
                consoleLogError.printErrorLog("Device CallRemoteApiTest.js - afterEach  ---> " + err);
                throw (err);
            }else{
                apiActionsDriver.deleteMany({},function (err) {
                    if (err) {
                        consoleLogError.printErrorLog("Device CallRemoteApiTest.js - afterEach  ---> " + err);
                        throw (err);
                    }else{
                        done();
                    }
                });
            }
        });
    });

    describe(describeMessage, function () {
        var testType="must test device API action ':actionName' get Request prototype";
        it(testType, function (done) {

            request.get({
                url: APIURLActions + "?deviceTypeId="+devicetypeId,
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('apiActions');
                    results.should.have.property('_metadata');
                    results.apiActions[0].should.have.properties("actionName","deviceTypeId","queryPrototype","bodyPrototype","header","method");
                }
                done();
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test device API action ':actionName' device notExist";
        it(testType, function (done) {

            request.get({
                url: APIURL + "/" + associatedThingId + "/actions/" + actionName,
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(404);
                    var results = JSON.parse(body);
                    results.should.have.property('message');
                    results.should.have.property('error');
                    results.should.have.property('statusCode');
                }
                done();
            });
        });
    });

    describe(describeMessage, function () {
        var testType="must test device API action ':actionName' action notExist";
        it(testType, function (done) {

            apiActionsDriver.findByIdAndUpdate(apiActionId,{actionName:"changed"},function(error,changedApiAction){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                request.get({
                    url: APIURL + "/" + deviceId + "/actions/" + actionName,
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(404);
                        var results = JSON.parse(body);
                        results.should.have.property('message');
                        results.should.have.property('error');
                        results.should.have.property('statusCode');
                    }
                    done();
                });
            });
        });
    });

    describe(describeMessage, function () {
        var testType="must test device API action ':actionName' action not for device devicetype";
        it(testType, function (done) {

            apiActionsDriver.findByIdAndUpdate(apiActionId,{deviceTypeId:apiActionsDriver.ObjectId()},function(error,changedApiAction){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                request.get({
                    url: APIURL + "/" + deviceId + "/actions/" + actionName,
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(404);
                        var results = JSON.parse(body);
                        results.should.have.property('message');
                        results.should.have.property('error');
                        results.should.have.property('statusCode');
                    }
                    done();
                });
            });
        });
    });

    describe(describeMessage, function () {
        var testType="must test device API action ':actionName' not authorised from device";
        it(testType, function (done) {
            var thingApi={
                api:{
                    url:APIURLDevice,
                    access_token:webUiToken
                }
            };
            thingsDriver.findByIdAndUpdate(associatedThingId,thingApi,function(error,updatedThing){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                request.get({
                    url: APIURL + "/" + deviceId + "/actions/" + actionName,
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(401);
                        var results = JSON.parse(body);
                        results.should.have.property('message');
                        results.should.have.property('error');
                        results.should.have.property('statusCode');
                        results.message.should.be.eql("Only admin token types can access this resource : 'GET /apiActions/test/:id/:actionName/'");
                    }
                    done();
                });
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test device API action ':actionName";
        it(testType, function (done) {
            request.get({
                url: APIURL + "/" + deviceId + "/actions/" + actionName,
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('device');
                    results.should.have.property('actionName');
                    results.should.have.property('actionParams');
                    results.device.should.be.equal(deviceId.toString());
                    results.actionName.should.be.equal(actionName);
                    var qS=results.actionParams;
                    qS.should.have.property("access_token");
                    qS.should.not.have.property("delay");
                }
                done();
            });
        });
    });

    describe(describeMessage, function () {
        var testType="must test device API action ':actionName with query params";
        it(testType, function (done) {
            request.get({
                url: APIURL + "/" + deviceId + "/actions/" + actionName +"?delay=3000",
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('device');
                    results.should.have.property('actionName');
                    results.should.have.property('actionParams');
                    results.device.should.be.equal(deviceId.toString());
                    results.actionName.should.be.equal(actionName);
                    var qS=results.actionParams;
                    qS.should.have.property("access_token");
                    qS.should.have.property("delay");
                    qS.delay.should.be.equal("3000");
                }
                done();
            });
        });
    });

});

