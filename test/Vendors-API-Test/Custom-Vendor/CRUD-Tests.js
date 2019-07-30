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
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort + "/vendors"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var vendorDocuments = require('../../SetTestenv/createVendorsDocuments')

var webUiToken
var vendorId


describe('Vendors API Test - [GENERAL TESTS]', function() {

    before(function(done) {
        this.timeout(0)
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })

    after(function(done) {
        this.timeout(0)
        Vendors.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor generalTesta.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
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

    describe('POST /vendor', function() {
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

    describe('GET /vendor/:id', function() {
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

    describe('PUT /vendor/:id', function() {
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

    describe('DELETE /vendor', function() {
        it('must test vendor Delete', function(done) {
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


})