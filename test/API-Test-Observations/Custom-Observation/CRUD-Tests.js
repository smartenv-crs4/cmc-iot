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
var Device=require('../../../DBEngineHandler/drivers/deviceDriver');
var Unit=require('../../../DBEngineHandler/drivers/unitDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/observations" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var observationDocuments=require('../../SetTestenv/createObservationsDocuments');
var should = require('should');

var webUiToken;
var observationId;
var testObservationDef;


describe('Observations API Test - [CRUD-TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        observationDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {
        observationDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - beforeEach - Observations.create ---> " + err);
            observationId=ForeignKeys.observationId;
            Unit.findById(ForeignKeys.unitId,function(err,unit){
                if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - beforeEach - Observations.create ---> " + err);
                testObservationDef= {
                    timestamp: new Date().getTime(),
                    value:unit.minValue+1,
                    deviceId: ForeignKeys.deviceId,
                    unitId: ForeignKeys.unitId
                };
                done();
            })

        });
    });


    afterEach(function (done) {
        observationDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ******************************************************************************************************************/
    var testTypeMessage='POST /observation';
    var testMessage;
    describe(testTypeMessage, function(){
        testMessage='must test observation creation [create Observation]';
        it(testMessage, function(done){
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                }
                done();
            });

        });
    });




    var testMessage;
    describe(testTypeMessage, function(){
        testMessage='must test observation creation [create Observation with value 0]';
        it(testMessage, function(done){
            testObservationDef.value=0;
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                    results.value.should.be.equal(0);
                }
                done();
            });

        });
    });

    describe(testTypeMessage, function(){
        testMessage='must test observation creation [validate default timestamp if not set]';
        it(testMessage, function(done){
            testObservationDef.timestamp=undefined;
            var starTtime=new Date().getTime();
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    var endTtime=new Date().getTime();
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                    results.timestamp.should.be.greaterThanOrEqual(starTtime);
                    results.timestamp.should.be.lessThanOrEqual(endTtime);

                }
                done();
            });

        });
    });


    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */
    testTypeMessage='GET /observation/:id';
    describe(testTypeMessage, function(){
        var testMessage="must test get observation by Id";
        it(testMessage, function(done){
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Observation
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                }

                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        resultsById.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                    }
                    done();
                });
            });

        });
    });


    /******************************************************************************************************************
     ********************************************* UPDATE TESTS (PUT))**********************************************
     ***************************************************************************************************************** */

    testTypeMessage='PUT /observation/:id';
    describe(testTypeMessage, function(){
        testMessage='must test update observation by Id';
        it(testMessage, function(done){
            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Observation
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                }


                var nameUpdated=testObservationDef.value+0.5;
                bodyParam=JSON.stringify({observation:{value:nameUpdated}, access_token:webUiToken});
                requestParams={
                    url:APIURL+"/" + results._id,
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        resultsById._id.should.be.eql(results._id);
                        resultsById.value.should.be.eql(nameUpdated);
                    }
                    done();
                });
            });

        });
    });


    /******************************************************************************************************************
    ************************************************** DELETE TESTS **************************************************
    ***************************************************************************************************************** */


    testTypeMessage='DELETE /observation';
    describe(testTypeMessage, function(){
        testMessage='must test observation Delete';
        it(testMessage, function(done){

            var bodyParam=JSON.stringify({observation:testObservationDef});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Observation
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                }

                // DELETE Observation
                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.del(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var resultsDeleteById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsDeleteById.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        resultsDeleteById._id.should.be.eql(results._id);
                    }

                    //Search Observation to confirm delete
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.get(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else{
                            response.statusCode.should.be.equal(204);
                        }
                        done();
                    });
                });


            });

        });
    });


});
