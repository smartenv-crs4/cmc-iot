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
var Observations = require('../../../DBEngineHandler/drivers/observationDriver');
var Unit = require('../../../DBEngineHandler/drivers/unitDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/observations" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
// var Observation = require('../../../DBEngineHandler/models/observations').Observation;
var observationDocuments=require('../../SetTestenv/createObservationsDocuments');

var webUiToken;
var observationId;
var testObservationDef;


describe('Observations API Test - [CRUD OPTIONS TEST]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        this.timeout(0);
        Observations.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        observationDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - beforreEach - Observations.create ---> " + err);
            observationId=ForeignKeys.observationId;
            Unit.findById(ForeignKeys.unitId,function(err,unit){
                if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - beforeEach - Observations.create ---> " + err);
                //testUnit=unit;
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
            if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    var testMessageMessage='PUT /observations';
    var testMessage;


    describe(testMessageMessage, function(){
        testMessage='must test update observation resource enabled';
        it(testMessage, function(done){
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
                        results.should.have.properties('value','location','timestamp','deviceId','unitId');
                    }
                    done();
                });
            });
        });
    });

    describe(testMessageMessage, function(){
        testMessage='must test update observation resource disabled';
        it(testMessage, function(done){
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var bodyParam=JSON.stringify({observation:{timestamp:new Date()}});
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                    body:bodyParam
                };
                conf.cmcIoTOptions.observationsCanBeUpdated=false;
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("This resource is not accessible due to cmcIot Administrator disable it in microservice configuration.");
                    }
                    conf.cmcIoTOptions.observationsCanBeUpdated=true;
                    done();
                });
            });
        });
    });


    testMessageMessage='DELETE /observations';



    describe(testMessageMessage, function(){
        testMessage='must test delete observation resource enabled';

        testMessage='must test observation Delete';
        it(testMessage, function(done){


            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                };
                // DELETE Observation
                var geByIdRequestUrl=APIURL+"/" + observation._id + "?access_token="+ webUiToken;
                request.del(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var resultsDeleteById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsDeleteById.should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        Observations.ObjectId(resultsDeleteById._id).should.be.eql(observation._id);
                    }

                    //Search Observation to confirm delete
                    var geByIdRequestUrl=APIURL+"/" + observation._id + "?access_token="+ webUiToken;
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

    describe(testMessageMessage, function(){
        testMessage='must test update observation resource disabled';


        it(testMessage, function(done){
            Observations.findOne({}, null, function(err, observation){
                should(err).be.null();
                var requestParams={
                    url:APIURL+"/" + observation._id,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ webUiToken},
                };
                conf.cmcIoTOptions.observationsCanBeDeleted=false;
                request.del(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql("This resource is not accessible due to cmcIot Administrator disable it in microservice configuration.");

                    }

                    conf.cmcIoTOptions.observationsCanBeDeleted=true;
                    done();
                });
            });
        });
    });



});
