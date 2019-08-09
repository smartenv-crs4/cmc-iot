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
var Observation = require('../../../DBEngineHandler/drivers/observationDriver');
var Device=require('../../../DBEngineHandler/drivers/deviceDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/things" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var thingDocuments=require('../../SetTestenv/createThingsDocuments');

var webUiToken;
var thingId;


describe('Things API Test - [CRUD-TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Things.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("Thing CRUD-Tests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Thing CRUD-Tests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {
        thingDocuments.createDocuments(100,function(err,newThingId){
            if (err) consoleLogError.printErrorLog("Thing CRUD-Tests.js - beforeEach - Things.create ---> " + err);
            thingId=newThingId;
            done();
        });
    });


    afterEach(function (done) {
        Things.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Thing CRUD-Tests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ******************************************************************************************************************/
    describe('POST /thing', function(){

        it('must test thing creation [create Thing]', function(done){
            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /thing: 'must test thing creation [create Thing] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                }
                done();
            });

        });
    });


    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /thing/:id', function(){

        it('must test get thing by Id', function(done){
            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /thing/:id :'must test get thing by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                }

                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /thing/:id :'must test get thing by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('name');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('api');
                        resultsById.should.have.property('direct');
                        resultsById.should.have.property('ownerId');
                        resultsById.should.have.property('vendorId');
                        resultsById.should.have.property('siteId');
                        resultsById.should.have.property('dismissed');
                        resultsById.should.have.property('disabled');
                        resultsById.should.have.property('mobile');
                        resultsById._id.should.be.eql(results._id);
                    }
                    done();
                });
            });

        });
    });


    /******************************************************************************************************************
     ************************************************* READ TESTS *****************************************************
     ***************************************************************************************************************** */



    describe('GET /device', function(){

        it('must test get thing filter by disabled(Boolean)', function(done){
            var bodyParam=JSON.stringify({thing:{disabled:true, name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /thing :'must test get thing filter by disabled(Boolean) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('vendorId');
                    results.should.have.property('ownerId');
                }

                var geByIdRequestUrl=APIURL + "?disabled=true&access_token="+ webUiToken;
                request.get(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("GET /thing :'must test get thing filter by disabled(Boolean) -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('_metadata');
                        resultsById.should.have.property('things');
                        resultsById.things[0].should.have.property('name');
                        resultsById.things[0].should.have.property('description');
                        resultsById.things[0].should.have.property('vendorId');
                        resultsById.things[0].should.have.property('ownerId');
                        resultsById.things[0].should.have.property('disabled');
                        resultsById.things[0].disabled.should.be.true();
                        resultsById.things.length.should.be.eql(1);
                        resultsById.things[0]._id.should.be.eql(results._id);
                    }
                    done();
                });
            });

        });
    });


    describe('GET /things', function(){

        it('must test no dismissed status in query results', function(done){

            var geByIdRequestUrl=APIURL+ "?access_token="+ webUiToken;
            request.get(geByIdRequestUrl,function(error, response, body){
                if(error) consoleLogError.printErrorLog("GET /things :'must test no dismissed status in query results' -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(200);
                    results.should.have.property('things');
                    results.should.have.property('_metadata');
                    results.things[0].should.have.properties("_id","name","description","ownerId", "vendorId","disabled");
                    results.things[0].should.not.have.properties("dismissed");
                }
                done();
            });

        });
    });



    /******************************************************************************************************************
     ********************************************* UPDATE TESTS (PUT))**********************************************
     ***************************************************************************************************************** */

    describe('PUT /thing/:id', function(){

        it('must test update thing by Id', function(done){
            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };

            // Crete Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("PUT /thing/:id :'must test update thing by Id -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                }


                var nameUpdated="nameUpdated";
                bodyParam=JSON.stringify({thing:{name:nameUpdated}, access_token:webUiToken});
                requestParams={
                    url:APIURL+"/" + results._id,
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.put(requestParams,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("PUT /thing/:id :'must test update thing by Id -->" + error.message);
                    else{
                        var resultsById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsById.should.have.property('name');
                        resultsById.should.have.property('description');
                        resultsById.should.have.property('api');
                        resultsById.should.have.property('direct');
                        resultsById.should.have.property('ownerId');
                        resultsById.should.have.property('vendorId');
                        resultsById.should.have.property('siteId');
                        resultsById.should.have.property('dismissed');
                        resultsById.should.have.property('disabled');
                        resultsById.should.have.property('mobile');
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



    describe('DELETE /thing', function(){

        it('must test thing Delete (without devices)', function(done){

            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (without devices) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                    results.dismissed.should.be.false();
                }

                // DELETE Thing
                var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                request.del(geByIdRequestUrl,function(error, response, body){
                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (without devices) -->" + error.message);
                    else{
                        var resultsDeleteById = JSON.parse(body);
                        response.statusCode.should.be.equal(200);
                        resultsDeleteById.should.have.property('name');
                        resultsDeleteById.should.have.property('description');
                        resultsDeleteById.should.have.property('api');
                        resultsDeleteById.should.have.property('direct');
                        resultsDeleteById.should.have.property('ownerId');
                        resultsDeleteById.should.have.property('vendorId');
                        resultsDeleteById.should.have.property('siteId');
                        resultsDeleteById.should.have.property('dismissed');
                        resultsDeleteById.should.have.property('disabled');
                        resultsDeleteById.should.have.property('mobile');
                        resultsDeleteById._id.should.be.eql(results._id);
                        resultsDeleteById.dismissed.should.be.false();
                    }

                    //Search Thing to confirm delete
                    var geByIdRequestUrl=APIURL+"/" + results._id + "?access_token="+ webUiToken;
                    request.get(geByIdRequestUrl,function(error, response, body){
                        if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (without devices) -->" + error.message);
                        else{
                            response.statusCode.should.be.equal(204);
                        }
                        done();
                    });
                });


            });

        });
    });



    describe('DELETE /thing', function(){

        it('must test thing Delete (with one device and without observation)', function(done){

            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and without observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    // results.should.have.property('name');
                    // results.should.have.property('description');
                    // results.should.have.property('thingId');
                    // results.should.have.property('typeId');
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                    results.dismissed.should.be.false();
                }


                // create Device
                Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device){
                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and without observation) -->" + error.message);
                    else {
                        // DELETE Thing
                        var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                        request.del(geByIdRequestUrl, function (error, response, body) {
                            if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and without observation) -->" + error.message);
                            else {
                                var resultsDeleteById = JSON.parse(body);
                                response.statusCode.should.be.equal(200);
                                resultsDeleteById.should.have.property('name');
                                resultsDeleteById.should.have.property('description');
                                resultsDeleteById.should.have.property('api');
                                resultsDeleteById.should.have.property('direct');
                                resultsDeleteById.should.have.property('ownerId');
                                resultsDeleteById.should.have.property('vendorId');
                                resultsDeleteById.should.have.property('siteId');
                                resultsDeleteById.should.have.property('dismissed');
                                resultsDeleteById.should.have.property('disabled');
                                resultsDeleteById.should.have.property('mobile');
                                resultsDeleteById._id.should.be.eql(results._id);
                                resultsDeleteById.dismissed.should.be.false();
                            }

                            //Search Thing to confirm delete
                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                            request.get(geByIdRequestUrl, function (error, response, body) {
                                if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and without observation) -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(204);
                                }
                                // search device to confirm device deletion
                                Device.findById(device._id, null, function (err, removedDev) {
                                    should(err).be.null();
                                    should(removedDev).be.null();
                                    done();
                                });
                            });
                        });
                    }
                });
            });
        });
    });


    describe('DELETE /thing', function(){

        it('must test thing Delete (with one device and with observation)', function(done){

            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                    results.dismissed.should.be.false();
                }


                // create Device
                Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device){
                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                    else {

                        device.should.have.property('name');
                        device.should.have.property('description');
                        device.should.have.property('thingId');
                        device.should.have.property('typeId');

                        // create Observation
                        Observation.create({deviceId:device._id},function(err,observation){
                            if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                            else {
                                // DELETE Thing
                                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                request.del(geByIdRequestUrl, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                                    else {
                                        var resultsDeleteById = JSON.parse(body);
                                        response.statusCode.should.be.equal(200);
                                        resultsDeleteById.should.have.property('name');
                                        resultsDeleteById.should.have.property('description');
                                        resultsDeleteById.should.have.property('api');
                                        resultsDeleteById.should.have.property('direct');
                                        resultsDeleteById.should.have.property('ownerId');
                                        resultsDeleteById.should.have.property('vendorId');
                                        resultsDeleteById.should.have.property('siteId');
                                        resultsDeleteById.should.have.property('dismissed');
                                        resultsDeleteById.should.have.property('disabled');
                                        resultsDeleteById.should.have.property('mobile');
                                        resultsDeleteById._id.should.be.eql(results._id);
                                        resultsDeleteById.dismissed.should.be.true();
                                    }

                                    //Search Thing to confirm delete
                                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                    request.get(geByIdRequestUrl, function (error, response, body) {
                                        if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                                        else {
                                            var resultsGetById = JSON.parse(body);
                                            response.statusCode.should.be.equal(200);
                                            resultsGetById.should.have.property('name');
                                            resultsGetById.should.have.property('description');
                                            resultsGetById.should.have.property('api');
                                            resultsGetById.should.have.property('direct');
                                            resultsGetById.should.have.property('ownerId');
                                            resultsGetById.should.have.property('vendorId');
                                            resultsGetById.should.have.property('siteId');
                                            resultsGetById.should.have.property('dismissed');
                                            resultsGetById.should.have.property('disabled');
                                            resultsGetById.should.have.property('mobile');
                                            resultsGetById._id.should.be.eql(results._id);
                                            resultsGetById.dismissed.should.be.true();
                                            resultsGetById.ownerId.should.be.eql(conf.cmcIoTThingsOwner._id);
                                        }

                                        // search device to confirm device deletion
                                        Device.findById(device._id, null, function (err, findBiIdDev) {
                                            should(err).be.null();
                                            findBiIdDev.should.have.property('name');
                                            findBiIdDev.should.have.property('description');
                                            findBiIdDev.should.have.property('thingId');
                                            findBiIdDev.should.have.property('typeId');
                                            findBiIdDev.dismissed.should.be.true();
                                            findBiIdDev.disabled.should.be.false();
                                            Observation.findOneAndRemove(observation._id,null,function(err,removedObs){
                                                should(err).be.null();
                                                done();
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    });


    describe('DELETE /thing', function(){

        it('must test thing Delete (with two devices and without observation)', function(done){

            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with two devices and without observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                    results.dismissed.should.be.false();
                }


                // create Device
                Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device1){
                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with two devices and without observation) -->" + error.message);
                    else {

                        device1.should.have.property('name');
                        device1.should.have.property('description');
                        device1.should.have.property('thingId');
                        device1.should.have.property('typeId');

                        Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device2) {
                            if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with two devices and without observation) -->" + error.message);
                            else {
                                device2.should.have.property('name');
                                device2.should.have.property('description');
                                device2.should.have.property('thingId');
                                device2.should.have.property('typeId');
                                // DELETE Thing
                                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                request.del(geByIdRequestUrl, function (error, response, body) {
                                    if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with two devices and without observation) -->" + error.message);
                                    else {
                                        var resultsDeleteById = JSON.parse(body);
                                        response.statusCode.should.be.equal(200);
                                        resultsDeleteById.should.have.property('name');
                                        resultsDeleteById.should.have.property('description');
                                        resultsDeleteById.should.have.property('api');
                                        resultsDeleteById.should.have.property('direct');
                                        resultsDeleteById.should.have.property('ownerId');
                                        resultsDeleteById.should.have.property('vendorId');
                                        resultsDeleteById.should.have.property('siteId');
                                        resultsDeleteById.should.have.property('dismissed');
                                        resultsDeleteById.should.have.property('disabled');
                                        resultsDeleteById.should.have.property('mobile');
                                        resultsDeleteById._id.should.be.eql(results._id);
                                        resultsDeleteById.dismissed.should.be.false();
                                    }

                                    //Search Thing to confirm delete
                                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                    request.get(geByIdRequestUrl, function (error, response, body) {
                                        if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with two devices and without observation) -->" + error.message);
                                        else {
                                            response.statusCode.should.be.equal(204);
                                        }
                                        // search device to confirm device deletion
                                        Device.findById(device1._id, null, function (err, removedDev1) {
                                            should(err).be.null();
                                            should(removedDev1).be.null();
                                            Device.findById(device2._id, null, function (err, removedDev2) {
                                                should(err).be.null();
                                                should(removedDev2).be.null();
                                                done();
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            });
        });
    });



    describe('DELETE /thing', function(){

        it('must test thing Delete (with two devices[dev1,dev2]. dev1 has observation, dev has not observation)', function(done){

            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                    results.dismissed.should.be.false();
                }

                // create Device
                Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device1){
                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                    else {
                        device1.should.have.property('name');
                        device1.should.have.property('description');
                        device1.should.have.property('thingId');
                        device1.should.have.property('typeId');
                        device1.dismissed.should.be.false();

                        Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device2){
                            if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                            else {
                                device2.should.have.property('name');
                                device2.should.have.property('description');
                                device2.should.have.property('thingId');
                                device2.should.have.property('typeId');
                                device2.dismissed.should.be.false();

                                // create Observation
                                Observation.create({deviceId:device1._id},function(err,observation){
                                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                    else {
                                        // DELETE Thing
                                        var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                        request.del(geByIdRequestUrl, function (error, response, body) {
                                            if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                            else {
                                                var resultsDeleteById = JSON.parse(body);
                                                response.statusCode.should.be.equal(200);
                                                resultsDeleteById.should.have.property('name');
                                                resultsDeleteById.should.have.property('description');
                                                resultsDeleteById.should.have.property('api');
                                                resultsDeleteById.should.have.property('direct');
                                                resultsDeleteById.should.have.property('ownerId');
                                                resultsDeleteById.should.have.property('vendorId');
                                                resultsDeleteById.should.have.property('siteId');
                                                resultsDeleteById.should.have.property('dismissed');
                                                resultsDeleteById.should.have.property('disabled');
                                                resultsDeleteById.should.have.property('mobile');
                                                resultsDeleteById._id.should.be.eql(results._id);
                                                resultsDeleteById.dismissed.should.be.true();
                                            }

                                            //Search Thing to confirm delete
                                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                            request.get(geByIdRequestUrl, function (error, response, body) {
                                                if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                                else {
                                                    var resultsGetById = JSON.parse(body);
                                                    response.statusCode.should.be.equal(200);
                                                    resultsGetById.should.have.property('name');
                                                    resultsGetById.should.have.property('description');
                                                    resultsGetById.should.have.property('api');
                                                    resultsGetById.should.have.property('direct');
                                                    resultsGetById.should.have.property('ownerId');
                                                    resultsGetById.should.have.property('vendorId');
                                                    resultsGetById.should.have.property('siteId');
                                                    resultsGetById.should.have.property('dismissed');
                                                    resultsGetById.should.have.property('disabled');
                                                    resultsGetById.should.have.property('mobile');
                                                    resultsGetById._id.should.be.eql(results._id);
                                                    resultsGetById.dismissed.should.be.true();
                                                    resultsGetById.ownerId.should.be.eql(conf.cmcIoTThingsOwner._id);
                                                    // search device1 to confirm device1 dismiss
                                                    Device.findById(device1._id, null, function (err, findBiIdDev) {
                                                        should(err).be.null();
                                                        findBiIdDev.should.have.property('name');
                                                        findBiIdDev.should.have.property('description');
                                                        findBiIdDev.should.have.property('thingId');
                                                        findBiIdDev.should.have.property('typeId');
                                                        findBiIdDev.dismissed.should.be.true();
                                                        findBiIdDev.disabled.should.be.false();
                                                        Device.findById(device2._id, null, function (err, findBiIdDev2) {
                                                            should(err).be.null();
                                                            should(findBiIdDev2).be.null();
                                                            Observation.findOneAndRemove(observation._id,null,function(err,removedObs){
                                                                should(err).be.null();
                                                                done();
                                                            });
                                                        });
                                                    });
                                                }
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

 describe('DELETE /thing', function(){

        it('must test thing Delete (with two devices[dev1,dev2]. dev1 and dev2 has observation)', function(done){

            var bodyParam=JSON.stringify({thing:{name:"name", description: "description",api:{url:"HTTP://127.0.0.1"}, ownerId:Things.ObjectId(), vendorId:Things.ObjectId(), siteId:Things.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            // create Thing
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device and with observation) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('api');
                    results.should.have.property('direct');
                    results.should.have.property('ownerId');
                    results.should.have.property('vendorId');
                    results.should.have.property('siteId');
                    results.should.have.property('dismissed');
                    results.should.have.property('disabled');
                    results.should.have.property('mobile');
                    results.dismissed.should.be.false();
                }

                // create Device
                Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device1){
                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                    else {
                        device1.should.have.property('name');
                        device1.should.have.property('description');
                        device1.should.have.property('thingId');
                        device1.should.have.property('typeId');
                        device1.dismissed.should.be.false();

                        Device.create({name:"name", description: "description",thingId:results._id, typeId:Device.ObjectId()},function(err,device2){
                            if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                            else {
                                device2.should.have.property('name');
                                device2.should.have.property('description');
                                device2.should.have.property('thingId');
                                device2.should.have.property('typeId');
                                device2.dismissed.should.be.false();

                                // create Observation
                                Observation.create({deviceId:device1._id},function(err,observation){
                                    if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                    else {
                                        Observation.create({deviceId:device2._id},function(err,observation2){
                                            if(error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                            else {
                                                // DELETE Thing
                                                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                                request.del(geByIdRequestUrl, function (error, response, body) {
                                                    if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                                    else {
                                                        var resultsDeleteById = JSON.parse(body);
                                                        response.statusCode.should.be.equal(200);
                                                        resultsDeleteById.should.have.property('name');
                                                        resultsDeleteById.should.have.property('description');
                                                        resultsDeleteById.should.have.property('api');
                                                        resultsDeleteById.should.have.property('direct');
                                                        resultsDeleteById.should.have.property('ownerId');
                                                        resultsDeleteById.should.have.property('vendorId');
                                                        resultsDeleteById.should.have.property('siteId');
                                                        resultsDeleteById.should.have.property('dismissed');
                                                        resultsDeleteById.should.have.property('disabled');
                                                        resultsDeleteById.should.have.property('mobile');
                                                        resultsDeleteById._id.should.be.eql(results._id);
                                                        resultsDeleteById.dismissed.should.be.true();
                                                    }

                                                    //Search Thing to confirm delete
                                                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken;
                                                    request.get(geByIdRequestUrl, function (error, response, body) {
                                                        if (error) consoleLogError.printErrorLog("DELETE /thing: 'must test thing Delete (with one device1 and with observation) -->" + error.message);
                                                        else {
                                                            var resultsGetById = JSON.parse(body);
                                                            response.statusCode.should.be.equal(200);
                                                            resultsGetById.should.have.property('name');
                                                            resultsGetById.should.have.property('description');
                                                            resultsGetById.should.have.property('api');
                                                            resultsGetById.should.have.property('direct');
                                                            resultsGetById.should.have.property('ownerId');
                                                            resultsGetById.should.have.property('vendorId');
                                                            resultsGetById.should.have.property('siteId');
                                                            resultsGetById.should.have.property('dismissed');
                                                            resultsGetById.should.have.property('disabled');
                                                            resultsGetById.should.have.property('mobile');
                                                            resultsGetById._id.should.be.eql(results._id);
                                                            resultsGetById.dismissed.should.be.true();
                                                            resultsGetById.ownerId.should.be.eql(conf.cmcIoTThingsOwner._id);
                                                            // search device1 to confirm device1 dismiss
                                                            Device.findById(device1._id, null, function (err, findBiIdDev) {
                                                                should(err).be.null();
                                                                findBiIdDev.should.have.property('name');
                                                                findBiIdDev.should.have.property('description');
                                                                findBiIdDev.should.have.property('thingId');
                                                                findBiIdDev.should.have.property('typeId');
                                                                findBiIdDev.dismissed.should.be.true();
                                                                findBiIdDev.disabled.should.be.false();
                                                                Device.findById(device2._id, null, function (err, findBiIdDev2) {
                                                                    findBiIdDev2.should.have.property('name');
                                                                    findBiIdDev2.should.have.property('description');
                                                                    findBiIdDev2.should.have.property('thingId');
                                                                    findBiIdDev2.should.have.property('typeId');
                                                                    findBiIdDev2.dismissed.should.be.true();
                                                                    findBiIdDev2.disabled.should.be.false();;
                                                                    Observation.findOneAndRemove(observation._id,null,function(err,removedObs){
                                                                        should(err).be.null();
                                                                        Observation.findOneAndRemove(observation2._id,null,function(err,removedObs){
                                                                            should(err).be.null();
                                                                            done();
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        }
                                                    });
                                                });
                                            }
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





});
