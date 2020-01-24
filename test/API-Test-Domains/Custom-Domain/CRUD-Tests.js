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
var deviceType_domain = require('../../../DBEngineHandler/drivers/deviceType_domainDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/domains" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var domainDocuments=require('../../SetTestenv/createDomainsDocuments');
var should=require('should');

var webUiToken;
var domainId;


describe('Domains API Test - [CRUD-TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        domainDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("Domain CRUD-Tests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Domain CRUD-Tests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {
        domainDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("Domain CRUD-Tests.js - beforeEach - Domains.create ---> " + err);
            domainId=ForeignKeys.domainId;
            done();
        });
    });


    afterEach(function (done) {
        domainDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Domain CRUD-Tests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */
    describe('POST /domain', function(){

        it('must test domain creation [create Domain]', function(done){
            var bodyParam=JSON.stringify({domain:{name:"name", description:"description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /domain: 'must test domain creation [create Domain] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('name','description');
                }
                done();
            });

        });
    });




    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /domain/:id', function(){

        it('must test get domain by Id', function(done){
            var bodyParam=JSON.stringify({domain:{name:"name", description:"description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Domain
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /domain/:id :'must test get domain by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('name','description');
                }

                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /domain/:id :'must test get domain by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.properties('name','description');
                        resultsById._id.should.be.eql(results._id);
                    }
                    done();
                });
            });

        });
    });


    /******************************************************************************************************************
     ********************************************* UPDATE TESTS (PUT))**********************************************
     ***************************************************************************************************************** */

    describe('PUT /domain/:id', function(){

        it('must test update domain by Id', function(done){
            var bodyParam=JSON.stringify({domain:{name:"name", description:"description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Domain
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("PUT /domain/:id :'must test update domain by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('name','description');
                }


                var nameUpdated="nameUpdated";
                bodyParam=JSON.stringify({domain:{name:nameUpdated}, access_token:webUiToken});
                requestParams={
                    url:APIURL+"/" + results._id,
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /domain/:id :'must test update domain by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.properties('name','description');
                        resultsById._id.should.be.eql(results._id);
                        resultsById.name.should.be.eql(nameUpdated);
                    }
                    done();
                });
            });

        });
    });



    /******************************************************************************************************************
    ************************************************** DELETE TESTS **************************************************
    ***************************************************************************************************************** */



    describe('DELETE /domain', function(){

        it('must test domain Delete', function(done){

            var bodyParam=JSON.stringify({domain:{name:"name", description:"description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Domain
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('name','description');
                }

                // DELETE Domain
                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.del(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete -->" + error.message);
                    else{
                        var resultsDeleteById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsDeleteById.should.have.properties('name','description');
                        resultsDeleteById._id.should.be.eql(results._id);
                    }

                    //Search Domain to confirm delete
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.get(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete -->" + error.message);
                        else{
                            response.statusCode.should.be.equal(204);
                        }
                        done();
                    });
                });
            });

        });
    });


    describe('DELETE /domain', function(){

        it('must test domain Delete Conflict due to associated deviceType(s)', function(done){

            var bodyParam=JSON.stringify({domain:{name:"name", description:"description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Domain
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete Conflict due to associated deviceType(s) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('name','description');
                }

                deviceType_domain.create({deviceTypeId:deviceType_domain.ObjectId(),domainId:results._id},function (error,deviceTypeDomainItem) {
                    if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete Conflict due to associated deviceType(s) -->" + error.message);
                    else{
                        // DELETE Domain
                        var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                        request.del(geByIdRequestUrl,function(error, response, body){
                            if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete Conflict due to associated deviceType(s) -->" + error.message);
                            else{
                                var resultsDeleteById = JSON.parse(body);
                                response.statusCode.should.be.equal(409);
                                resultsDeleteById.should.have.properties('error','statusCode','message');
                                resultsDeleteById.message.should.be.eql("Cannot delete the domain due to associated deviceType(s)")
                            }

                            //Search Domain to confirm not deletion
                            var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                            request.get(geByIdRequestUrl,function(error, response, body){
                                if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete Conflict due to associated deviceType(s) -->" + error.message);
                                else{
                                    response.statusCode.should.be.equal(200);
                                    results.should.have.properties('name','description');
                                    deviceType_domain.deleteMany({domainId:results._id},function(error){
                                        if(error) consoleLogError.printErrorLog("DELETE /domain: 'must test domain Delete Conflict due to associated deviceType(s) -->" + error.message);
                                        done();
                                    })
                                }

                            });
                        });
                    }
                });
            });

        });
    });

});
