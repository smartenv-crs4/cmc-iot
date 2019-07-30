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

var Devices = require('../../../DBEngineHandler/drivers/deviceDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/devices" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var deviceDocuments=require('../../SetTestenv/createDevicesDocuments');

var webUiToken;

describe('Devices API Test - [DATA VALIDATION]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Devices.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        deviceDocuments.createDocuments(100,function(err){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Devices.create ---> " + err);
            done();
        });
    });


    afterEach(function (done) {
        Devices.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err);
            done();
        });
    });


    /******************************************************************************************************************
     ****************************************************** POST ******************************************************
     ***************************************************************************************************************** */

    describe('POST /device', function(){

        it('must test device creation [no valid device field - field is not in the schema]', function(done){
            var bodyParam=JSON.stringify({device:{noschemaField:"invalid"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation [no valid device field - field is not in the schema] -->" + error.message);
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



    describe('POST /device', function(){

        it('must test device creation [data validation error due to required fields missing]', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation [data validation error due to required fields missing] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("device validation failed: typeId: Path `typeId` is required., thingId: Path `thingId` is required.");
                }
                done();
            });

        });
    });

    describe('POST /device', function(){

        it('must test device creation [data validation error due to invalid field typeId]', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:Devices.ObjectId(), typeId:"typeId"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation [data validation error due to invalid field typeId] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("device validation failed: typeId: Cast to ObjectID failed for value \"typeId\" at path \"typeId\"");
                }
                done();
            });

        });
    });


    /******************************************************************************************************************
     ****************************************************** PUT ******************************************************
     ***************************************************************************************************************** */

    describe('PUT /device', function(){

        it('must test device update [no valid device field - field is not in the schema]', function(done){

            Devices.findOne({}, null, function(err, device){
                should(err).be.null();
                var bodyParam=JSON.stringify({device:{noschemaField:"invalid"}});
                var requestParams={
                    url:APIURL+"/" + device._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /device: 'must test device update [no valid device field - field is not in the schema] -->" + error.message);
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



    describe('PUT /device', function(){

        it('must test device update [data validation error due to invalid field typeId]', function(done){
            Devices.findOne({}, null, function(err, device){
                should(err).be.null();
                var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:Devices.ObjectId(), typeId:"typeId"}});
                var requestParams={
                    url:APIURL+"/" + device._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /device: 'must test device update [data validation error due to invalid field typeId] -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Cast to ObjectId failed for value \"typeId\" at path \"typeId\"");
                    }
                    done();
                });
            });
        });
    });


    describe('PUT /device', function(){

        it('must test device update [data validation error due to no modificable field dismissed]', function(done){
            Devices.findOne({}, null, function(err, device){
                should(err).be.null();
                var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:Devices.ObjectId(), dismissed:true}});
                var requestParams={
                    url:APIURL+"/" + device._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /device: 'must test device update [data validation error due to no modificable field dismissed] -->" + error.message);
                    else{
                        console.log(body);
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("The field 'dismissed' is in Schema but cannot be changed anymore");
                    }
                    done();
                });
            });
        });
    });




});
