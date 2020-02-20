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

var Observations = require('../../../DBEngineHandler/drivers/observationDriver');
var deviceDriver = require('../../../DBEngineHandler/drivers/deviceDriver');
var thingDriver = require('../../../DBEngineHandler/drivers/thingDriver');
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var Unit = require('../../../DBEngineHandler/drivers/unitDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/observations" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var observationDocuments=require('../../SetTestenv/createObservationsDocuments');
var siteDocuments=require('../../SetTestenv/createSitesDocuments');
var should=require('should');

var webUiToken,testObservationDef,unitCollection,associateSiteId;

describe('Observations API Test - [DATA VALIDATION]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Observations.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        observationDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Observations.create ---> " + err);
            // observationId=ForeignKeys.observationId;
            Unit.findById(ForeignKeys.unitId,function(err,unit){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Observations.create ---> " + err);
                testObservationDef= {
                    timestamp: new Date().getTime(),
                    value:unit.minValue+1,
                    deviceId: ForeignKeys.deviceId,
                    unitId: ForeignKeys.unitId
                };
                unitCollection=unit;
                associateSiteId=ForeignKeys.siteId;
                done();
            });
        });
    });


    afterEach(function (done) {
        observationDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err);
            done();
        });
    });


    /******************************************************************************************************************
     ****************************************************** POST ******************************************************
     ***************************************************************************************************************** */


    var testMessageMessage='POST /observation';
    var testMessage;



    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [device in site hierarchy]";
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1,function(error,foreignKey){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    siteDriver.findByIdAndUpdate(associateSiteId,{location:null,locatedInSiteId:foreignKey.siteId},function(error,updatedSite){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else {

                            updatedSite=JSON.parse(JSON.stringify(updatedSite));
                            should(updatedSite.location).be.eql(null);
                            siteDriver.ObjectId(updatedSite.locatedInSiteId).should.be.eql(foreignKey.siteId);


                            siteDriver.findByIdAndUpdate(foreignKey.siteId,{locatedInSiteId:null,location:{coordinates:[2,2]}},function(error,updatedSite){
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                else {
                                    updatedSite.location.should.be.not.eql(null);
                                    should(updatedSite.locatedInSiteId).be.eql(null);
                                    updatedSite.location.coordinates[0].should.be.eql(2);
                                    updatedSite.location.coordinates[1].should.be.eql(2);


                                    request.post({
                                        url: APIURL,
                                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                                        body: JSON.stringify({observation:testObservationDef})
                                    }, function (error, response, body) {
                                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                        else {
                                            response.statusCode.should.be.equal(201);
                                            var results = JSON.parse(body);
                                            results.should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                            Unit.ObjectId(results.unitId).should.be.eql(testObservationDef.unitId);
                                            results.value.should.be.eql(testObservationDef.value);
                                            deviceDriver.ObjectId(results.deviceId).should.be.eql(testObservationDef.deviceId);
                                            results.timestamp.should.be.not.eql(null);
                                            results.location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                            results.location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);
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


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [error due to location set for not mobile device]";
        it(testMessage, function (done) {


            testObservationDef.location= {coordinates:[1,1]};
            request.post({
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: JSON.stringify({observation:testObservationDef})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Location field must be set only for mobile devices").should.be.greaterThanOrEqual(0);
                }
                done();
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [valid observation for mobile device]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location= {coordinates:[1,1]};
                            request.post({
                                url: APIURL,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                                body: JSON.stringify({observation:testObservationDef})
                            }, function (error, response, body) {
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(201);
                                    var results = JSON.parse(body);
                                    results.should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                    results.timestamp.should.be.not.eql(null);
                                    results.location.should.be.eql(testObservationDef.location);

                                }
                                done();
                            });
                        }
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [invalid observation due to invalid location]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location= {coordinates:[360,90]};
                            request.post({
                                url: APIURL,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                                body: JSON.stringify({observation:testObservationDef})
                            }, function (error, response, body) {
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(400);
                                    var results = JSON.parse(body);
                                    results.should.have.property('statusCode');
                                    results.should.have.property('error');
                                    results.should.have.property('message');
                                    results.message.indexOf('Invalid location coordinates: longitude must be in range [-180,180]').should.be.greaterThanOrEqual(0);

                                }
                                done();
                            });
                        }
                    });
                }
            });
        });
    });

    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [invalid observation due to invalid location]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location= {coordinates:[90,360]};
                            request.post({
                                url: APIURL,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                                body: JSON.stringify({observation:testObservationDef})
                            }, function (error, response, body) {
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(400);
                                    var results = JSON.parse(body);
                                    results.should.have.property('statusCode');
                                    results.should.have.property('error');
                                    results.should.have.property('message');
                                    results.message.indexOf('Invalid location coordinates: latitude must be in range [-90,90]').should.be.greaterThanOrEqual(0);

                                }
                                done();
                            });
                        }
                    });
                }
            });
        });
    });



    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [invalid observation(mobile) due to invalid location as text]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location="Ciao";
                            request.post({
                                url: APIURL,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                                body: JSON.stringify({observation:testObservationDef})
                            }, function (error, response, body) {
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(400);
                                    var results = JSON.parse(body);
                                    results.should.have.property('statusCode');
                                    results.should.have.property('error');
                                    results.should.have.property('message');
                                    results.message.indexOf('Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices').should.be.greaterThanOrEqual(0);

                                }
                                done();
                            });
                        }
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [invalid observation(not mobile) due to invalid location as text]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    testObservationDef.location="Ciao";
                    request.post({
                        url: APIURL,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                        body: JSON.stringify({observation:testObservationDef})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(422);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf('Location field must be set only for mobile devices.').should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });
        });
    });



    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation without location for mobile device]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location=undefined;
                            request.post({
                                url: APIURL,
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                                body: JSON.stringify({observation:testObservationDef})
                            }, function (error, response, body) {
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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
                }
            });
        });
    });



    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [error due to missing value field]";
        it(testMessage, function (done) {

            testObservationDef.value=undefined;
            request.post({
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: JSON.stringify({observation:testObservationDef})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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

    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation not valid due to Device Id is not valid]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{disabled:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{

                    testObservationDef.deviceId="fakeID";
                    request.post({
                        url: APIURL,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                        body: JSON.stringify({observation:testObservationDef})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(400);
                            var results = JSON.parse(body);
                            results.should.have.property('statusCode');
                            results.should.have.property('error');
                            results.should.have.property('message');
                            results.message.indexOf("fakeID is a not valid ObjectId").should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation not valid due to unitId Id is not valid]";
        it(testMessage, function (done) {

            testObservationDef.unitId="fakeID";
            request.post({
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: JSON.stringify({observation:testObservationDef})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(422);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.indexOf("Not a valid unitId for this device type").should.be.greaterThanOrEqual(0);

                }
                done();
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation not valid due to Device not exist]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{disabled:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{

                    testObservationDef.deviceId=deviceDriver.ObjectId();
                    request.post({
                        url: APIURL,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                        body: JSON.stringify({observation:testObservationDef})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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
                }
            });
        });
    });




    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation not valid due to Disabled Device]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{disabled:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{

                    request.post({
                        url: APIURL,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                        body: JSON.stringify({observation:testObservationDef})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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



    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation not valid due to Dismissed Device]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{dismissed:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{

                    request.post({
                        url: APIURL,
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                        body: JSON.stringify({observation:testObservationDef})
                    }, function (error, response, body) {
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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


    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [observation not valid due to unit is not associated to Device Type]";
        it(testMessage, function (done) {


            testObservationDef.unitId=Unit.ObjectId();


            request.post({
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: JSON.stringify({observation:testObservationDef})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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




    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [The observation value is out of range]";
        it(testMessage, function (done) {

            testObservationDef.value=unitCollection.maxValue+1;

            request.post({
                url: APIURL ,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: JSON.stringify({observation:testObservationDef})
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
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



    describe(testMessageMessage, function(){
        testMessage='must test observation creation [no valid observation field - field is not in the schema]';
        it(testMessage, function(done){
            testObservationDef["noschemaField"]="invalid";
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("Field `noschemaField` is not in schema and strict mode is set to throw.");
                }
                done();
            });

        });
    });

    describe(testMessageMessage, function(){
        testMessage='must test observation creation [data validation error due to required fields missing]';
        it(testMessage, function(done){
            testObservationDef.unitId=undefined;
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("Observation 'unitId' field missing");
                }
               done();
            });

        });
    });

    describe(testMessageMessage, function(){
        testMessage='must test observation creation [data validation error due to invalid field deviceId]';
        it(testMessage, function(done){
            testObservationDef.deviceId=undefined;
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("Observation 'deviceId' field missing");
                }
                done();
            });

        });
    });





    /******************************************************************************************************************
     ****************************************************** PUT ******************************************************
     ***************************************************************************************************************** */

    testMessageMessage='PUT /observation';

    describe(testMessageMessage, function(){
        testMessage='must test observation update [no valid observation field - field is not in the schema]';
        it(testMessage, function(done){

            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:{noschemaField:"invalid"}});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Field `noschemaField` is not in schema and strict mode is set to throw.");
                    }
                    done();
                });
            });
        });
    });


    describe(testMessageMessage, function(){
        testMessage='must test observation update [data validation error due to invalid field deviceId]';
        it(testMessage, function(done){
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                testObservationDef.deviceId="deviceId";
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Cast to ObjectId failed for value \"deviceId\" at path \"deviceId\"");
                    }
                    done();
                });
            });
        });
    });

    describe(testMessageMessage, function(){
        testMessage='must test observation update [data validation error due to invalid field unitId]';
        it(testMessage, function(done){
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                testObservationDef.unitId="unitId";
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Cast to ObjectId failed for value \"unitId\" at path \"unitId\"");
                    }
                    done();
                });
            });
        });
    });


    describe(testMessageMessage, function(){
        testMessage='must test observation update [data validation error, set location as text value]';
        it(testMessage, function(done){
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                testObservationDef.location="deviceId";
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(422);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Location field must be set only for mobile devices.");
                    }
                    done();
                });
            });
        });
    });


    // From Here test to Fix

    describe(testMessageMessage, function () {
        var testMessage="must test update observation [device in site hierarchy]";
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1,function(error,foreignKey){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    siteDriver.findByIdAndUpdate(associateSiteId,{location:null,locatedInSiteId:foreignKey.siteId},function(error,updatedSite){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else {

                            updatedSite=JSON.parse(JSON.stringify(updatedSite));
                            should(updatedSite.location).be.eql(null);
                            siteDriver.ObjectId(updatedSite.locatedInSiteId).should.be.eql(foreignKey.siteId);


                            siteDriver.findByIdAndUpdate(foreignKey.siteId,{locatedInSiteId:null,location:{coordinates:[2,2]}},function(error,updatedSite){
                                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                                else {
                                    updatedSite.location.should.be.not.eql(null);
                                    should(updatedSite.locatedInSiteId).be.eql(null);
                                    updatedSite.location.coordinates[0].should.be.eql(2);
                                    updatedSite.location.coordinates[1].should.be.eql(2);


                                    Observations.findOne({}, null, function(err, observation){
                                        should(err).be.null();
                                        testObservationDef.location="deviceId";
                                        var bodyParam=JSON.stringify({observation:{deviceId:testObservationDef.deviceId}});
                                        var requestParams={
                                            url:APIURL+"/" + observation._id,
                                            headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                                            body:bodyParam
                                        };
                                        request.put(requestParams,function(error, response, body){
                                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                            else{
                                                response.statusCode.should.be.equal(200);
                                                var results = JSON.parse(body);
                                                results.should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                                Unit.ObjectId(results.unitId).should.be.eql(testObservationDef.unitId);
                                                results.value.should.be.eql(testObservationDef.value);
                                                deviceDriver.ObjectId(results.deviceId).should.be.eql(testObservationDef.deviceId);
                                                results.timestamp.should.be.not.eql(null);
                                                results.location.coordinates[0].should.be.eql(updatedSite.location.coordinates[0]);
                                                results.location.coordinates[1].should.be.eql(updatedSite.location.coordinates[1]);
                                                done();
                                            }
                                            done();
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


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [error due to location set for not mobile device]";
        it(testMessage, function (done) {



            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                testObservationDef.location="deviceId";
                var bodyParam=JSON.stringify({observation:{location: {coordinates:[1,1]}}});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(422);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Location field must be set only for mobile devices.");
                    }
                    done();
                });
            });

        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [valid observation for mobile device]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location= {coordinates:[1,1]};

                            Observations.findOne({}, null, function(err, observation){
                                should(err).be.null();
                                testObservationDef.location="deviceId";
                                var bodyParam=JSON.stringify({observation:{location: {coordinates:[1,1]}}});
                                var requestParams={
                                    url:APIURL+"/" + observation._id,
                                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                                    body:bodyParam
                                };
                                request.put(requestParams,function(error, response, body){
                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                    else{
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.should.have.properties("unitId","deviceId","location","value","timestamp","_id");
                                        results.timestamp.should.be.not.eql(null);
                                        results.location.should.be.eql(testObservationDef.location);
                                    }
                                    done();
                                });
                            });
                        }
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [invalid observation due to invalid location]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{


                            Observations.findOne({}, null, function(err, observation){
                                should(err).be.null();
                                testObservationDef.location="deviceId";
                                var bodyParam=JSON.stringify({observation:{location: {coordinates:[360,90]}}});
                                var requestParams={
                                    url:APIURL+"/" + observation._id,
                                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                                    body:bodyParam
                                };
                                request.put(requestParams,function(error, response, body){
                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                    else{
                                        response.statusCode.should.be.equal(400);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf('Invalid location coordinates: longitude must be in range [-180,180]').should.be.greaterThanOrEqual(0);

                                    }
                                    done();
                                });
                            });
                        }
                    });
                }
            });
        });
    });

    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [invalid observation due to invalid location]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{


                            Observations.findOne({}, null, function(err, observation){
                                should(err).be.null();
                                testObservationDef.location="deviceId";
                                var bodyParam=JSON.stringify({observation:{location: {coordinates:[90,360]}}});
                                var requestParams={
                                    url:APIURL+"/" + observation._id,
                                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                                    body:bodyParam
                                };
                                request.put(requestParams,function(error, response, body){
                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                    else{
                                        response.statusCode.should.be.equal(400);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf('Invalid location coordinates: latitude must be in range [-90,90]').should.be.greaterThanOrEqual(0);

                                    }
                                    done();
                                });
                            });
                        }
                    });
                }
            });
        });
    });



    describe(testMessageMessage, function () {
        var testMessage="must test API action sendObservations [invalid observation(mobile) due to invalid location as text]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location="Ciao";

                            Observations.findOne({}, null, function(err, observation){
                                should(err).be.null();
                                testObservationDef.location="deviceId";
                                var bodyParam=JSON.stringify({observation:testObservationDef});
                                var requestParams={
                                    url:APIURL+"/" + observation._id,
                                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                                    body:bodyParam
                                };
                                request.put(requestParams,function(error, response, body){
                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                    else{
                                        response.statusCode.should.be.equal(400);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf('Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices').should.be.greaterThanOrEqual(0);

                                    }
                                    done();
                                });
                            });
                        }
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [invalid observation(not mobile) due to invalid location as text]";
        it(testMessage, function (done) {


            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                testObservationDef.location="invalid";
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(422);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Location field must be set only for mobile devices.");
                    }
                    done();
                });
            });
        });
    });



    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation without location for mobile device]";
        it(testMessage, function (done) {


            deviceDriver.findById(testObservationDef.deviceId,function(error,deviceFound){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{
                    thingDriver.findByIdAndUpdate(deviceFound.thingId,{mobile:true},function(error,updatedThing){
                        if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                        else{
                            testObservationDef.location=undefined;
                            Observations.findOne({}, null, function(err, observation){
                                should(err).be.null();
                                var bodyParam=JSON.stringify({observation:testObservationDef});
                                var requestParams={
                                    url:APIURL+"/" + observation._id,
                                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                                    body:bodyParam
                                };
                                request.put(requestParams,function(error, response, body){
                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                    else{
                                        response.statusCode.should.be.equal(400);
                                        var results = JSON.parse(body);
                                        results.should.have.property('statusCode');
                                        results.should.have.property('error');
                                        results.should.have.property('message');
                                        results.message.indexOf('Location:{ coordinates: [lon, lat]} is a mandatory field for mobile devices').should.be.greaterThanOrEqual(0);

                                    }
                                    done();
                                });
                            });
                        }
                    });
                }
            });
        });
    });



    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [error due to undefined value field]";
        it(testMessage, function (done) {

            testObservationDef.value=undefined;
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
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
    });

    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation not valid due to Device Id is not valid]";
        it(testMessage, function (done) {

            testObservationDef.deviceId="fakeID";
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        response.statusCode.should.be.equal(400);
                        var results = JSON.parse(body);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.indexOf("fakeID is a not valid ObjectId").should.be.greaterThanOrEqual(0);
                    }
                    done();
                });
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation not valid due to unitId Id is not valid]";
        it(testMessage, function (done) {

            testObservationDef.unitId="fakeID";

            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        response.statusCode.should.be.equal(422);
                        var results = JSON.parse(body);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.indexOf("Not a valid unitId for this device type").should.be.greaterThanOrEqual(0);
                    }
                    done();
                });
            });

        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation not valid due to Device not exist]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{disabled:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{

                    testObservationDef.deviceId=deviceDriver.ObjectId();
                    Observations.findOne({}, null, function(err, observation){
                        should(err).be.null();
                        var bodyParam=JSON.stringify({observation:testObservationDef});
                        var requestParams={
                            url:APIURL+"/" + observation._id,
                            headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                            body:bodyParam
                        };
                        request.put(requestParams,function(error, response, body){
                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else{
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
                }
            });
        });
    });




    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation by Disabled Device]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{disabled:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{


                    Observations.findOne({}, null, function(err, observation){
                        should(err).be.null();
                        var bodyParam=JSON.stringify({observation:testObservationDef});
                        var requestParams={
                            url:APIURL+"/" + observation._id,
                            headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                            body:bodyParam
                        };
                        request.put(requestParams,function(error, response, body){
                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else{
                                var results = JSON.parse(body);
                                response.statusCode.should.be.equal(200);
                                results.should.have.property('_id');
                                results.should.have.property('value');
                                results.should.have.property('location');
                                results.should.have.property('unitId');
                                results.should.have.property('deviceId');
                                results.should.have.property('timestamp');
                                results.should.be.eql(testObservationDef);
                            }
                            done();
                        });
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation by dismissed Device]";
        it(testMessage, function (done) {

            deviceDriver.findByIdAndUpdate(testObservationDef.deviceId,{dismissed:true},function(error,dismissedDev){
                if (error) consoleLogError.printErrorLog(testMessageMessage+": '" + testMessage + "'  -->" + error.message);
                else{


                    Observations.findOne({}, null, function(err, observation){
                        should(err).be.null();
                        var bodyParam=JSON.stringify({observation:testObservationDef});
                        var requestParams={
                            url:APIURL+"/" + observation._id,
                            headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                            body:bodyParam
                        };
                        request.put(requestParams,function(error, response, body){
                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else{
                                var results = JSON.parse(body);
                                response.statusCode.should.be.equal(200);
                                results.should.have.property('_id');
                                results.should.have.property('value');
                                results.should.have.property('location');
                                results.should.have.property('unitId');
                                results.should.have.property('deviceId');
                                results.should.have.property('timestamp');
                                results.should.be.eql(testObservationDef);
                            }
                            done();
                        });
                    });
                }
            });
        });
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [observation not valid due to unit is not associated to Device Type]";
        it(testMessage, function (done) {


            testObservationDef.unitId=Unit.ObjectId();
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
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
    });


    describe(testMessageMessage, function () {
        var testMessage="must test update Observations [The observation value is out of range]";
        it(testMessage, function (done) {

            testObservationDef.value=unitCollection.maxValue+1;
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:testObservationDef});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
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
    });





});
