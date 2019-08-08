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


var Vendors = require('../../../DBEngineHandler/drivers/vendorDriver')
var Thing = require('../../../DBEngineHandler/drivers/thingDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/vendors"
var APIURL_things = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/things"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var vendorDocuments = require('../../SetTestenv/createVendorsDocuments')

var webUiToken
var vendorId


describe('Vendors API Test - [CRUD-TESTS]', function() {

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
        Vendors.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor CRUD-Tests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Vendor generalTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        vendorDocuments.createDocuments(100, function(err, newVendorId) {
            if (err) consoleLogError.printErrorLog("Vendor generalTests.js - beforeEach - Vendors.create ---> " + err)
            vendorId = newVendorId
            done()
        })
    })


    afterEach(function(done) {
        Vendors.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor generalTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */

    describe('POST /vendors', function() {
        it('must test vendor creation [create Vendor]', function(done) {
            var bodyParam = JSON.stringify({vendor: {name: "name", description: "description"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /vendor: 'must test vendor creation [create Vendor] -->" + error.message)
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

    describe('GET /vendors/:id', function() {
        it('must test get vendor by Id', function(done) {
            var bodyParam = JSON.stringify({
                vendor: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create vendor
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /vendor/:id :'must test get vendor by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.get(geByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("GET /vendor/:id :'must test get vendor by Id -->" + error.message)
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

    describe('PUT /vendors/:id', function() {
        it('must test update vendor by Id', function(done) {
            var bodyParam = JSON.stringify({
                vendor: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create vendor
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("PUT /vendor/:id :'must test update vendor by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                var nameUpdated = "nameUpdated"
                bodyParam = JSON.stringify({vendor: {name: nameUpdated}, access_token: webUiToken})
                requestParams = {
                    url: APIURL + "/" + results._id,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                }
                request.put(requestParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("PUT /vendor/:id :'must test update vendor by Id -->" + error.message)
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

    describe('DELETE /vendors', function() {
        it('must test vendor Delete (without associated Things)', function(done) {
            var bodyParam = JSON.stringify({
                vendor: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create vendor
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /vendor: 'must test vendor Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                // DELETE vendor
                var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.del(getByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("DELETE /vendor: 'must test vendor Delete -->" + error.message)
                    else {
                        var resultsDeleteById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsDeleteById.should.have.property('name')
                        resultsDeleteById.should.have.property('description')
                        resultsDeleteById._id.should.be.eql(results._id)
                    }
                    //Search vendor to confirm delete
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("DELETE /vendor: 'must test vendor vendor -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(204)
                        }
                        done()
                    })
                })
            })
        })
    })


    describe('DELETE /vendors', function() {
        it('must test vendor Delete (with associated Things)', function(done) {
            var bodyParam = JSON.stringify({
                vendor: {
                    name: "name",
                    description: "description"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create vendor
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /vendor: 'must test vendor Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                // Now let's prepare the body for the associated Thing POST request
                var bodyThingParam = JSON.stringify({
                    thing: {
                        name: "name",
                        description: "description",
                        api: {url: "HTTP://127.0.0.1"},
                        ownerId: Thing.ObjectId(),
                        vendorId: results._id,
                        siteId: Thing.ObjectId()
                    }
                })
                var requestThingParams = {
                    url: APIURL_things,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.adminToken
                    },
                    body: bodyThingParam
                }
                // Create the associated Thing
                request.post(requestThingParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("POST /thing: " + error.message)
                    else {
                        response.statusCode.should.be.equal(201)
                        // DELETE vendor
                        var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                        request.del(getByIdRequestUrl, function(error, response, body) {
                            if (error) consoleLogError.printErrorLog("DELETE /vendor: 'must test vendor Delete (with associated Things) -->" + error.message)
                            else {
                                var resultsDeleteById = JSON.parse(body)
                                response.statusCode.should.be.equal(409) //HTTP Conflict
                                resultsDeleteById.should.have.property("message")
                                resultsDeleteById.message.should.be.equal("Cannot delete the Vendor due to associated Thing(s)")
                            }
                            //Search vendor to confirm that the it hasn't been deleted
                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                            request.get(geByIdRequestUrl, function(error, response, body) {
                                if (error) consoleLogError.printErrorLog("DELETE /vendor: 'must test vendor Delete (with associated Things) -->" + error.message)
                                else {
                                    var resultsUndeletedVendor = JSON.parse(body)
                                    response.statusCode.should.be.equal(200)
                                    resultsUndeletedVendor.should.have.property("name")
                                    resultsUndeletedVendor.should.have.property("description")
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