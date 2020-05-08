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
var observationUtility = require('../../../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var redisHandler=require('../../../../routes/routesHandlers/handlerUtility/redisHandler');
var _=require('underscore');
var observationDocuments = require('../../../SetTestenv/createObservationsDocuments');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/devices";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var async = require('async');
var geoLatLon=require('../../../../routes/routesHandlers/handlerUtility/geoLatLon');
var webUiToken;
var testTypeMessage="POST /devices/:id/actions/sendObservations";
var testMessage;
var observationId,deviceId,unitId;
var searchFilter;
var From,To,Middle;
var pagination={skip:0,limit:conf.pagination.limit};



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
        observationUtility.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {
        From=new Date().getTime();
        observationDocuments.createDocuments(40, function (err, ForeignKeys) {
            if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - beforreEach - Observations.create ---> " + err);
            setTimeout(function(){ // to create other 50 with a different timestamo
                Middle=new Date().getTime();
                observationDocuments.createDocuments(60, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - beforreEach - Observations.create ---> " + err);
                    observationId = ForeignKeys.observationId;
                    deviceId=ForeignKeys.deviceId;
                    unitId=ForeignKeys.unitId;
                    searchFilter={
                        timestamp:{
                            from:new Date().getTime(),
                            to:new Date().getTime(),
                        },
                        value:{
                            min:0,
                            max:1
                        },
                        location:{
                            centre:{
                                coordinates:[0,0]
                            },
                            distance:1,
                            distanceOptions:{
                                mode:"BBOX",
                                returnDistance:false
                            }
                        }
                    };
                    To=new Date().getTime();
                    done();
                });
            },200);

        });
    });


    afterEach(function (done) {
        observationDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation APIActionsTests.js - afterEach - deleteMany ---> " + err);
            observationUtility.find({},function(err,data){
                data.length.should.be.equal(0);
                done()
            });

        });
    });



    testTypeMessage="POST /devices/:id/actions/getObservations";

    describe(testTypeMessage, function () {
        testMessage="must test access_token authentication";
        it(testMessage, function (done) {

            //body: JSON.stringify({observations:observations})
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Unauthorized: Access token required, you are not allowed to use the resource");
                    done();
                }
            });

        });
    });

    describe(testTypeMessage, function () {
        testMessage="must test API action getObservations  [no body - from Redis]";
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
            }, function (error, response, body) {
                if (error) consoleLogError.printErrorLog(testTypeMessage+": '" + testMessage + "'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    results._metadata.source.should.be.equal("Redis cache");
                    done();
                }
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations searchFilters body field missing [get from Redis]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({skip: 0})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    results._metadata.source.should.be.equal("Redis cache");
                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations searchFilters body field void [get from Redis]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    results._metadata.source.should.be.equal("Redis cache");
                }
                done();
            });
        });

    });



    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations from Redis [Results ordered by tiestamp]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    results._metadata.source.should.be.equal("Redis cache");
                    for(var obsIndex=1; obsIndex<results.observations.length;++obsIndex){
                        results.observations[obsIndex].timestamp.should.be.lessThan(results.observations[obsIndex-1].timestamp);
                    }
                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations from Redis [Results ordered by timestamp and pagination]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    results._metadata.source.should.be.equal("Redis cache");
                    for(var obsIndex=1; obsIndex<results.observations.length;++obsIndex){
                        results.observations[obsIndex].timestamp.should.be.lessThan(results.observations[obsIndex-1].timestamp);
                    }
                }

                observationUtility.create({value:11,deviceId:deviceId,unitId:unitId,location:results.observations[0].location},function(error,newObs){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        request.post({
                            url: APIURL +'/' + deviceId +'/actions/getObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({pagination:{skip:0,limit:1},searchFilters: {}})
                        }, function (error, response, body) {

                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('observations');
                                results.observations.length.should.be.equal(1);
                                results._metadata.source.should.be.equal("Redis cache");
                                results.observations[0].value.should.be.equal(newObs.value);
                                results.observations[0].deviceId.should.be.equal(newObs.deviceId.toString());
                                results.observations[0].unitId.should.be.equal(newObs.unitId.toString());
                                results.observations[0].timestamp.should.be.equal(newObs.timestamp);
                                results.observations[0]._id.should.be.equal(newObs._id.toString());
                            }
                            done();
                        });
                    }
                });
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations from database [Results ordered by timestamp and pagination]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {unitId:unitId}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results._metadata.source.should.be.equal("Database");
                    for(var obsIndex=1; obsIndex<results.observations.length;++obsIndex){
                        results.observations[obsIndex].timestamp.should.be.lessThan(results.observations[obsIndex-1].timestamp);
                    }
                }

                observationUtility.create({value:11,deviceId:deviceId,unitId:unitId,location:results.observations[0].location},function(error,newObs){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        request.post({
                            url: APIURL +'/' + deviceId +'/actions/getObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({pagination:{skip:0,limit:1},searchFilters: {unitId:unitId}})
                        }, function (error, response, body) {

                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('observations');
                                results.observations.length.should.be.equal(1);
                                results._metadata.source.should.be.equal("Database");
                                results.observations[0].value.should.be.equal(newObs.value);
                                results.observations[0].deviceId.should.be.equal(newObs.deviceId.toString());
                                results.observations[0].unitId.should.be.equal(newObs.unitId.toString());
                                results.observations[0].timestamp.should.be.equal(newObs.timestamp);
                                results.observations[0]._id.should.be.equal(newObs._id.toString());
                            }
                            done();
                        });
                    }
                });
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations from Redis and database [Results ordered by timestamp and pagination]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    results._metadata.source.should.be.equal("Redis cache");
                    for(var obsIndex=1; obsIndex<results.observations.length;++obsIndex){
                        results.observations[obsIndex].timestamp.should.be.lessThan(results.observations[obsIndex-1].timestamp);
                    }
                }

                observationUtility.create({value:11,deviceId:deviceId,unitId:unitId,location:results.observations[0].location},function(error,newObs){
                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                    else{
                        request.post({
                            url: APIURL +'/' + deviceId +'/actions/getObservations',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({pagination:{skip:0,limit:1},searchFilters: {}})
                        }, function (error, response, body) {

                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('observations');
                                results.observations.length.should.be.equal(1);
                                results._metadata.source.should.be.equal("Redis cache");
                                results.observations[0].value.should.be.equal(newObs.value);
                                results.observations[0].deviceId.should.be.equal(newObs.deviceId.toString());
                                results.observations[0].unitId.should.be.equal(newObs.unitId.toString());
                                results.observations[0].timestamp.should.be.equal(newObs.timestamp);
                                results.observations[0]._id.should.be.equal(newObs._id.toString());
                            }

                            observationUtility.findByIdAndUpdate(newObs._id,{value:12},function(error,updatedObs){
                                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                else{
                                    // wait redis to sync
                                    setTimeout(function(){
                                        redisHandler.getObservationsFromCache(deviceId,{returnAsObject:true},function (error,redisObs) {
                                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                            else{
                                                redisObs.length.should.be.equal(0);
                                                request.post({
                                                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                                    body: JSON.stringify({pagination:{skip:0,limit:1},searchFilters: {}})
                                                }, function (error, response, body) {
                                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                                    else {
                                                        var results = JSON.parse(body);
                                                        results.should.have.property('observations');
                                                        results.observations.length.should.be.equal(1);
                                                        results._metadata.source.should.be.equal("Redis Cache - Database");
                                                        results.observations[0].value.should.be.equal(updatedObs.value);
                                                        results.observations[0].deviceId.should.be.equal(newObs.deviceId.toString());
                                                        results.observations[0].unitId.should.be.equal(newObs.unitId.toString());
                                                        results.observations[0].timestamp.should.be.equal(newObs.timestamp);
                                                        results.observations[0]._id.should.be.equal(newObs._id.toString());
                                                    }
                                                    redisHandler.getObservationsFromCache(deviceId,{returnAsObject:true},function (error,redisObs) {
                                                        if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                                        else{
                                                            redisObs.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                            redisObs[0].value.should.be.equal(updatedObs.value);
                                                            redisObs[0].deviceId.should.be.equal(newObs.deviceId.toString());
                                                            redisObs[0].unitId.should.be.equal(newObs.unitId.toString());
                                                            redisObs[0].timestamp.should.be.equal(newObs.timestamp);
                                                            redisObs[0]._id.should.be.equal(newObs._id.toString());
                                                            done();
                                                        }
                                                    })
                                                });
                                            }
                                        })
                                    },10);
                                }
                            });
                        });
                    }
                });
            });
        });
    });



    describe(testTypeMessage, function () {
        this.timeout(0);
        testMessage='must test API action getObservations from Redis [test branch where redis cache is void and should be populated]';
        it(testMessage, function (done) {

            redisHandler.getObservationsFromCache(deviceId,function (error,redisObs) {
                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                else{
                    redisObs.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);

                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/getObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({searchFilters: {}})
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('observations');
                            results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                            results._metadata.source.should.be.equal("Redis cache");
                            for(var obsIndex=1; obsIndex<results.observations.length;++obsIndex){
                                results.observations[obsIndex].timestamp.should.be.lessThanOrEqual(results.observations[obsIndex-1].timestamp);
                            }
                        }

                        observationUtility.findByIdAndUpdate(results.observations[0]._id,{value:11},function(error,updatedObs){
                            if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                            else{
                                // wait redis to sync
                                setTimeout(function(){
                                    redisHandler.getObservationsFromCache(deviceId,{returnAsObject:true},function (error,redisObs) {
                                        if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                        else{
                                            redisObs.length.should.be.equal(0);
                                            request.post({
                                                url: APIURL +'/' + deviceId +'/actions/getObservations',
                                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                                body: JSON.stringify({searchFilters: {}})
                                            }, function (error, response, body) {

                                                if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                                else {
                                                    response.statusCode.should.be.equal(200);
                                                    var results = JSON.parse(body);
                                                    results.should.have.property('observations');
                                                    results.observations.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                    results._metadata.source.should.be.equal("Redis Cache - Database");
                                                    for(var obsIndex=1; obsIndex<results.observations;++obsIndex){
                                                        results.observations[obsIndex].timestamp.should.be.lessThan(results.observations[obsIndex-1].timestamp);
                                                    }
                                                }
                                                redisHandler.getObservationsFromCache(deviceId,{returnAsObject:true},function (error,redisObs) {
                                                    if(error) consoleLogError.printErrorLog(testMessageMessage +": " + testMessage +" -->" + error.message);
                                                    else{
                                                        redisObs.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                        done();
                                                    }
                                                })
                                            });
                                        }
                                    })
                                },10);

                            }
                        });

                    });
                }
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to timestamp filter field is not valid';
        it(testMessage, function (done) {
            searchFilter.timestamp="notValid";
            var bodyParam=JSON.stringify({searchFilters:searchFilter});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal('timestamp filter must be {from:\'startDate\' , to:\'stopDate\'}. if timestamp is set, the fields \'from\' and \'to\' cannot be both null');
                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to timestamp={} filter field is not valid';
        it(testMessage, function (done) {
            searchFilter.timestamp={};
            var bodyParam=JSON.stringify({searchFilters:searchFilter});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('timestamp filter must be {from:\'startDate\' , to:\'stopDate\'}. if timestamp is set, the fields \'from\' and \'to\' cannot be both null');
                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search by timestamp={from} filter';
        it(testMessage, function (done) {

            var bodyParam=JSON.stringify({pagination:pagination, searchFilters:{timestamp:{from:From}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('skip');
                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                    results._metadata.should.have.property('limit');
                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(60);
                    results._metadata.source.should.be.equal("Database");
                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search by timestamp={to} filter';
        it(testMessage, function (done) {

            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:{timestamp:{to:To}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('skip');
                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                    results._metadata.should.have.property('limit');
                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(60);
                    results._metadata.source.should.be.equal("Database");
                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search by timestamp={from:"" to:""} filter';
        it(testMessage, function (done) {

            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:{timestamp:{from:Middle, to:To}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.lessThanOrEqual(conf.pagination.limit);
                    results.observations.length.should.be.greaterThan(0);
                    results._metadata.should.have.property('skip');
                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                    results._metadata.should.have.property('limit');
                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('totalCount');
                    results.observations.length.should.be.lessThanOrEqual(60);
                    results.observations.length.should.be.greaterThan(0);
                    results._metadata.source.should.be.equal("Database");
                }
                done();
            });
        });
    });





    describe(testTypeMessage, function () {
        testMessage='must test API action getObservations error due to value filter field is not valid';
        it(testMessage, function (done) {
            searchFilter.value="notValid";
            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:searchFilter});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("value filter must be {min:'minValue' , max:'maxValue'}. if value is set, the fields 'min' and 'max' cannot be both null");
                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to value={} filter field is not valid';
        it(testMessage, function (done) {
            searchFilter.value={};
            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:searchFilter});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("value filter must be {min:'minValue' , max:'maxValue'}. if value is set, the fields 'min' and 'max' cannot be both null");
                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search by value={min} filter';
        it(testMessage, function (done) {

            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:{value:{min:0}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results.observations[0].should.have.properties("_id","value","timestamp")
                    results.should.have.property('_metadata');
                    results._metadata.should.have.property('skip');
                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                    results._metadata.should.have.property('limit');
                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('totalCount');
                    results.observations.length.should.be.lessThanOrEqual(60);
                    results.observations.length.should.be.greaterThan(0);
                    results._metadata.totalCount.should.be.lessThanOrEqual(60);
                    results._metadata.totalCount.should.be.greaterThan(0);
                    results._metadata.source.should.be.equal("Database");
                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search by value={max} filter';
        it(testMessage, function (done) {

            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:{value:{max:99}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results.observations[0].should.have.properties("_id","value","timestamp")
                    results.should.have.property('_metadata');
                    results._metadata.should.have.property('skip');
                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                    results._metadata.should.have.property('limit');
                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('totalCount');
                    results.observations.length.should.be.lessThanOrEqual(60);
                    results.observations.length.should.be.greaterThan(0);
                    results._metadata.totalCount.should.be.lessThanOrEqual(60);
                    results._metadata.totalCount.should.be.greaterThan(0);
                    results._metadata.source.should.be.equal("Database");
                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search by value={min:"" max:""} filter';
        it(testMessage, function (done) {

            var bodyParam=JSON.stringify({pagination:pagination,searchFilters:{value:{min:0, max:24}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('observations');
                    results.observations.length.should.be.equal(25);
                    results.should.have.property('_metadata');
                    results._metadata.should.have.property('skip');
                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                    results._metadata.should.have.property('limit');
                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.lessThanOrEqual(25);
                    results._metadata.totalCount.should.be.greaterThan(0);
                    results._metadata.source.should.be.equal("Database");
                }
                done();
            });
        });
    });




    // location: {centre:{coordinates:[]}, distance: ,  distanceOptions: }

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location field is not a valid location';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:""}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location as obj field is not a valid location';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.centre field as text is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:""}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.centre field as void obj is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location format. Location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.centre.coordinates field as text is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: ""}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location format. Location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.centre.coordinates field as void coordinates is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: []}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location format. Location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.centre.coordinates field is out of range';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [360,360]}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location coordinates: longitude must be in range [-180,180]. Location field must be: {centre:{coordinates:[lon,lat]}, distance:\'number\' ,  distanceOptions:{mode:\'bbox|Radius\', returnDistance:\'true|false\'}}');

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distance not set';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Invalid distance format. Must be a number. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distance field as text is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:""}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Invalid distance format. Must be a number. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distance field as text is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"notValid"}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("Invalid distance format. Must be a number. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distanceOptions field as text is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"1",distanceOptions:""}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distanceOptions field as obj is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"1",distanceOptions:{}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distanceOptions field as boolean is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"1",distanceOptions:true}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distanceOptions.mode field as text is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"1",distanceOptions:{mode:""}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to location.distanceOptions.mode field as text(not valid) is not valid';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"1",distanceOptions:{mode:"bb"}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS. Location field must be: {centre:{coordinates:[lon,lat]}, distance:'number' ,  distanceOptions:{mode:'bbox|Radius', returnDistance:'true|false'}}");

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search test no error if returnDistance option is not set';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({searchFilters:{location:{centre:{coordinates: [0,0]},distance:"1",distanceOptions:{mode:"bbox"}}}});
            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                }
                done();
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action search error due to sql injection';
        it(testMessage, function (done) {

            request.post({
                url: APIURL +'/' + deviceId +'/actions/getObservations',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({
                    searchFilters:{
                        location:{
                            centre:[{ "$in": observationId }]
                        }
                    }
                })
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('mongoDb operator "$..." are not allowed in query filter');

                }
                done();
            });
        });
    });


    function localizeObservations(centrePoint,numberForBB,bBNumber,distance,deltaDistance,returnCallback){

        var start=new geoLatLon(centrePoint[0],centrePoint[1]);
        observationUtility.find({},function(err,results){
            if(err) consoleLogError.printErrorLog(testTypeMessage +": localizeObservations -->" + err.message);
            var currentLoc=[];
            var tmpLatLon;
            var distMin,distMax
            for (var bbox=0;bbox<bBNumber;++bbox){
                distMin=(distance*bbox)+deltaDistance;
                distMax=(distance*(bbox+1));
                for (var observation=0;observation<numberForBB;++observation){
                    tmpLatLon=start.destinationPoint(Math.floor(Math.random()*(distMax-distMin))+distMin,Math.floor(Math.random()*361));
                    currentLoc.push([tmpLatLon.lon,tmpLatLon.lat]);
                }
            }

            async.eachOf(currentLoc, function(location,index, callback) {

                observationUtility.findByIdAndUpdate(results[index]._id,{location:{coordinates:location}},function(err,res){
                    callback(err);
                });

            }, function(err) {
                if(err) consoleLogError.printErrorLog(testTypeMessage +": localizeObservations -->" + err.message);
                returnCallback(null,currentLoc);
            });
        });
    }


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get one or more observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 300,
                                distanceOptions: {
                                    mode: "bbox"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.greaterThanOrEqual(1);
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(1);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get two or more observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 600,
                                distanceOptions: {
                                    mode: "bbox"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.greaterThanOrEqual(2);
                        results.observations.length.should.be.greaterThanOrEqual(1);
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(2);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 5 or more observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 1500,
                                distanceOptions: {
                                    mode: "bbox"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.greaterThanOrEqual(5);
                        results.observations.length.should.be.greaterThanOrEqual(1);
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(5);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 9 or more observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 2700,
                                distanceOptions: {
                                    mode: "bbox"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.greaterThanOrEqual(9);
                        results.observations.length.should.be.greaterThanOrEqual(1);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(9);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });

    // Accurate results with mode  option set to radius


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get one observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 300,
                                distanceOptions: {
                                    mode: "radius"
                                }
                            }
                        }
                    }),
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.equal(1);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.equal(1);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get two observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 600,
                                distanceOptions: {
                                    mode: "radius"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.equal(2);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.equal(2);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 5 observation]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: "1500",
                                distanceOptions: {
                                    mode: "radius"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.observations.length.should.be.equal(5);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.equal(5);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 9 observation]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: 2700,
                                distanceOptions: {
                                    mode: "radius"
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.should.not.have.property("distances");
                        results.observations.length.should.be.equal(9);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.equal(9);
                        results._metadata.source.should.be.equal("Database");
                        for(res in results.observations){
                            results.observations[res].should.not.have.property("observationId");
                            results.observations[res].should.not.have.property("distance");
                        }
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 9 or more observation and distance]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            var test_distance=2700;
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: test_distance,
                                distanceOptions: {
                                    mode: "radius",
                                    returnDistance:true
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.should.have.property("distances");
                        results.observations.length.should.be.greaterThanOrEqual(9);
                        results.distances.length.should.be.greaterThanOrEqual(9);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(9);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action search pagination[10 observations saved, get 5 or more observation and correct distance]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            var test_distance=2700;
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:{
                            skip:0,
                            limit:5
                        },
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: test_distance,
                                distanceOptions: {
                                    mode: "radius",
                                    returnDistance:true
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.should.have.property("distances");
                        results.observations.length.should.be.equal(5);
                        results.observations.length.should.be.equal(5);
                        results.observations.length.should.be.equal(5);
                        results.observations.length.should.be.equal(5);
                        results.distances.length.should.be.equal(5);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(0);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(5);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(9);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 9 or more observation and distance]';
        it(testMessage, function (done) {

            var observation=[38.990519,8.936253];
            var test_distance=2700;
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: test_distance,
                                distanceOptions: {
                                    mode: "bbox",
                                    returnDistance:true
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.should.have.property("distances");
                        results.observations.length.should.be.greaterThanOrEqual(9);
                        results.distances.length.should.be.greaterThanOrEqual(9);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.greaterThanOrEqual(9);
                        results._metadata.source.should.be.equal("Database");
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations saved, get 9 observation and distance]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            localizeObservations(observation,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL +'/' + deviceId +'/actions/getObservations',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({
                        pagination:pagination,
                        searchFilters: {
                            location: {
                                centre: {
                                    coordinates: observation
                                },
                                distance: test_distance,
                                distanceOptions: {
                                    mode: "radius",
                                    returnDistance:true
                                }
                            }
                        }
                    })
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("observations");
                        results.should.have.property("distances");
                        results.observations.length.should.be.equal(9);
                        results.distances.length.should.be.equal(9);
                        results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                        results.should.have.property('_metadata');
                        results._metadata.should.have.property('skip');
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.should.have.property('limit');
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                        results._metadata.should.have.property('totalCount');
                        results._metadata.totalCount.should.be.equal(9);
                        results._metadata.source.should.be.equal("Database");
                        for(res in results.observations){
                            results.distances[res].should.be.lessThanOrEqual(test_distance);
                        }
                    }
                    done();
                });
            });
        });
    });


    function setObservationsUpdate(number,updateRecord,returnCallback){

        observationUtility.find({},function(err,results){
            if(err) consoleLogError.printErrorLog(testTypeMessage +": setObservationsUpdate -->" + err.message);

            var range = _.range(number);

            async.eachOf(range, function(value,index, callback) {

                observationUtility.findByIdAndUpdate(results[index]._id,updateRecord,function(err,res){
                    callback(err);
                });

            }, function(err) {
                if(err) consoleLogError.printErrorLog(testTypeMessage +": setObservationsUpdate -->" + err.message);
                returnCallback(null);
            });
        });
    }



    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations by timestamp]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var nUpdate=10;
            setObservationsUpdate(nUpdate,{timestamp:ts},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/getObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({
                            pagination:pagination,
                            searchFilters: {
                                timestamp:{
                                    from:ts
                                }
                            }
                        })
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property("observations");
                            results.observations.length.should.be.equal(nUpdate);
                            results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                            results.should.have.property('_metadata');
                            results._metadata.should.have.property('skip');
                            results._metadata.skip.should.be.equal(conf.pagination.skip);
                            results._metadata.should.have.property('limit');
                            results._metadata.limit.should.be.equal(conf.pagination.limit);
                            results._metadata.should.have.property('totalCount');
                            results._metadata.totalCount.should.be.equal(nUpdate);
                            results._metadata.source.should.be.equal("Database");
                        }
                        done();
                    });
                }
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations by timestamp from and to]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var nUpdate=10;
            setObservationsUpdate(nUpdate,{timestamp:ts},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/getObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({
                            pagination:pagination,
                            searchFilters: {
                                timestamp:{
                                    from:ts,
                                    to:ts+1
                                }
                            }
                        })
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property("observations");
                            results.observations.length.should.be.equal(nUpdate);
                            results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                            results.should.have.property('_metadata');
                            results._metadata.should.have.property('skip');
                            results._metadata.skip.should.be.equal(conf.pagination.skip);
                            results._metadata.should.have.property('limit');
                            results._metadata.limit.should.be.equal(conf.pagination.limit);
                            results._metadata.should.have.property('totalCount');
                            results._metadata.totalCount.should.be.equal(nUpdate);
                            results._metadata.source.should.be.equal("Database");
                        }
                        done();
                    });
                }
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations by value min]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var value=500;
            var nUpdate=10;
            setObservationsUpdate(nUpdate,{value:value},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/getObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({
                            pagination:pagination,
                            searchFilters: {
                                value:{
                                    min:value
                                }
                            }
                        })
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property("observations");
                            results.observations.length.should.be.equal(nUpdate);
                            results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                            results.should.have.property('_metadata');
                            results._metadata.should.have.property('skip');
                            results._metadata.skip.should.be.equal(conf.pagination.skip);
                            results._metadata.should.have.property('limit');
                            results._metadata.limit.should.be.equal(conf.pagination.limit);
                            results._metadata.should.have.property('totalCount');
                            results._metadata.totalCount.should.be.equal(nUpdate);
                            results._metadata.source.should.be.equal("Database");
                        }
                        done();
                    });
                }
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations by value min and max]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var value=500;
            var nUpdate=10;
            setObservationsUpdate(nUpdate,{value:value},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    request.post({
                        url: APIURL +'/' + deviceId +'/actions/getObservations',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({
                            pagination:pagination,
                            searchFilters: {
                                value:{
                                    min:value,
                                    maz:value+1
                                }
                            }
                        })
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property("observations");
                            results.observations.length.should.be.equal(nUpdate);
                            results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                            results.should.have.property('_metadata');
                            results._metadata.should.have.property('skip');
                            results._metadata.skip.should.be.equal(conf.pagination.skip);
                            results._metadata.should.have.property('limit');
                            results._metadata.limit.should.be.equal(conf.pagination.limit);
                            results._metadata.should.have.property('totalCount');
                            results._metadata.totalCount.should.be.equal(nUpdate);
                            results._metadata.source.should.be.equal("Database");
                        }
                        done();
                    });
                }
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations by value and timestamp]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var value=500;
            var nUpdate=10;
            setObservationsUpdate(nUpdate*2,{value:value},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    setObservationsUpdate(nUpdate,{value:value,timestamp:ts},function(error){
                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else{
                            request.post({
                                url: APIURL +'/' + deviceId +'/actions/getObservations',
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                body: JSON.stringify({
                                    pagination:pagination,
                                    searchFilters: {
                                        value:{
                                            min:value
                                        },
                                        timestamp:{
                                            from:ts,
                                            to:ts+1
                                        }
                                    }
                                })
                            }, function (error, response, body) {

                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var results = JSON.parse(body);
                                    results.should.have.property("observations");
                                    results.observations.length.should.be.equal(nUpdate);
                                    results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                                    results.should.have.property('_metadata');
                                    results._metadata.should.have.property('skip');
                                    results._metadata.skip.should.be.equal(conf.pagination.skip);
                                    results._metadata.should.have.property('limit');
                                    results._metadata.limit.should.be.equal(conf.pagination.limit);
                                    results._metadata.should.have.property('totalCount');
                                    results._metadata.totalCount.should.be.equal(nUpdate);
                                    results._metadata.source.should.be.equal("Database");
                                }
                                done();
                            });
                        }
                    });
                }
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action search [10 observations by value and timestamp, and unitsId]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var value=500;
            var nUpdate=10;
            var unitId=observationUtility.ObjectId();
            setObservationsUpdate(nUpdate*3,{value:value},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    setObservationsUpdate(nUpdate*2,{value:value,timestamp:ts},function(error){
                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else{
                            setObservationsUpdate(nUpdate,{value:value,timestamp:ts,unitId:unitId},function(error){
                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else{
                                    request.post({
                                        url: APIURL +'/' + deviceId +'/actions/getObservations',
                                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                        body: JSON.stringify({
                                            pagination:pagination,
                                            searchFilters: {
                                                value:{
                                                    min:value
                                                },
                                                timestamp:{
                                                    from:ts,
                                                    to:ts+1
                                                },
                                                unitsId:[unitId]
                                            }
                                        })
                                    }, function (error, response, body) {

                                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                        else {
                                            response.statusCode.should.be.equal(200);
                                            var results = JSON.parse(body);
                                            results.should.have.property("observations");
                                            results.observations.length.should.be.equal(nUpdate);
                                            results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                                            results.should.have.property('_metadata');
                                            results._metadata.should.have.property('skip');
                                            results._metadata.skip.should.be.equal(conf.pagination.skip);
                                            results._metadata.should.have.property('limit');
                                            results._metadata.limit.should.be.equal(conf.pagination.limit);
                                            results._metadata.should.have.property('totalCount');
                                            results._metadata.totalCount.should.be.equal(nUpdate);
                                            results._metadata.source.should.be.equal("Database");
                                        }
                                        done();
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });




    describe(testTypeMessage, function () {
        testMessage='must test API action search [9 observations by value, timestamp, unitsId, location]';
        it(testMessage, function (done) {
            var observation=[38.990519,8.936253];
            var test_distance=2700;
            var ts=(new Date()).getTime();
            var value=500;
            var nUpdate=10;
            var unitId=observationUtility.ObjectId();
            setObservationsUpdate(nUpdate*3,{value:value},function(error){
                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else{
                    setObservationsUpdate(nUpdate*2,{value:value,timestamp:ts},function(error){
                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else{
                            setObservationsUpdate(nUpdate,{value:value,timestamp:ts,unitId:unitId},function(error){
                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else{
                                    localizeObservations(observation,1,10,300,100,function(err,locations){
                                        request.post({
                                            url: APIURL +'/' + deviceId +'/actions/getObservations',
                                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                            body: JSON.stringify({
                                                pagination:pagination,
                                                searchFilters: {
                                                    value:{
                                                        min:value
                                                    },
                                                    timestamp:{
                                                        from:ts,
                                                        to:ts+1
                                                    },
                                                    unitsId:[unitId],
                                                    location: {
                                                        centre: {
                                                            coordinates: observation
                                                        },
                                                        distance: test_distance,
                                                        distanceOptions: {
                                                            mode: "radius",
                                                            returnDistance:true
                                                        }
                                                    }
                                                }
                                            })
                                        }, function (error, response, body) {

                                            if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                            else {
                                                response.statusCode.should.be.equal(200);
                                                var results = JSON.parse(body);
                                                results.should.have.property("observations");
                                                results.should.have.property("distances");
                                                results.observations.length.should.be.equal(9);
                                                results.distances.length.should.be.equal(9);
                                                results.observations[0].should.have.properties("_id","timestamp","value","location","deviceId","unitId");
                                                results.should.have.property('_metadata');
                                                results._metadata.should.have.property('skip');
                                                results._metadata.skip.should.be.equal(conf.pagination.skip);
                                                results._metadata.should.have.property('limit');
                                                results._metadata.limit.should.be.equal(conf.pagination.limit);
                                                results._metadata.should.have.property('totalCount');
                                                results._metadata.totalCount.should.be.equal(9);
                                                results._metadata.source.should.be.equal("Database");
                                                for(res in results.observations){
                                                    results.distances[res].should.be.lessThanOrEqual(test_distance);
                                                }
                                            }
                                            done();
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });



});

