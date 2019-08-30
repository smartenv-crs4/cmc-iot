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
var Observation = require('../../../DBEngineHandler/drivers/observationDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/apiActions" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var apiActionDocuments=require('../../SetTestenv/createApiActionsDocuments');
var should=require('should');

var webUiToken;
var apiActionId;


describe('ApiActions API Test - [CRUD-TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        ApiActions.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("ApiAction CRUD-Tests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("ApiAction CRUD-Tests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {
        apiActionDocuments.createDocuments(100,function(err,newApiActionId){
            if (err) consoleLogError.printErrorLog("ApiAction CRUD-Tests.js - beforeEach - ApiActions.create ---> " + err);
            apiActionId=newApiActionId;
            done();
        });
    });


    afterEach(function (done) {
        ApiActions.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("ApiAction CRUD-Tests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */
    describe('POST /apiAction', function(){

        it('must test apiAction creation [create ApiAction]', function(done){
            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", deviceTypeId:ApiActions.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /apiAction: 'must test apiAction creation [create ApiAction] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('actionName','bodyPrototype','deviceTypeId','method','header');
                }
                done();
            });

        });
    });




    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /apiAction/:id', function(){

        it('must test get apiAction by Id', function(done){
            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", deviceTypeId:ApiActions.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete ApiAction
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /apiAction/:id :'must test get apiAction by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties('actionName','bodyPrototype','deviceTypeId','method','header');
                }

                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /apiAction/:id :'must test get apiAction by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.properties('actionName','bodyPrototype','deviceTypeId','method','header');
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

    describe('PUT /apiAction/:id', function(){

        it('must test update apiAction by Id', function(done){
            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", description: "description",thingId:ApiActions.ObjectId(), typeId:ApiActions.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete ApiAction
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("PUT /apiAction/:id :'must test update apiAction by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('actionName');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                }


                var actionNameUpdated="actionNameUpdated";
                bodyParam=JSON.stringify({apiAction:{actionName:actionNameUpdated}, access_token:webUiToken});
                requestParams={
                    url:APIURL+"/" + results._id,
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /apiAction/:id :'must test update apiAction by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('actionName');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('thingId');
                        resultsById.should.have.property('typeId');
                        resultsById._id.should.be.eql(results._id);
                        resultsById.actionName.should.be.eql(actionNameUpdated);
                    }
                    done();
                });
            });

        });
    });



    /******************************************************************************************************************
    ************************************************** DELETE TESTS **************************************************
    ***************************************************************************************************************** */



    describe('DELETE /apiAction', function(){

        it('must test apiAction Delete (without observation)', function(done){

            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", description: "description",thingId:ApiActions.ObjectId(), typeId:ApiActions.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create ApiAction
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /apiAction: 'must test apiAction Delete (without observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('actionName');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.dismissed.should.be.false();
                }

                // DELETE ApiAction
                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.del(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("DELETE /apiAction: 'must test apiAction Delete (without observation) -->" + error.message);
                    else{
                        var resultsDeleteById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsDeleteById.should.have.property('actionName');
                        resultsDeleteById.should.have.property('description');
                        resultsDeleteById.should.have.property('thingId');
                        resultsDeleteById.should.have.property('typeId');
                        resultsDeleteById._id.should.be.eql(results._id);
                        resultsDeleteById.dismissed.should.be.false();
                    }

                    //Search ApiAction to confirm delete
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.get(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /apiAction: 'must test apiAction Delete (without observation) -->" + error.message);
                        else{
                            response.statusCode.should.be.equal(204);
                        }
                        done();
                    });
                });


            });

        });
    });


    describe('DELETE /apiAction', function(){

        it('must test apiAction Delete (with observation)', function(done){

            var bodyParam=JSON.stringify({apiAction:{actionName:"actionName", description: "description",thingId:ApiActions.ObjectId(), typeId:ApiActions.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create ApiAction
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /apiAction: 'must test apiAction Delete (with observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('actionName');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.dismissed.should.be.false();
                }


                // create Observation
                Observation.create({timestamp: 0, value: 0, location: {type: "Point", coordinates: [1, 1]},apiActionId:results._id,unitId: Observation.ObjectId()},function(err,observation){

                    // DELETE ApiAction
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.del(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /apiAction: 'must test apiAction Delete (with observation) -->" + error.message);
                        else{
                            var resultsDeleteById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsDeleteById.should.have.property('actionName');
                            resultsDeleteById.should.have.property('description');
                            resultsDeleteById.should.have.property('thingId');
                            resultsDeleteById.should.have.property('typeId');
                            resultsDeleteById._id.should.be.eql(results._id);
                            resultsDeleteById.dismissed.should.be.true();
                        }

                        //Search ApiAction to confirm delete
                        var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                        request.get(geByIdRequestUrl,function(error, response, body){
                            if(error) consoleLogError.printErrorLog("DELETE /apiAction: 'must test apiAction Delete (with observation) -->" + error.message);
                            else{
                                var resultsFindById = JSON.parse(body);
                                response.statusCode.should.be.equal(200);
                                resultsFindById.should.have.property('actionName');
                                resultsFindById.should.have.property('description');
                                resultsFindById.should.have.property('thingId');
                                resultsFindById.should.have.property('typeId');
                                resultsFindById._id.should.be.eql(results._id);
                                resultsFindById.dismissed.should.be.true();
                            }
                            Observation.findByIdAndRemove(observation._id,null,function(err, removedObs){
                                should(err).be.null();
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

});
