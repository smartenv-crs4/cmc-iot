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


var ObservedProperties = require('../../../DBEngineHandler/drivers/observedPropertyDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/observedProperties"
var APIURL_deviceTypes = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/deviceTypes"
var APIURL_units = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/units"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var observedPropertyDocuments = require('../../SetTestenv/createObservedPropertiesDocuments')

var webUiToken
var observedPropertyId


describe('ObservedProperties API Test - [CRUD-TESTS]', function() {

    before(function(done) {
        this.timeout(5000)
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })

    after(function(done) {
        this.timeout(5000)
        ObservedProperties.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("ObservedProperty CRUD-Tests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("ObservedProperty generalTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        observedPropertyDocuments.createDocuments(100, function(err, newObservedPropertyId) {
            if (err) consoleLogError.printErrorLog("ObservedProperty generalTests.js - beforeEach - ObservedProperties.create ---> " + err)
            observedPropertyId = newObservedPropertyId
            done()
        })
    })


    afterEach(function(done) {
        ObservedProperties.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("ObservedProperty generalTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */

    describe('POST /observedProperty', function() {
        it('must test observedProperty creation [create ObservedProperty]', function(done) {
            var bodyParam = JSON.stringify({observedProperty: {name: "name", description: "description"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /observedProperty: 'must test observedProperty creation [create ObservedProperty] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                done()
            })
        })
    })


    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /observedProperty/:id', function() {
        it('must test get observedProperty by Id', function(done) {
            var bodyParam = JSON.stringify({
                observedProperty: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create observedProperty
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /observedProperty/:id :'must test get observedProperty by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.get(geByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("GET /observedProperty/:id :'must test get observedProperty by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('description')
                        resultsById._id.should.be.eql(results._id)
                    }
                    done()
                })
            })
        })
    })


    /******************************************************************************************************************
     ********************************************* UPDATE TESTS (PUT))**********************************************
     ***************************************************************************************************************** */

    describe('PUT /observedProperty/:id', function() {
        it('must test update observedProperty by Id', function(done) {
            var bodyParam = JSON.stringify({
                observedProperty: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create observedProperty
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("PUT /observedProperty/:id :'must test update observedProperty by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                var nameUpdated = "nameUpdated"
                bodyParam = JSON.stringify({observedProperty: {name: nameUpdated}, access_token: webUiToken})
                requestParams = {
                    url: APIURL + "/" + results._id,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                }
                request.put(requestParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("PUT /observedProperty/:id :'must test update observedProperty by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('description')
                        resultsById._id.should.be.eql(results._id)
                        resultsById.name.should.be.eql(nameUpdated)
                    }
                    done()
                })
            })
        })
    })


    /******************************************************************************************************************
     ************************************************** DELETE TESTS **************************************************
     ***************************************************************************************************************** */

    describe('DELETE /observedProperty', function() {
        it('must test observedProperty Delete (without associated entities)', function(done) {
            var bodyParam = JSON.stringify({
                observedProperty: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create observedProperty
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /observedProperty: 'must test observedProperty Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                // DELETE observedProperty
                var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.del(getByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("DELETE /observedProperty: 'must test observedProperty Delete -->" + error.message)
                    else {
                        var resultsDeleteById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsDeleteById.should.have.property('name')
                        resultsDeleteById.should.have.property('description')
                        resultsDeleteById._id.should.be.eql(results._id)
                    }
                    //Search observedProperty to confirm delete
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("DELETE /observedProperty: 'must test observedProperty Delete -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(204)
                        }
                        done()
                    })
                })
            })
        })
    })


    describe('DELETE /observedProperties', function() {
        it('must test observedProperty Delete (with associated DeviceTypes)', function(done) {
            var bodyParam = JSON.stringify({
                observedProperty: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create observedProperty
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /observedProperties: 'must test observedProperty Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                // Now let's prepare the body for the associated DeviceType POST request
                var bodyDeviceTypeParam = JSON.stringify({
                    deviceType: {
                        name: "name",
                        description: "description",
                        observedPropertyId: results._id
                    },
                    domains:[results._id]
                });
                var requestDeviceTypeParams = {
                    url: APIURL_deviceTypes,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.adminToken
                    },
                    body: bodyDeviceTypeParam
                }
                // Create the associated DeviceType
                request.post(requestDeviceTypeParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("POST /deviceTypes: " + error.message);
                    else {
                        response.statusCode.should.be.equal(201);
                        // DELETE observedProperty
                        var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                        request.del(getByIdRequestUrl, function(error, response, body) {
                            if (error) consoleLogError.printErrorLog("DELETE /observedProperties: 'must test observedProperty Delete (with associated DeviceTypes) -->" + error.message)
                            else {
                                var resultsDeleteById = JSON.parse(body)
                                response.statusCode.should.be.equal(409) //HTTP Conflict
                                resultsDeleteById.should.have.property("message")
                                resultsDeleteById.message.should.be.equal("Cannot delete the ObservedProperty due to associated DeviceType(s)")
                            }
                            //Search observedProperty to confirm that the it hasn't been deleted
                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                            request.get(geByIdRequestUrl, function(error, response, body) {
                                if (error) consoleLogError.printErrorLog("DELETE /observedProperties: 'must test observedProperty Delete (with associated DeviceTypes) -->" + error.message)
                                else {
                                    var resultsUndeletedDeviceType = JSON.parse(body)
                                    response.statusCode.should.be.equal(200)
                                    resultsUndeletedDeviceType.should.have.property("name")
                                    resultsUndeletedDeviceType.should.have.property("description")
                                }
                                done()
                            })
                        })
                    }
                })
            })
        })
    })


    describe('DELETE /observedProperties', function() {
        it('must test observedProperty Delete (with associated Units)', function(done) {
            var bodyParam = JSON.stringify({
                observedProperty: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create observedProperty
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /observedProperties: 'must test observedProperty Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                // Now let's prepare the body for the associated Unit POST request
                var bodyUnitParam = JSON.stringify({
                    unit: {
                        name: "name",
                        symbol: "symbol",
                        minValue: 0,
                        maxValue: 100,
                        observedPropertyId: results._id
                    }
                })
                var requestUnitParams = {
                    url: APIURL_units,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.adminToken
                    },
                    body: bodyUnitParam
                }
                // Create the associated Unit
                request.post(requestUnitParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("POST /units: " + error.message)
                    else {
                        response.statusCode.should.be.equal(201)
                        // DELETE observedProperty
                        var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                        request.del(getByIdRequestUrl, function(error, response, body) {
                            if (error) consoleLogError.printErrorLog("DELETE /observedProperties: 'must test observedProperty Delete (with associated Units) -->" + error.message)
                            else {
                                var resultsDeleteById = JSON.parse(body)
                                response.statusCode.should.be.equal(409) //HTTP Conflict
                                resultsDeleteById.should.have.property("message")
                                resultsDeleteById.message.should.be.equal("Cannot delete the ObservedProperty due to associated Unit(s)")
                            }
                            //Search observedProperty to confirm that the it hasn't been deleted
                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                            request.get(geByIdRequestUrl, function(error, response, body) {
                                if (error) consoleLogError.printErrorLog("DELETE /observedProperties: 'must test observedProperty Delete (with associated Units) -->" + error.message)
                                else {
                                    var resultsUndeletedDeviceType = JSON.parse(body)
                                    response.statusCode.should.be.equal(200)
                                    resultsUndeletedDeviceType.should.have.property("name")
                                    resultsUndeletedDeviceType.should.have.property("description")
                                }
                                done()
                            })
                        })
                    }
                })
            })
        })
    })

})