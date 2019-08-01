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


var Units = require('../../../DBEngineHandler/drivers/unitDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/units"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var unitDocuments = require('../../SetTestenv/createUnitsDocuments')

var webUiToken
var unitId


describe('Units API Test - [GENERAL TESTS]', function() {

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
        Units.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Unit CRUD-Tests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Unit generalTest.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        unitDocuments.createDocuments(100, function(err, newUnitId) {
            if (err) consoleLogError.printErrorLog("Unit generalTest.js - beforeEach - Units.create ---> " + err)
            unitId = newUnitId
            done()
        })
    })


    afterEach(function(done) {
        Units.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Unit generalTest.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */

    describe('POST /units', function() {
        it('must test unit creation [create Unit]', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: Units.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /unit: 'must test unit creation [create Unit] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('symbol')
                    results.should.have.property('minValue')
                    results.should.have.property('maxValue')
                    results.should.have.property('observedPropertyId')
                }
                done()
            })
        })
    })


    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /units/:id', function() {
        it('must test get unit by Id', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: Units.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Unit
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /unit/:id :'must test get unit by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('symbol')
                    results.should.have.property('minValue')
                    results.should.have.property('maxValue')
                    results.should.have.property('observedPropertyId')
                }
                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.get(geByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("GET /unit/:id :'must test get unit by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('symbol')
                        resultsById.should.have.property('minValue')
                        resultsById.should.have.property('maxValue')
                        resultsById.should.have.property('observedPropertyId')
                        resultsById._id.should.be.eql(results._id)
                    }
                    done()
                })
            })
        })
    })


    describe('GET /units/:id', function() {
        it('must test get unit by Id (no Results)', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: Units.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Unit
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /unit/:id :must test get unit by Id (no Results)-->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('symbol')
                    results.should.have.property('minValue')
                    results.should.have.property('maxValue')
                    results.should.have.property('observedPropertyId')
                }

                Units.findByIdAndRemove(results._id, function(err, deletedUnit) {
                    should(err).be.null()
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /unit/:id :must test get unit by Id (no Results)-->" + error.message)
                        else {
                            response.statusCode.should.be.equal(204)
                        }
                        done()
                    })
                })
            })
        })
    })


    /******************************************************************************************************************
     ********************************************* UPDATE TESTS (PUT))**********************************************
     ***************************************************************************************************************** */

    describe('PUT /units/:id', function() {
        it('must test update unit by Id', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: Units.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Unit
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("PUT /unit/:id :'must test update unit by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('symbol')
                    results.should.have.property('minValue')
                    results.should.have.property('maxValue')
                    results.should.have.property('observedPropertyId')
                }
                var nameUpdated = "nameUpdated"
                bodyParam = JSON.stringify({unit: {name: nameUpdated}, access_token: webUiToken})
                requestParams = {
                    url: APIURL + "/" + results._id,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                }
                request.put(requestParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("PUT /unit/:id :'must test update unit by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('symbol')
                        resultsById.should.have.property('minValue')
                        resultsById.should.have.property('maxValue')
                        resultsById.should.have.property('observedPropertyId')
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

    describe('DELETE /units', function() {
        it('must test unit Delete', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: Units.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // create Unit
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /unit: 'must test unit Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('symbol')
                    results.should.have.property('minValue')
                    results.should.have.property('maxValue')
                    results.should.have.property('observedPropertyId')
                }
                // DELETE Unit
                var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.del(getByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("DELETE /unit: 'must test unit Delete -->" + error.message)
                    else {
                        var resultsDeleteById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsDeleteById.should.have.property('name')
                        resultsDeleteById.should.have.property('symbol')
                        resultsDeleteById.should.have.property('minValue')
                        resultsDeleteById.should.have.property('maxValue')
                        resultsDeleteById.should.have.property('observedPropertyId')
                        resultsDeleteById._id.should.be.eql(results._id)
                    }
                    //Search Unit to confirm delete
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("DELETE /unit: 'must test unit Delete -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(204)
                        }
                        done()
                    })
                })
            })
        })
    })

})
