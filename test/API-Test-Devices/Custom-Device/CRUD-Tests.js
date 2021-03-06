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
var thingsDriver = require('../../../DBEngineHandler/drivers/thingDriver');
var observationUtility = require('../../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/devices" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var deviceDocuments=require('../../SetTestenv/createDevicesDocuments');
var should=require('should');

var webUiToken;
var deviceId;
var thingId;


describe('Devices API Test - [CRUD-TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        deviceDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("Device CRUD-Tests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Device CRUD-Tests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {
        deviceDocuments.createDocuments(100,function(err,foreignKey){
            if (err) consoleLogError.printErrorLog("Device CRUD-Tests.js - beforeEach - Devices.create ---> " + err);
            deviceId=foreignKey.deviceId;
            thingId=foreignKey.thingId;
            done();
        });
    });


    afterEach(function (done) {
        deviceDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Device CRUD-Tests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */
    describe('POST /device', function(){

        it('must test device creation [create Device]', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation [create Device] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.should.have.property('disabled');
                    results.should.not.have.property('dismissed');
                }
                done();
            });

        });
    });


    describe('POST /device', function(){

        it('must test device creation [Create Device. dismissed Thing]', function(done){

            thingsDriver.findByIdAndUpdate(thingId,{dismissed:true},function(err,dismissedThing){
                if(err) consoleLogError.printErrorLog("POST /device: 'must test device creation [Create Device. dismissed Thing] -->" + error.message);
                else{
                    var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
                    var requestParams={
                        url:APIURL,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                        body:bodyParam
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation [Create Device. dismissed Thing] -->" + error.message);
                        else{
                            var results = JSON.parse(body);
                            response.statusCode.should.be.equal(409);
                            results.should.have.properties('error', 'statusCode', 'message');
                            results.message.should.be.eql("Cannot create device due to associated thing is dismissed");
                        }
                        done();
                    });
                }
            });
        });
    });



    describe('POST /device', function(){

        it('must test device creation [Create Device. Not Available Thing]', function(done){

            thingsDriver.findByIdAndRemove(thingId,function(err,deletedThing){
                if(err) consoleLogError.printErrorLog("POST /device: 'must test device creation [Create Device.  Not Available Thing] -->" + error.message);
                else{
                    var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
                    var requestParams={
                        url:APIURL,
                        headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                        body:bodyParam
                    };
                    request.post(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation [Create Device.  Not Available Thing] -->" + error.message);
                        else{
                            var results = JSON.parse(body);
                            response.statusCode.should.be.equal(409);
                            results.should.have.properties('error', 'statusCode', 'message');
                            results.message.should.be.eql("Cannot create device due to associated thing is not available");
                        }
                        done();
                    });
                }
            });
        });
    });

    /******************************************************************************************************************
     ********************************************* READ TESTS (Get )**********************************************
     ***************************************************************************************************************** */

    describe('GET /device', function(){

        it('must test get device filter by disabled(Boolean)', function(done){
            var bodyParam=JSON.stringify({device:{disabled:true,name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /device :'must test get device filter by disabled(Boolean) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                }

                var geByIdRequestUrl=APIURL + "?disabled=true&access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /device :'must test get device filter by disabled(Boolean) -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('_metadata');
                        resultsById.should.have.property('devices');
                        resultsById.devices[0].should.have.property('name');
                        resultsById.devices[0].should.have.property('description');
                        resultsById.devices[0].should.have.property('thingId');
                        resultsById.devices[0].should.have.property('typeId');
                        resultsById.devices[0].should.have.property('disabled');
                        resultsById.devices[0].should.not.have.property('dismissed');
                        resultsById.devices[0].disabled.should.be.true();
                        resultsById.devices.length.should.be.eql(1);
                        resultsById.devices[0]._id.should.be.eql(results._id);
                    }
                    done();
                });
            });

        });
    });


    describe('GET /devices', function(){

        it('must test no dismissed status in query results', function(done){

            var geByIdRequestUrl=APIURL+ "?access_token="+ webUiToken;
            request.get(geByIdRequestUrl,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /devices :'must test no dismissed status in query results' -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(200);
                    results.should.have.property('devices');
                    results.should.have.property('_metadata');
                    results.devices[0].should.have.properties("_id","name","description","thingId", "typeId","disabled");
                    results.devices[0].should.not.have.property("dismissed");
                }
                done();
            });

        });
    });

    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /device/:id', function(){

        it('must test get device by Id', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /device/:id :'must test get device by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                }

                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /device/:id :'must test get device by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('name');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('thingId');
                        resultsById.should.have.property('typeId');
                        resultsById.should.have.property('disabled');
                        resultsById.should.have.property('dismissed');
                        resultsById._id.should.be.eql(results._id);
                    }
                    done();
                });
            });

        });
    });

    describe('GET /device/:id', function(){

        it('must test get device by Id (remove dismissed if not authorised)', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /device/:id :''must test get device by Id (remove dismissed if not authorised -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                }
                // todo remove disableAdmin=true when acl mucroservice is On. Used only for testing
                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken+ "&disableAdmin=true";
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /device/:id :''must test get device by Id (remove dismissed if not authorised -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('name');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('thingId');
                        resultsById.should.have.property('typeId');
                        resultsById.should.have.property('disabled');
                        resultsById.should.not.have.property('dismissed');
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

    describe('PUT /device/:id', function(){

        it('must test update device by Id', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("PUT /device/:id :'must test update device by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.should.not.have.property('dismissed');
                    results.should.have.property('disabled');
                }


                var nameUpdated="nameUpdated";
                bodyParam=JSON.stringify({device:{name:nameUpdated}, access_token:webUiToken});
                requestParams={
                    url:APIURL+"/" + results._id,
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /device/:id :'must test update device by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('name');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('thingId');
                        resultsById.should.have.property('typeId');
                        resultsById.should.have.property('dismissed');
                        resultsById.should.have.property('disabled');
                        resultsById._id.should.be.eql(results._id);
                        resultsById.name.should.be.eql(nameUpdated);
                    }
                    done();
                });
            });

        });
    });


    describe('PUT /device/:id', function(){

        it('must test update device and remove dismissed field from results', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("PUT /device/:id :''must test update device and remove dismissed field from results -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.should.not.have.property('dismissed');
                    results.should.have.property('disabled');
                }


                var nameUpdated="nameUpdated";
                bodyParam=JSON.stringify({device:{name:nameUpdated}, access_token:webUiToken});
                requestParams={
                    url:APIURL+"/" + results._id+ "?disableAdmin=true",
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /device/:id :''must test update device and remove dismissed field from results -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('name');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('thingId');
                        resultsById.should.have.property('typeId');
                        resultsById.should.not.have.property('dismissed');
                        resultsById.should.have.property('disabled');
                        resultsById._id.should.be.eql(results._id);
                        resultsById.name.should.be.eql(nameUpdated);
                    }
                    done();
                });
            });

        });
    });

    describe('PUT /device/:id', function(){

        it('\'must test update device by Id error due to dismissed thing', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("PUT /device/:id :''must test update device by Id error due to dismissed thing -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                }


                Devices.findByIdAndUpdate(results._id,{dismissed:true},function (err,updatedDevice) {
                    should(err).be.null();
                    updatedDevice.dismissed.should.be.true();

                    var nameUpdated="nameUpdated";
                    bodyParam=JSON.stringify({device:{name:nameUpdated}, access_token:webUiToken});
                    requestParams={
                        url:APIURL+"/" + results._id,
                        headers:{'content-type': 'application/json'},
                        body:bodyParam
                    };
                    request.put(requestParams,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("PUT /device/:id :''must test update device by Id error due to dismissed thing -->" + error.message);
                        else{
                            var resultsById = JSON.parse(body);
                            response.statusCode.should.be.equal(422);
                            resultsById.should.have.property('error');
                            resultsById.should.have.property('message');
                            resultsById.message.should.be.eql("The device '" +results._id + "' was removed from available devices/things.");
                        }
                        done();
                    });
                });


            });

        });
    });


    /******************************************************************************************************************
    ************************************************** DELETE TESTS **************************************************
    ***************************************************************************************************************** */



    describe('DELETE /device', function(){

        it('must test device Delete (without observation)', function(done){

            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (without observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.should.not.have.property('dismissed');

                }

                // DELETE Device
                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.del(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (without observation) -->" + error.message);
                    else{
                        var resultsDeleteById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsDeleteById.should.have.property('name');
                        resultsDeleteById.should.have.property('description');
                        resultsDeleteById.should.have.property('thingId');
                        resultsDeleteById.should.have.property('typeId');
                        resultsDeleteById.should.have.property('dismissed');
                        resultsDeleteById._id.should.be.eql(results._id);
                        resultsDeleteById.dismissed.should.be.false();
                    }

                    //Search Device to confirm delete
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.get(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (without observation) -->" + error.message);
                        else{
                            response.statusCode.should.be.equal(204);
                        }
                        done();
                    });
                });


            });

        });
    });


    describe('DELETE /device', function(){

        it('must test device Delete (with observation)', function(done){

            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (with observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.should.not.have.property('dismissed');
                }


                // create observationUtility
                observationUtility.create({timestamp: 0, value: 0, location: {type: "Point", coordinates: [1, 1]},deviceId:results._id,unitId: observationUtility.ObjectId()},function(err,observation){

                    // DELETE Device
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.del(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (with observation) -->" + error.message);
                        else{
                            var resultsDeleteById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsDeleteById.should.have.property('name');
                            resultsDeleteById.should.have.property('description');
                            resultsDeleteById.should.have.property('thingId');
                            resultsDeleteById.should.have.property('typeId');
                            resultsDeleteById.should.have.property('dismissed');
                            resultsDeleteById._id.should.be.eql(results._id);
                            resultsDeleteById.dismissed.should.be.true();
                            resultsDeleteById.disabled.should.be.true();
                        }

                        //Search Device to confirm delete
                        var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                        request.get(geByIdRequestUrl,function(error, response, body){
                            if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (with observation) -->" + error.message);
                            else{
                                var resultsFindById = JSON.parse(body);
                                response.statusCode.should.be.equal(200);
                                resultsFindById.should.have.property('name');
                                resultsFindById.should.have.property('description');
                                resultsFindById.should.have.property('thingId');
                                resultsFindById.should.have.property('typeId');
                                resultsFindById.should.have.property('dismissed');
                                resultsFindById._id.should.be.eql(results._id);
                                resultsDeleteById.dismissed.should.be.true();
                                resultsDeleteById.disabled.should.be.true();
                            }
                            observationUtility.findByIdAndRemove(observation._id,null,function(err, removedObs){
                                should(err).be.null();
                                done();
                            });
                        });
                    });
                });
            });
        });
    });


    describe('DELETE /device', function(){

        it('must test device Delete (delete dismissed device)', function(done){

            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:thingId, typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Device
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (delete dismissed device) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                    results.should.not.have.property('dismissed');
                }


                // create Observation
                observationUtility.create({timestamp: 0, value: 0, location: {type: "Point", coordinates: [1, 1]},deviceId:results._id,unitId: observationUtility.ObjectId()},function(err,observation){

                    // DELETE Device
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.del(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (delete dismissed device) -->" + error.message);
                        else{
                            var resultsDeleteById = JSON.parse(body);
                            response.statusCode.should.be.equal(200);
                            resultsDeleteById.should.have.property('name');
                            resultsDeleteById.should.have.property('description');
                            resultsDeleteById.should.have.property('thingId');
                            resultsDeleteById.should.have.property('typeId');
                            resultsDeleteById.should.have.property('dismissed');
                            resultsDeleteById._id.should.be.eql(results._id);
                            resultsDeleteById.dismissed.should.be.true();
                            resultsDeleteById.disabled.should.be.true();
                        }

                        //Search Device to confirm delete
                        var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                        request.get(geByIdRequestUrl,function(error, response, body){
                            if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (delete dismissed device) -->" + error.message);
                            else{
                                var resultsFindById = JSON.parse(body);
                                response.statusCode.should.be.equal(200);
                                resultsFindById.should.have.property('name');
                                resultsFindById.should.have.property('description');
                                resultsFindById.should.have.property('thingId');
                                resultsFindById.should.have.property('typeId');
                                resultsFindById.should.have.property('dismissed');
                                resultsFindById._id.should.be.eql(results._id);
                                resultsDeleteById.dismissed.should.be.true();
                                resultsDeleteById.disabled.should.be.true();

                                // DELETE Device again
                                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                                request.del(geByIdRequestUrl,function(error, response, body){
                                    if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (delete dismissed device) -->" + error.message);
                                    else{
                                        var resultsDeleteById = JSON.parse(body);
                                        response.statusCode.should.be.equal(200);
                                        resultsDeleteById.should.have.property('name');
                                        resultsDeleteById.should.have.property('description');
                                        resultsDeleteById.should.have.property('thingId');
                                        resultsDeleteById.should.have.property('typeId');
                                        resultsDeleteById.should.have.property('dismissed');
                                        resultsDeleteById._id.should.be.eql(results._id);
                                        resultsDeleteById.dismissed.should.be.true();
                                        resultsDeleteById.disabled.should.be.true();
                                    }

                                    //Search Device to confirm delete
                                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                                    request.get(geByIdRequestUrl,function(error, response, body){
                                        if(error) consoleLogError.printErrorLog("DELETE /device: 'must test device Delete (delete dismissed device) -->" + error.message);
                                        else{
                                            var resultsFindById = JSON.parse(body);
                                            response.statusCode.should.be.equal(200);
                                            resultsFindById.should.have.property('name');
                                            resultsFindById.should.have.property('description');
                                            resultsFindById.should.have.property('thingId');
                                            resultsFindById.should.have.property('typeId');
                                            resultsFindById.should.have.property('dismissed');
                                            resultsFindById._id.should.be.eql(results._id);
                                            resultsDeleteById.dismissed.should.be.true();
                                            resultsDeleteById.disabled.should.be.true();
                                        }
                                        observationUtility.findByIdAndRemove(observation._id,null,function(err, removedObs){
                                            should(err).be.null();
                                            done();
                                        });
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    });



});
