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
var deviceDocuments = require('../../../SetTestenv/createDevicesDocuments');
var sitesDocuments = require('../../../SetTestenv/createSitesDocuments');

var _=require('underscore');
var redisHandler=require('../../../../routes/routesHandlers/handlerUtility/redisHandler');

var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/things";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var validUnits={first:null,second:null};
var webUiToken;
var thingID;
var associatedThingId, devicetypeId,observedPropertyId,associateSiteId;
var describeMessage="POST /things/:id/actions/sendObservations";



function getDevices(number,callback){
    Devices.findAll({},null,{limit:number},function(err,foundDevices){
        should(err).be.null();
        foundDevices.should.have.properties("_metadata","devices");
        foundDevices.devices.length.should.be.eql(number);
        callback(foundDevices.devices);
    });
};


describe('Thing observation actions API Test - [ACTIONS TESTS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function (err) {
            if (err) throw (err);
            webUiToken = conf.testConfig.myWebUITokenToSignUP;
            observationUtility.deleteMany({}, function (err, elm) {
                if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - deleteMany ---> " + err);
                done();
            });
        });
    });

    after(function (done) {
        this.timeout(0);
        observationUtility.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - deleteMany ---> " + err);
            Devices.deleteMany({}, function (err, elm) {
                if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - deleteMany ---> " + err);
                commonFunctioTest.resetAuthMsStatus(function (err) {
                    if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                    done();
                });
            });
        });
    });


    beforeEach(function (done) {

        deviceDocuments.createDocuments(100, function (err, ForeignKeys) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - beforreEach - Devices.create ---> " + err);
            thingID = ForeignKeys.thingId;
            associatedThingId=ForeignKeys.thingId;
            devicetypeId=ForeignKeys.deviceTypeId;
            observedPropertyId=ForeignKeys.observedPropertyId;
            associateSiteId=ForeignKeys.siteId;
            unitDriver.create({
                name: "name",
                symbol: "symbol",
                minValue: 0,
                maxValue: 10,
                observedPropertyId: observedPropertyId
            },function(err,unitId){
                validUnits.first=unitId;
                unitDriver.create({
                    name: "nameBis",
                    symbol: "symbolBis",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: observedPropertyId
                },function(err,unitIdBis){
                    validUnits.second=unitIdBis;
                    done()
                })
            });
        });
    });


    afterEach(function (done) {
        deviceDocuments.deleteDocuments(function (err) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - afterEach - deleteMany ---> " + err);
            observationUtility.deleteMany({}, function (err, elm) {
                if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - afterEach - deleteMany ---> " + err);
                unitDriver.deleteMany({},function(err){
                    if (err) {
                        consoleLogError.printErrorLog("Device APIActionsTests.js - afterEach - deleteMany ---> " + err);
                        throw (err);
                    }
                    done();
                });
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations error due to no body";
        it(testType, function (done) {


            request.post({
                url: APIURL +'/' + thingID +'/actions/sendObservations',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body missing');

                }
                done();
            });
        });

    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations error due to observations body field missing";
        it(testType, function (done) {

            request.post({
                url: APIURL +'/' + thingID +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({skip: 0})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("body fields 'observations' missing or empty");

                }
                done();
            });
        });

    });





    describe(describeMessage, function () {
        var testType="must test API action sendObservations [One observation value is out of range]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var notValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue+1
                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=notValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(422);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("The observation value is out of range.").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(deviceList[0]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[1]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[2]._id).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation value is out of range two or more observations for device]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var notValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue+1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=notValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(422);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("The observation value is out of range.").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(deviceList[0]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[1]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[2]._id).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to unit is not associated to Device Type]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var notValidObservations=[
                            {
                                unitId:unitDriver.ObjectId(),
                                value:validUnits.first.maxValue+1
                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=notValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(422);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("Not a valid unitId for this device type.").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(deviceList[0]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[1]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[2]._id).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Dismissed Device]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;


                        Devices.findByIdAndUpdate(deviceList[0]._id,{dismissed:true},function(error,dismissedDev){
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else{

                                request.post({
                                    url: APIURL +'/' + thingID +'/actions/sendObservations',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({observations:thingObservations})
                                }, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(422);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf("The device/thing was removed from available devices/things.").should.be.greaterThanOrEqual(0);
                                        results.message.indexOf(deviceList[0]._id).should.be.greaterThanOrEqual(0);
                                        observationUtility.findAll({},null,null,function(err,foundObs){
                                            if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                            else {
                                                foundObs.should.have.properties("observations", "_metadata");
                                                foundObs.observations.length.should.be.eql(0);
                                                done();
                                            }
                                        });
                                    }

                                });
                            }
                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Disabled Device]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;


                        Devices.findByIdAndUpdate(deviceList[0]._id,{disabled:true},function(error,dismissedDev){
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else{

                                request.post({
                                    url: APIURL +'/' + thingID +'/actions/sendObservations',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({observations:thingObservations})
                                }, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(422);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf("The device/thing was disable. It must be enabled to set observations.").should.be.greaterThanOrEqual(0);
                                        results.message.indexOf(deviceList[0]._id).should.be.greaterThanOrEqual(0);
                                        observationUtility.findAll({},null,null,function(err,foundObs){
                                            if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                            else {
                                                foundObs.should.have.properties("observations", "_metadata");
                                                foundObs.observations.length.should.be.eql(0);
                                                done();
                                            }
                                        });
                                    }

                                });
                            }
                        });
                    });
                }
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Device not exist]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var thingObservations={};
                        var invalidDeviceID=Devices.ObjectId();
                        thingObservations[invalidDeviceID]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;

                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(422);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("The device/thing not exist.").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(invalidDeviceID).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });

                    });
                }
            });
        });
    });







    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Dismissed Thing]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;


                        thingsDriver.findByIdAndUpdate(thingID,{dismissed:true},function(error,dismissedThing){
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else{

                                dismissedThing.dismissed.should.be.true();
                                request.post({
                                    url: APIURL +'/' + thingID +'/actions/sendObservations',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({observations:thingObservations})
                                }, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(422);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf("was removed from available devices/things.").should.be.greaterThanOrEqual(0);
                                        results.message.indexOf(thingID).should.be.greaterThanOrEqual(0);
                                        observationUtility.findAll({},null,null,function(err,foundObs){
                                            if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                            else {
                                                foundObs.should.have.properties("observations", "_metadata");
                                                foundObs.observations.length.should.be.eql(0);
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Disabled Thing]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;


                        thingsDriver.findByIdAndUpdate(thingID,{disabled:true},function(error,disabledThing){
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else{
                                 disabledThing.disabled.should.be.true();
                                request.post({
                                    url: APIURL +'/' + thingID +'/actions/sendObservations',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({observations:thingObservations})
                                }, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(422);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf(" was disable. It must be enabled to set observations.").should.be.greaterThanOrEqual(0);
                                        results.message.indexOf(thingID).should.be.greaterThanOrEqual(0);
                                        observationUtility.findAll({},null,null,function(err,foundObs){
                                            if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                            else {
                                                foundObs.should.have.properties("observations", "_metadata");
                                                foundObs.observations.length.should.be.eql(0);
                                                done();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Thing not exist]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;

                        var thingIdFake=thingsDriver.ObjectId();
                        request.post({
                            url: APIURL +'/' + thingIdFake +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(422);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("not exist.").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(thingIdFake).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });

                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [create Observation]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1
                            }
                        ];
                        var otherValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1
                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=otherValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.properties(deviceList[0]._id,deviceList[1]._id,deviceList[2]._id);


                                results[deviceList[0]._id].length.should.be.eql(2);
                                results[deviceList[0]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                unitDriver.ObjectId(results[deviceList[0]._id][1].unitId).should.be.eql(validUnits.first._id);
                                results[deviceList[0]._id][0].value.should.be.eql(validUnits.first.maxValue-1);
                                results[deviceList[0]._id][1].value.should.be.eql(validUnits.first.minValue+1);
                                Devices.ObjectId(results[deviceList[0]._id][0].deviceId).should.be.eql(deviceList[0]._id);
                                Devices.ObjectId(results[deviceList[0]._id][1].deviceId).should.be.eql(deviceList[0]._id);
                                results[deviceList[0]._id][0].timestamp.should.be.not.eql(null);
                                should(results[deviceList[0]._id][0].location).be.not.null();
                                should(results[deviceList[0]._id][0].location).be.not.undefined();
                                should(results[deviceList[0]._id][0].location.coordinates).be.not.null();
                                should(results[deviceList[0]._id][0].location.coordinates).be.not.undefined();
                                results[deviceList[0]._id][0].location.coordinates.length.should.be.eql(2);
                                results[deviceList[0]._id][0].location.coordinates[0].should.be.eql(0);
                                results[deviceList[0]._id][0].location.coordinates[1].should.be.eql(0);
                                results[deviceList[0]._id][1].timestamp.should.be.not.eql(null);
                                should(results[deviceList[0]._id][1].location).be.not.null();
                                should(results[deviceList[0]._id][1].location).be.not.undefined();
                                should(results[deviceList[0]._id][1].location.coordinates).be.not.null();
                                should(results[deviceList[0]._id][1].location.coordinates).be.not.undefined();
                                results[deviceList[0]._id][1].location.coordinates.length.should.be.eql(2);
                                results[deviceList[0]._id][1].location.coordinates[0].should.be.eql(0);
                                results[deviceList[0]._id][1].location.coordinates[1].should.be.eql(0);

                                results[deviceList[1]._id].length.should.be.eql(2);
                                results[deviceList[1]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                unitDriver.ObjectId(results[deviceList[0]._id][1].unitId).should.be.eql(validUnits.first._id);
                                results[deviceList[1]._id][0].value.should.be.eql(validUnits.first.maxValue-1);
                                results[deviceList[1]._id][1].value.should.be.eql(validUnits.first.minValue+1);
                                Devices.ObjectId(results[deviceList[1]._id][0].deviceId).should.be.eql(deviceList[1]._id);
                                Devices.ObjectId(results[deviceList[1]._id][1].deviceId).should.be.eql(deviceList[1]._id);
                                results[deviceList[1]._id][0].timestamp.should.be.not.eql(null);
                                should(results[deviceList[1]._id][0].location).be.not.null();
                                should(results[deviceList[1]._id][0].location).be.not.undefined();
                                should(results[deviceList[1]._id][0].location.coordinates).be.not.null();
                                should(results[deviceList[1]._id][0].location.coordinates).be.not.undefined();
                                results[deviceList[1]._id][0].location.coordinates.length.should.be.eql(2);
                                results[deviceList[1]._id][0].location.coordinates[0].should.be.eql(0);
                                results[deviceList[1]._id][0].location.coordinates[1].should.be.eql(0);
                                results[deviceList[1]._id][1].timestamp.should.be.not.eql(null);
                                should(results[deviceList[1]._id][1].location).be.not.null();
                                should(results[deviceList[1]._id][1].location).be.not.undefined();
                                should(results[deviceList[1]._id][1].location.coordinates).be.not.null();
                                should(results[deviceList[1]._id][1].location.coordinates).be.not.undefined();
                                results[deviceList[1]._id][1].location.coordinates.length.should.be.eql(2);
                                results[deviceList[1]._id][1].location.coordinates[0].should.be.eql(0);
                                results[deviceList[1]._id][1].location.coordinates[1].should.be.eql(0);


                                results[deviceList[2]._id].length.should.be.eql(1);
                                results[deviceList[2]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                results[deviceList[2]._id][0].value.should.be.eql(validUnits.first.minValue+1);
                                Devices.ObjectId(results[deviceList[2]._id][0].deviceId).should.be.eql(deviceList[2]._id);
                                results[deviceList[2]._id][0].timestamp.should.be.not.eql(null);
                                should(results[deviceList[2]._id][0].location).be.not.null();
                                should(results[deviceList[2]._id][0].location).be.not.undefined();
                                should(results[deviceList[2]._id][0].location.coordinates).be.not.null();
                                should(results[deviceList[2]._id][0].location.coordinates).be.not.undefined();
                                results[deviceList[2]._id][0].location.coordinates.length.should.be.eql(2);
                                results[deviceList[2]._id][0].location.coordinates[0].should.be.eql(0);
                                results[deviceList[2]._id][0].location.coordinates[1].should.be.eql(0);

                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(5);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });





    describe(describeMessage, function () {
        var testType="must test API action sendObservations and redis synchronization [create Observation]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1
                            }
                        ];
                        var otherValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1
                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=otherValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.properties(deviceList[0]._id,deviceList[1]._id,deviceList[2]._id);


                                results[deviceList[0]._id].length.should.be.eql(2);
                                results[deviceList[0]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                unitDriver.ObjectId(results[deviceList[0]._id][1].unitId).should.be.eql(validUnits.first._id);
                                results[deviceList[0]._id][0].value.should.be.eql(validUnits.first.maxValue-1);
                                results[deviceList[0]._id][1].value.should.be.eql(validUnits.first.minValue+1);
                                Devices.ObjectId(results[deviceList[0]._id][0].deviceId).should.be.eql(deviceList[0]._id);
                                Devices.ObjectId(results[deviceList[0]._id][1].deviceId).should.be.eql(deviceList[0]._id);
                                results[deviceList[0]._id][0].timestamp.should.be.not.eql(null);
                                should(results[deviceList[0]._id][0].location).be.not.null();
                                should(results[deviceList[0]._id][0].location).be.not.undefined();
                                should(results[deviceList[0]._id][0].location.coordinates).be.not.null();
                                should(results[deviceList[0]._id][0].location.coordinates).be.not.undefined();
                                results[deviceList[0]._id][0].location.coordinates.length.should.be.eql(2);
                                results[deviceList[0]._id][0].location.coordinates[0].should.be.eql(0);
                                results[deviceList[0]._id][0].location.coordinates[1].should.be.eql(0);
                                results[deviceList[0]._id][1].timestamp.should.be.not.eql(null);
                                should(results[deviceList[0]._id][1].location).be.not.null();
                                should(results[deviceList[0]._id][1].location).be.not.undefined();
                                should(results[deviceList[0]._id][1].location.coordinates).be.not.null();
                                should(results[deviceList[0]._id][1].location.coordinates).be.not.undefined();
                                results[deviceList[0]._id][1].location.coordinates.length.should.be.eql(2);
                                results[deviceList[0]._id][1].location.coordinates[0].should.be.eql(0);
                                results[deviceList[0]._id][1].location.coordinates[1].should.be.eql(0);

                                results[deviceList[1]._id].length.should.be.eql(2);
                                results[deviceList[1]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                unitDriver.ObjectId(results[deviceList[0]._id][1].unitId).should.be.eql(validUnits.first._id);
                                results[deviceList[1]._id][0].value.should.be.eql(validUnits.first.maxValue-1);
                                results[deviceList[1]._id][1].value.should.be.eql(validUnits.first.minValue+1);
                                Devices.ObjectId(results[deviceList[1]._id][0].deviceId).should.be.eql(deviceList[1]._id);
                                Devices.ObjectId(results[deviceList[1]._id][1].deviceId).should.be.eql(deviceList[1]._id);
                                results[deviceList[1]._id][0].timestamp.should.be.not.eql(null);
                                should(results[deviceList[1]._id][0].location).be.not.null();
                                should(results[deviceList[1]._id][0].location).be.not.undefined();
                                should(results[deviceList[1]._id][0].location.coordinates).be.not.null();
                                should(results[deviceList[1]._id][0].location.coordinates).be.not.undefined();
                                results[deviceList[1]._id][0].location.coordinates.length.should.be.eql(2);
                                results[deviceList[1]._id][0].location.coordinates[0].should.be.eql(0);
                                results[deviceList[1]._id][0].location.coordinates[1].should.be.eql(0);
                                results[deviceList[1]._id][1].timestamp.should.be.not.eql(null);
                                should(results[deviceList[1]._id][1].location).be.not.null();
                                should(results[deviceList[1]._id][1].location).be.not.undefined();
                                should(results[deviceList[1]._id][1].location.coordinates).be.not.null();
                                should(results[deviceList[1]._id][1].location.coordinates).be.not.undefined();
                                results[deviceList[1]._id][1].location.coordinates.length.should.be.eql(2);
                                results[deviceList[1]._id][1].location.coordinates[0].should.be.eql(0);
                                results[deviceList[1]._id][1].location.coordinates[1].should.be.eql(0);


                                results[deviceList[2]._id].length.should.be.eql(1);
                                results[deviceList[2]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                results[deviceList[2]._id][0].value.should.be.eql(validUnits.first.minValue+1);
                                Devices.ObjectId(results[deviceList[2]._id][0].deviceId).should.be.eql(deviceList[2]._id);
                                results[deviceList[2]._id][0].timestamp.should.be.not.eql(null);
                                should(results[deviceList[2]._id][0].location).be.not.null();
                                should(results[deviceList[2]._id][0].location).be.not.undefined();
                                should(results[deviceList[2]._id][0].location.coordinates).be.not.null();
                                should(results[deviceList[2]._id][0].location.coordinates).be.not.undefined();
                                results[deviceList[2]._id][0].location.coordinates.length.should.be.eql(2);
                                results[deviceList[2]._id][0].location.coordinates[0].should.be.eql(0);
                                results[deviceList[2]._id][0].location.coordinates[1].should.be.eql(0);

                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(5);
                                        setTimeout(function () {
                                            redisHandler.getObservationsFromCache(deviceList[0]._id, {returnAsObject: true}, function (err, data) {
                                                should(err).be.null();
                                                _.isArray(data).should.be.equal(true);
                                                data.length.should.be.equal(2);
                                                redisHandler.getObservationsFromCache(deviceList[1]._id, {returnAsObject: true}, function (err, data) {
                                                    should(err).be.null();
                                                    _.isArray(data).should.be.equal(true);
                                                    data.length.should.be.equal(2);
                                                    redisHandler.getObservationsFromCache(deviceList[2]._id, {returnAsObject: true}, function (err, data) {
                                                        should(err).be.null();
                                                        _.isArray(data).should.be.equal(true);
                                                        data.length.should.be.equal(1);
                                                        done();
                                                    });
                                                });
                                            }, 100);
                                        })
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [error due to missing 'value' field]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var notValidObservations=[
                            {
                                unitId:validUnits.first._id,

                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=notValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(400);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("Observation 'value' field missing").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(deviceList[0]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[1]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[2]._id).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [error due to missing 'unitId' field]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var notValidObservations=[
                            {
                                value:validUnits.first.maxValue-1

                            }
                        ];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=notValidObservations;
                        thingObservations[deviceList[2]._id]=validObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(400);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("Observation 'unitId' field missing").should.be.greaterThanOrEqual(0);
                                results.message.indexOf(deviceList[0]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[2]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[1]._id).should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [void observation list]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            }
                        ];
                        var notValidObservations=[];

                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=notValidObservations;
                        thingObservations[deviceList[2]._id]=validObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.properties(deviceList[0]._id,deviceList[1]._id,deviceList[2]._id);
                                results[deviceList[0]._id].length.should.be.eql(1);
                                results[deviceList[1]._id].length.should.be.eql(0);
                                results[deviceList[2]._id].length.should.be.eql(1);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(2);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [void observation array]";
        it(testType, function (done) {

            var observations=JSON.stringify({observations:[]});

            request.post({
                url: APIURL +'/' + thingID +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: observations
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("body fields 'observations' missing or empty");
                }
                done();
            });


        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation with not valid field]";
        it(testType, function (done) {
            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1
                            }
                        ];
                        var notValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1,
                                noValidField:"No Valid Field Test"
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=notValidObservations;


                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(400);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.should.be.eql("Field `noValidField` is not in schema and strict mode is set to throw.");
                                results.message.indexOf(deviceList[0]._id).should.be.eql(-1);
                                results.message.indexOf(deviceList[1]._id).should.be.eql(-1);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation without location for mobile device]";

        it(testType, function (done) {

            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1
                            }
                        ];
                        var notValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1,
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=notValidObservations;


                        thingsDriver.findByIdAndUpdate(thingID,{mobile:true},function(error,updatedThing){
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {
                                request.post({
                                    url: APIURL +'/' + thingID +'/actions/sendObservations',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({observations:thingObservations})
                                }, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(400);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf("Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices").should.be.greaterThanOrEqual(0);
                                        observationUtility.findAll({},null,null,function(err,foundObs){
                                            if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                            else {
                                                foundObs.should.have.properties("observations", "_metadata");
                                                foundObs.observations.length.should.be.eql(0);
                                                done();
                                            }
                                        });
                                    }

                                });
                            }
                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [valid observation for mobile device]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1,
                                location:{coordinates:[1,1]}
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1,
                                location:{coordinates:[1,1]}
                            }
                        ];
                        var otherValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1,
                                location:{coordinates:[1,1]}
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=otherValidObservations;

                        thingsDriver.findByIdAndUpdate(thingID,{mobile:true},function(error,updatedThing){
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else{
                                request.post({
                                    url: APIURL +'/' + thingID +'/actions/sendObservations',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({observations:thingObservations})
                                }, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                    else {

                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results[deviceList[0]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                        results[deviceList[1]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                        results[deviceList[2]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                        observationUtility.findAll({},null,null,function(err,foundObs){
                                            if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                            else {
                                                foundObs.should.have.properties("observations", "_metadata");
                                                foundObs.observations.length.should.be.eql(5);
                                                done();
                                            }
                                        });
                                    }

                                });
                            }
                        });
                    });
                }
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [error due to location set for not mobile device]";
        it(testType, function (done) {


            observationUtility.findAll({},null,null,function(err,foundObs){
                if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                else{
                    foundObs.should.have.properties("observations","_metadata");
                    foundObs.observations.length.should.be.eql(0);
                    getDevices(3,function(deviceList){
                        var validObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.maxValue-1,
                                location:{coordinates:[1,1]}
                            },
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1,
                                location:{coordinates:[1,1]}
                            }
                        ];
                        var otherValidObservations=[
                            {
                                unitId:validUnits.first._id,
                                value:validUnits.first.minValue+1,
                                location:{coordinates:[1,1]}
                            }
                        ];
                        var thingObservations={};
                        thingObservations[deviceList[0]._id]=validObservations;
                        thingObservations[deviceList[1]._id]=validObservations;
                        thingObservations[deviceList[2]._id]=otherValidObservations;

                        request.post({
                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({observations:thingObservations})
                        }, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                            else {

                                response.statusCode.should.be.equal(422);
                                var results = JSON.parse(body);
                                results.should.have.property('statusCode');
                                results.should.have.property('error');
                                results.should.have.property('message');
                                results.message.indexOf("Location field must be set only for mobile devices").should.be.greaterThanOrEqual(0);
                                observationUtility.findAll({},null,null,function(err,foundObs){
                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                    else {
                                        foundObs.should.have.properties("observations", "_metadata");
                                        foundObs.observations.length.should.be.eql(0);
                                        done();
                                    }
                                });
                            }

                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [device in site hierarchy]";
        it(testType, function (done) {

            sitesDocuments.createDocuments(1,function(error,foreignKey){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    sitesDriver.findByIdAndUpdate(associateSiteId,{location:null,locatedInSiteId:foreignKey.siteId},function(error,updatedSite){
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {

                            updatedSite=JSON.parse(JSON.stringify(updatedSite));
                            should(updatedSite.location).be.eql(null);
                            Devices.ObjectId(updatedSite.locatedInSiteId).should.be.eql(foreignKey.siteId);
                            sitesDriver.findByIdAndUpdate(foreignKey.siteId,{locatedInSiteId:null,location:{coordinates:[2,2]}},function(error,updatedSite){
                                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                else {
                                    updatedSite.location.should.be.not.eql(null);
                                    should(updatedSite.locatedInSiteId).be.eql(null);
                                    updatedSite.location.coordinates[0].should.be.eql(2);
                                    updatedSite.location.coordinates[1].should.be.eql(2);


                                    getDevices(3,function(deviceList){
                                        var validObservations=[
                                            {
                                                unitId:validUnits.first._id,
                                                value:validUnits.first.maxValue-1
                                            },
                                            {
                                                unitId:validUnits.first._id,
                                                value:validUnits.first.minValue+1
                                            }
                                        ];
                                        var otherValidObservations=[
                                            {
                                                unitId:validUnits.first._id,
                                                value:validUnits.first.minValue+1
                                            }
                                        ];
                                        var thingObservations={};
                                        thingObservations[deviceList[0]._id]=validObservations;
                                        thingObservations[deviceList[1]._id]=validObservations;
                                        thingObservations[deviceList[2]._id]=otherValidObservations;

                                        request.post({
                                            url: APIURL +'/' + thingID +'/actions/sendObservations',
                                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                            body: JSON.stringify({observations:thingObservations})
                                        }, function (error, response, body) {
                                            if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                            else {

                                                response.statusCode.should.be.equal(200);
                                                var results = JSON.parse(body);
                                                results[deviceList[0]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                                results[deviceList[0]._id][1].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                                results[deviceList[1]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                                results[deviceList[1]._id][1].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                                results[deviceList[2]._id][0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");

                                                unitDriver.ObjectId(results[deviceList[0]._id][0].unitId).should.be.eql(validUnits.first._id);
                                                unitDriver.ObjectId(results[deviceList[0]._id][1].unitId).should.be.eql(validUnits.first._id);
                                                unitDriver.ObjectId(results[deviceList[1]._id][0].unitId).should.be.eql(validUnits.first._id);
                                                unitDriver.ObjectId(results[deviceList[1]._id][1].unitId).should.be.eql(validUnits.first._id);
                                                unitDriver.ObjectId(results[deviceList[2]._id][0].unitId).should.be.eql(validUnits.first._id);

                                                results[deviceList[0]._id][0].timestamp.should.be.not.eql(null);
                                                results[deviceList[0]._id][1].timestamp.should.be.not.eql(null);
                                                results[deviceList[1]._id][0].timestamp.should.be.not.eql(null);
                                                results[deviceList[1]._id][1].timestamp.should.be.not.eql(null);
                                                results[deviceList[2]._id][0].timestamp.should.be.not.eql(null);

                                                results[deviceList[0]._id][0].location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                                results[deviceList[0]._id][0].location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);
                                                results[deviceList[0]._id][1].location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                                results[deviceList[0]._id][1].location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);
                                                results[deviceList[1]._id][0].location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                                results[deviceList[1]._id][0].location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);
                                                results[deviceList[1]._id][1].location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                                results[deviceList[1]._id][1].location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);

                                                results[deviceList[2]._id][0].location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                                results[deviceList[2]._id][0].location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);


                                                observationUtility.findAll({},null,null,function(err,foundObs){
                                                    if (err) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + err.message);
                                                    else {
                                                        foundObs.should.have.properties("observations", "_metadata");
                                                        foundObs.observations.length.should.be.eql(5);
                                                        done();
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                            })
                        }
                    });
                }
            });
        });
    });
});

