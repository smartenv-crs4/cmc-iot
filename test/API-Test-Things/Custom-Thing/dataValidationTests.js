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

var Things = require('../../../DBEngineHandler/drivers/thingDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/things" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var thingDocuments=require('../../SetTestenv/createThingsDocuments');

var webUiToken;

describe('Things API Test - [DATA VALIDATION]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Things.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        thingDocuments.createDocuments(100,function(err){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Things.create ---> " + err);
            done();
        });
    });


    afterEach(function (done) {
        Things.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err);
            done();
        });
    });


    /******************************************************************************************************************
     ****************************************************** POST ******************************************************
     ***************************************************************************************************************** */

    describe('POST /thing', function(){

        it('must test thing creation [no valid thing field - field is not in the schema]', function(done){
            var bodyParam=JSON.stringify({thing:{noschemaField:"invalid"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /thing: 'must test thing creation [no valid thing field - field is not in the schema] -->" + error.message);
                else{
                    console.log(body);
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



    describe('POST /thing', function(){
        it('must test thing creation [data validation error due to required fields missing]', function(done){
            var bodyParam=JSON.stringify({thing:{name:"name", description: "description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /thing: 'must test thing creation [data validation error due to required fields missing] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("thing validation failed: siteId: Path `siteId` is required., vendorId: Path `vendorId` is required., ownerId: Path `ownerId` is required.");
                }
               done();
            });

        });
    });

    describe('POST /thing', function(){

        it('must test thing creation [data validation error due to invalid field siteId]', function(done){
            var bodyParam=JSON.stringify({thing:{name:"name", description: "description", ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:"siteId"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /thing: 'must test thing creation [data validation error due to invalid field siteId] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("thing validation failed: siteId: Cast to ObjectID failed for value \"siteId\" at path \"siteId\"");
                }
                done();
            });

        });
    });



    describe('POST /thing', function(){

        it('must test thing creation [data validation error due to invalid url in field api.url]', function(done){
            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /thing: 'must test thing creation [data validation error due to invalid url in field api.url] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("thing validation failed 'api.url'. 127.0.0.1 is not a valid url (eg: http://......)");
                }
                done();
            });

        });
    });


    /******************************************************************************************************************
     ****************************************************** PUT ******************************************************
     ***************************************************************************************************************** */

    describe('PUT /thing', function(){

        it('must test thing update [no valid thing field - field is not in the schema]', function(done){

            Things.findOne({}, null, function(err, thing){
                should(err).be.null();
                var bodyParam=JSON.stringify({thing:{noschemaField:"invalid"}});
                var requestParams={
                    url:APIURL+"/" + thing._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /thing: 'must test thing update [no valid thing field - field is not in the schema] -->" + error.message);
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



    describe('PUT /thing', function(){

        it('must test thing update [data validation error due to invalid field siteId]', function(done){
            Things.findOne({}, null, function(err, thing){
                should(err).be.null();
                var bodyParam=JSON.stringify({thing:{name:"name", description: "description",ownerId:Things.ObjectId(), siteId:"siteId"}});
                var requestParams={
                    url:APIURL+"/" + thing._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /thing: 'must test thing update [data validation error due to invalid field siteId] -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("Cast to ObjectId failed for value \"siteId\" at path \"siteId\"");
                    }
                    done();
                });
            });
        });
    });


    describe('PUT /thing', function(){

        it('must test thing update [data validation error due to no Thingmodifiable field dismissed]', function(done){
            Things.findOne({}, null, function(err, thing){
                should(err).be.null();
                var bodyParam=JSON.stringify({thing:{name:"name", description: "description",ownerId:Things.ObjectId(), dismissed:true}});
                var requestParams={
                    url:APIURL+"/" + thing._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /thing: 'must test thing update [data validation error due to no modifiable field dismissed] -->" + error.message);
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
