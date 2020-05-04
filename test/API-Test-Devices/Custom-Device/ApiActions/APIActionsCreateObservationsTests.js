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
var redisHandler=require('../../../../routes/routesHandlers/handlerUtility/redisHandler');

var deviceDocuments = require('../../../SetTestenv/createDevicesDocuments');
var sitesDocuments = require('../../../SetTestenv/createSitesDocuments');

var _=require('underscore');

var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/devices";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var validUnits={first:null,second:null};

var webUiToken;
var deviceId;
var associatedThingId, devicetypeId,observedPropertyId,associateSiteId;
var describeMessage="POST /devices/:id/actions/sendObservations";




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
        deviceDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });

    beforeEach(function (done) {

        deviceDocuments.createDocuments(100, function (err, deviceForeignKeys) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - beforreEach - Devices.create ---> " + err);
            deviceId = deviceForeignKeys.deviceId;
            associatedThingId=deviceForeignKeys.thingId;
            devicetypeId=deviceForeignKeys.deviceTypeId;
            observedPropertyId=deviceForeignKeys.observedPropertyId;
            associateSiteId=deviceForeignKeys.siteId;
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
            if (err) {
                consoleLogError.printErrorLog("Device APIActionsTests.js - afterEach - deleteMany ---> " + err);
                throw (err);
            }else{
                unitDriver.deleteMany({},function(err){
                    if (err) {
                        consoleLogError.printErrorLog("Device APIActionsTests.js - afterEach - deleteMany ---> " + err);
                        throw (err);
                    }else{
                        observationUtility.deleteMany({},function(err){
                            should(err).be.null();
                            done();
                        });
                    }
                });
            }

        });
    });

    describe(describeMessage, function () {
        var testType="must test API action sendObservations error due to no body";
        it(testType, function (done) {


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
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
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
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
        var testType="must test API action sendObservations [The observation value is out of range]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue+1
                }
            ];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("The observation value is out of range.").should.be.greaterThanOrEqual(0);

                }
                done();
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [The observation(2 values)  value is out of range]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1
                },
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue+1
                }
            ];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("The observation value is out of range.").should.be.greaterThanOrEqual(0);
                    results.message.indexOf(deviceId).should.be.greaterThanOrEqual(0);
                    results.message.indexOf(validUnits.first.maxValue+1).should.be.greaterThanOrEqual(0);

                }
                done();
            });
        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to unit is not associated to Device Type]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:unitDriver.ObjectId(),
                    value:validUnits.first.maxValue+1
                }
            ];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Not a valid unitId for this device type.").should.be.greaterThanOrEqual(0);

                }
                done();
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Dismissed Device]";
        it(testType, function (done) {

            Devices.findByIdAndUpdate(deviceId,{dismissed:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else{
                    var observations=[
                        {
                            unitId:unitDriver.ObjectId(),
                            value:validUnits.first.maxValue+1
                        }
                    ];


                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({observations:observations})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(422);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf("The device/thing was removed from available devices/things.").should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });


        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Disabled Device]";
        it(testType, function (done) {

            Devices.findByIdAndUpdate(deviceId,{disabled:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else{
                    var observations=[
                        {
                            unitId:unitDriver.ObjectId(),
                            value:validUnits.first.maxValue+1
                        }
                    ];

                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({observations:observations})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(422);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf("The device/thing was disable. It must be enabled to set observations.").should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });


        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Device not exist]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1
                }
            ];


            request.post({
                url: APIURL +'/' + Devices.ObjectId() +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("The device/thing not exist.").should.be.greaterThanOrEqual(0);

                }
                done();
            });


        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid deviceId]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1
                }
            ];


            request.post({
                url: APIURL +'/undefined' + '/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    console.log(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Unprocessable observation for a device undefined due to undefined is a not valid ObjectId").should.be.greaterThanOrEqual(0);

                }
                done();
            });


        });
    });




    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation not valid due to Device Id is not valid]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1
                }
            ];


            request.post({
                url: APIURL +'/FakeId/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("is a not valid").should.be.greaterThanOrEqual(0);

                }
                done();
            });


        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [create Observation]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1
                }
            ];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.length.should.be.eql(1);
                    results[0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                    unitDriver.ObjectId(results[0].unitId).should.be.eql(validUnits.first._id);
                    results[0].value.should.be.eql(validUnits.first.maxValue-1);
                    Devices.ObjectId(results[0].deviceId).should.be.eql(deviceId);
                    results[0].timestamp.should.be.not.eql(null);
                    should(results[0].location).be.not.null();
                    should(results[0].location).be.not.undefined();
                    should(results[0].location.coordinates).be.not.null();
                    should(results[0].location.coordinates).be.not.undefined();
                    results[0].location.coordinates.length.should.be.eql(2);
                    results[0].location.coordinates[0].should.be.eql(0);
                    results[0].location.coordinates[1].should.be.eql(0);
                }
                done();
            });


        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations [error due to missing value field]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id
                }
            ];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Observation 'value' field missing").should.be.greaterThanOrEqual(0);
                }
                done();
            });


        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [error due to missing value field]";
        it(testType, function (done) {

            var observations=[
                {
                    value:validUnits.first.maxValue-1
                }
            ];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Observation 'unitId' field missing").should.be.greaterThanOrEqual(0);
                }
                done();
            });


        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [void observation array]";
        it(testType, function (done) {

            var observations=[];


            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
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

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                    noValidField:"No Valid Field Test"
                }
            ];

            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Field `noValidField` is not in schema and strict mode is set to throw.");
                }
                done();
            });


        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [3 valid observation, 1 not valid]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                },
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                },
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                },
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                    noValidField:"No Valid Field Test"
                }
            ];

            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Field `noValidField` is not in schema and strict mode is set to throw.");
                    observationUtility.findAll({deviceId:deviceId}, null, null, function(err,data){
                        should(err).be.null();
                        data.should.have.properties("_metadata","observations");
                        data.observations.length.should.be.eql(0);
                        observationUtility.deleteMany({},function(err){
                            should(err).be.null();
                            done();
                        });
                    });
                }
            });
        });
    });



    describe(describeMessage, function () {
        var testType="must test API action sendObservations and redis synchronization [3 valid observation]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                },
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                },
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                }
            ];

            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    _.isArray(results).should.be.equal(true);
                    observationUtility.findAll({deviceId:deviceId}, null, null, function(err,data){
                        should(err).be.null();
                        data.should.have.properties("_metadata","observations");
                        data.observations.length.should.be.eql(3);
                        // wait to redis Sync
                        setTimeout(function () {
                            redisHandler.getObservationsFromCache(deviceId, {returnAsObject: true}, function (err, data) {
                                should(err).be.null();
                                _.isArray(data).should.be.equal(true);
                                data.length.should.be.equal(3);
                                observationUtility.deleteMany({},function(err){
                                    should(err).be.null();
                                    // wait redis sync
                                    setTimeout(function() {
                                        redisHandler.getObservationsFromCache(deviceId, {returnAsObject: true}, function (err, data) {
                                            should(err).be.null();
                                            _.isArray(data).should.be.equal(true);
                                            data.length.should.be.equal(0);
                                            done();

                                        });
                                    },100);

                                });
                            }, 100);
                        })
                    });
                }
            });
        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [observation without location for mobile device]";
        it(testType, function (done) {

            thingsDriver.findByIdAndUpdate(associatedThingId,{mobile:true},function(error,updatedThing){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    var observations=[
                        {
                            unitId:validUnits.first._id,
                            value:validUnits.first.maxValue-1
                        }
                    ];


                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({observations:observations})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(400);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf("Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices").should.be.greaterThanOrEqual(0);
                        }
                        done();
                    });
                }
            });

        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [valid observation for mobile device]";
        it(testType, function (done) {

            thingsDriver.findByIdAndUpdate(associatedThingId,{mobile:true},function(error,updatedThing){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    var observations=[
                        {
                            unitId:validUnits.first._id,
                            value:validUnits.first.maxValue-1,
                            location:{coordinates:[1,1]}
                        }
                    ];


                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({observations:observations})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results[0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                            unitDriver.ObjectId(results[0].unitId).should.be.eql(validUnits.first._id);
                            results[0].value.should.be.eql(validUnits.first.maxValue-1);
                            Devices.ObjectId(results[0].deviceId).should.be.eql(deviceId);
                            results[0].timestamp.should.be.not.eql(null);
                            results[0].location.should.be.eql(observations[0].location);
                            done();
                        }
                    });
                }
            });

        });
    });

    describe(describeMessage, function () {
        var testType="must test API action sendObservations [invalid observation due to invalid location]";
        it(testType, function (done) {

            thingsDriver.findByIdAndUpdate(associatedThingId,{mobile:true},function(error,updatedThing){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    var observations=[
                        {
                            unitId:validUnits.first._id,
                            value:validUnits.first.maxValue-1,
                            location:{coordinates:[360,0]}
                        }
                    ];


                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({observations:observations})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(400);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf('Invalid location coordinates: longitude must be in range [-180,180]').should.be.greaterThanOrEqual(0);
                            done();
                        }
                    });
                }
            });

        });
    });


    describe(describeMessage, function () {
        var testType="must test API action sendObservations [invalid observation due to invalid location]";
        it(testType, function (done) {

            thingsDriver.findByIdAndUpdate(associatedThingId,{mobile:true},function(error,updatedThing){
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    var observations=[
                        {
                            unitId:validUnits.first._id,
                            value:validUnits.first.maxValue-1,
                            location:{coordinates:[0,360]}
                        }
                    ];


                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({observations:observations})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(400);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf('Invalid location coordinates: latitude must be in range [-90,90]').should.be.greaterThanOrEqual(0);
                            done();
                        }
                    });
                }
            });

        });
    });

    describe(describeMessage, function () {
        var testType="must test API action sendObservations [error due to location set for not mobile device]";
        it(testType, function (done) {

            var observations=[
                {
                    unitId:validUnits.first._id,
                    value:validUnits.first.maxValue-1,
                    location:{coordinates:[1,1]}
                }
            ];

            request.post({
                url: APIURL +'/' + deviceId +'/actions/sendObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({observations:observations})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Location field must be set only for mobile devices").should.be.greaterThanOrEqual(0);
                    done();
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

                                    var observations=[
                                        {
                                            unitId:validUnits.first._id,
                                            value:validUnits.first.maxValue-1
                                        }
                                    ];

                                    request.post({
                                        url: APIURL +'/' + deviceId +'/actions/sendObservations',
                                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                        body: JSON.stringify({observations:observations})
                                    }, function (error, response, body) {
                                        if (error) consoleLogError.printErrorLog(describeMessage+": '" + testType + "'  -->" + error.message);
                                        else {
                                            response.statusCode.should.be.equal(200);
                                            var results = JSON.parse(body);
                                            results[0].should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                            unitDriver.ObjectId(results[0].unitId).should.be.eql(validUnits.first._id);
                                            results[0].value.should.be.eql(observations[0].value);
                                            Devices.ObjectId(results[0].deviceId).should.be.eql(deviceId);
                                            results[0].timestamp.should.be.not.eql(null);
                                            results[0].location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                            results[0].location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);
                                            done();
                                        }
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

