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

var ApiActions = require('../../../DBEngineHandler/drivers/apiActionDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/apiActions" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var apiActionDocuments=require('../../SetTestenv/createApiActionsDocuments');
var should=require('should');

var webUiToken;

describe('ApiActions API Test - [DATA VALIDATION]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - before - ApiActions API Test - [DATA VALIDATION] ---> " + err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        apiActionDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        apiActionDocuments.createDocuments(100,function(err){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - ApiActions.create ---> " + err);
            done();
        });
    });


    afterEach(function (done) {
        apiActionDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err);
            done();
        });
    });


    /******************************************************************************************************************
     ****************************************************** POST ******************************************************
     ***************************************************************************************************************** */

    describe('POST /apiAction', function(){

        it('must test apiAction creation [no valid apiAction field - field is not in the schema]', function(done){
            var bodyParam=JSON.stringify({apiAction:{noschemaField:"invalid"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /apiAction: 'must test apiAction creation [no valid apiAction field - field is not in the schema] -->" + error.message);
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



    describe('POST /apiAction', function(){

        it('must test apiAction creation [data validation error due to required fields missing]', function(done){
            var bodyParam=JSON.stringify({apiAction:{method: "POST"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /apiAction: 'must test apiAction creation [data validation error due to required fields missing] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("apiAction validation failed: deviceTypeId: Path `deviceTypeId` is required., actionName: Path `actionName` is required.");
                }
                done();
            });

        });
    });

    describe('POST /apiAction', function(){

        it('must test apiAction creation [data validation error due to invalid field deviceTypeId]', function(done){
            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", deviceTypeId:"typeId"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /apiAction: 'must test apiAction creation [data validation error due to invalid field deviceTypeId] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("apiAction validation failed: deviceTypeId: Cast to ObjectId failed for value \"typeId\" at path \"deviceTypeId\"");
                }
                done();
            });

        });
    });



    describe('POST /apiAction', function(){

        it('must test apiAction creation [data validation error due to invalid value for method field]', function(done){
            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", deviceTypeId:ApiActions.ObjectId(), method:"casual"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /apiAction: 'must test apiAction creation [data validation error due to invalid field deviceTypeId] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("apiAction validation failed: method: `casual` is not a valid enum value for path `method`.");
                }
                done();
            });

        });
    });



    /******************************************************************************************************************
     ****************************************************** PUT ******************************************************
     ***************************************************************************************************************** */

    describe('PUT /apiAction', function(){

        it('must test apiAction update [no valid apiAction field - field is not in the schema]', function(done){

            ApiActions.findOne({}, null, function(err, apiAction){
                should(err).be.null();
                var bodyParam=JSON.stringify({apiAction:{noschemaField:"invalid"}});
                var requestParams={
                    url:APIURL+"/" + apiAction._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /apiAction: 'must test apiAction update [no valid apiAction field - field is not in the schema] -->" + error.message);
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



    describe('PUT /apiAction', function(){

        it('must test apiAction update [data validation error due to invalid field typeId]', function(done){
            ApiActions.findOne({}, null, function(err, apiAction){
                should(err).be.null();
                var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", deviceTypeId:"typeId"}});
                var requestParams={
                    url:APIURL+"/" + apiAction._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /apiAction: 'must test apiAction update [data validation error due to invalid field typeId] -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Cast to ObjectId failed for value \"typeId\" at path \"deviceTypeId\"");
                    }
                    done();
                });
            });
        });
    });


    describe('PUT /apiAction', function(){

        it('must test apiAction update [method have a not vaid value]', function(done){
            ApiActions.findOne({}, null, function(err, apiAction){
                should(err).be.null();
                var bodyParam=JSON.stringify({apiAction:{method:"casual"}});
                var requestParams={
                    url:APIURL+"/" + apiAction._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /apiAction: 'must test apiAction update [data validation error due to no Thingmodifiable field dismissed] -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Validation failed: method: `casual` is not a valid enum value for path `method`.");
                    }
                    done();
                });
            });
        });
    });




});
