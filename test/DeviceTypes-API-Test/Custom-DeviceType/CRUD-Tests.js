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


var DeviceTypes = require('../../../DBEngineHandler/drivers/deviceTypeDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort + "/deviceTypes"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var deviceTypeDocuments = require('../../SetTestenv/createDeviceTypesDocuments')

var webUiToken
var deviceTypeId


describe('DeviceTypes API Test - [GENERAL TESTS]', function() {

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
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType generalTest.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("DeviceType generalTest.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        deviceTypeDocuments.createDocuments(100, function(err, newDeviceTypeId) {
            if (err) consoleLogError.printErrorLog("DeviceType generalTest.js - beforeEach - DeviceTypes.create ---> " + err)
            deviceTypeId = newDeviceTypeId
            done()
        })
    })


    afterEach(function(done) {
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType generalTest.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */

    describe('POST /deviceType', function() {
        it('must test deviceType creation [create DeviceType]', function(done) {
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: DeviceTypes.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /deviceType: 'must test deviceType creation [create DeviceType] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('observedPropertyId')
                }
                done()
            })
        })
    })


    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /deviceType/:id', function() {
        it('must test get deviceType by Id', function(done) {
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: DeviceTypes.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create DeviceType
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /deviceType/:id :'must test get deviceType by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('observedPropertyId')
                }
                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.get(geByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("GET /deviceType/:id :'must test get deviceType by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('description')
                        resultsById.should.have.property('observedPropertyId')
                        resultsById._id.should.be.eql(results._id)
                    }
                    done()
                })
            })
        })
    })


    describe('GET /deviceType/:id', function() {
        it('must test get deviceType by Id (no Results)', function(done) {
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: DeviceTypes.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Device
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /deviceType/:id :must test get deviceType by Id (no Results)-->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('observedPropertyId')
                }

                DeviceTypes.findByIdAndRemove(results._id, function(err, deletedDeviceType) {
                    should(err).be.null()
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /deviceType/:id :must test get deviceType by Id (no Results)-->" + error.message)
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

    describe('PUT /deviceType/:id', function() {
        it('must test update deviceType by Id', function(done) {
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: DeviceTypes.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create DeviceType
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("PUT /deviceType/:id :'must test update deviceType by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('observedPropertyId')
                }
                var nameUpdated = "nameUpdated"
                bodyParam = JSON.stringify({deviceType: {name: nameUpdated}, access_token: webUiToken})
                requestParams = {
                    url: APIURL + "/" + results._id,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                }
                request.put(requestParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("PUT /deviceType/:id :'must test update deviceType by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('description')
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

    describe('DELETE /deviceType', function() {
        it('must test deviceType Delete', function(done) {
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: DeviceTypes.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // create DeviceType
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('observedPropertyId')
                }
                // DELETE DeviceType
                var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.del(getByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete -->" + error.message)
                    else {
                        var resultsDeleteById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsDeleteById.should.have.property('name')
                        resultsDeleteById.should.have.property('description')
                        resultsDeleteById.should.have.property('observedPropertyId')
                        resultsDeleteById._id.should.be.eql(results._id)
                    }
                    //Search DeviceType to confirm delete
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete -->" + error.message)
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
