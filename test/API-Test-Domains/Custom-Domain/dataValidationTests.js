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

var Domains = require('../../../DBEngineHandler/drivers/domainDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/domains" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var domainDocuments=require('../../SetTestenv/createDomainsDocuments');
var should=require('should');

var webUiToken;

describe('Domains API Test - [DATA VALIDATION]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - before - Domains API Test - [DATA VALIDATION] ---> " + err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        domainDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        domainDocuments.createDocuments(100,function(err){
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Domains.create ---> " + err);
            done();
        });
    });


    afterEach(function (done) {
        domainDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err);
            done();
        });
    });


    /******************************************************************************************************************
     ****************************************************** POST ******************************************************
     ***************************************************************************************************************** */

    describe('POST /domain', function(){

        it('must test domain creation [no valid domain field - field is not in the schema]', function(done){
            var bodyParam=JSON.stringify({domain:{noschemaField:"invalid"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /domain: 'must test domain creation [no valid domain field - field is not in the schema] -->" + error.message);
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



    describe('POST /domain', function(){

        it('must test domain creation [data validation error due to required fields missing]', function(done){
            var bodyParam=JSON.stringify({domain:{description: "POST"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /domain: 'must test domain creation [data validation error due to required fields missing] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("domain validation failed: name: Path `name` is required.");
                }
                done();
            });

        });
    });



    /******************************************************************************************************************
     ****************************************************** PUT ******************************************************
     ***************************************************************************************************************** */

    describe('PUT /domain', function(){

        it('must test domain update [no valid domain field - field is not in the schema]', function(done){

            Domains.findOne({}, null, function(err, domain){
                should(err).be.null();
                var bodyParam=JSON.stringify({domain:{noschemaField:"invalid"}});
                var requestParams={
                    url:APIURL+"/" + domain._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /domain: 'must test domain update [no valid domain field - field is not in the schema] -->" + error.message);
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


});
