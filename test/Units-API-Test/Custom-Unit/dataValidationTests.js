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
var APIURL = conf.testConfig.testUrl + ":" +  conf.microserviceConf.port  + "/units"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var unitDocuments = require('../../SetTestenv/createUnitsDocuments')

var webUiToken

describe('Units API Test - [DATA VALIDATION]', function () {

    before(function(done) {
        this.timeout(10000)
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        this.timeout(10000)
        Units.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        unitDocuments.createDocuments(100, function(err) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Units.create ---> " + err)
            done()
        })
    })


    afterEach(function(done) {
        Units.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('POST /unit', function() {
        it('must test unit creation [no valid unit field - field is not in the schema]', function(done) {
            var bodyParam = JSON.stringify({unit: {noschemaField: "invalid"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /unit: 'must test unit creation [no valid unit field - field is not in the schema] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("Field `noschemaField` is not in schema and strict mode is set to throw.")
                }
                done()
            })
        })
    })


    describe('POST /unit', function() {
        it('must test unit creation [data validation error due to required fields missing]', function(done) {
            var bodyParam = JSON.stringify({unit: {name: "name", symbol: "symbol", minValue: 1, maxValue: 100}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /unit: 'must test unit creation [data validation error due to required fields missing] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("unit validation failed: observedPropertyId: Path `observedPropertyId` is required.")
                }
                done()
            })
        })
    })


    describe('POST /unit', function() {
        it('must test unit creation [data validation error due to invalid field observedPropertyId]', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 100,
                    observedPropertyId: "observedPropertyId"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /unit: 'must test unit creation [data validation error due to invalid field observedPropertyId] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("unit validation failed: observedPropertyId: Cast to ObjectID failed for value \"observedPropertyId\" at path \"observedPropertyId\"")
                }
                done()
            })
        })
    })


    describe('POST /unit', function() {
        it('must test unit creation [data validation error due to not allowed numeric values for range (minValue-maxValue) fields]', function(done) {
            var bodyParam = JSON.stringify({
                unit: {
                    name: "name",
                    symbol: "symbol",
                    minValue: 100,
                    maxValue: 0,
                    observedPropertyId: Units.ObjectId()
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /unit: 'must test unit creation [data validation error due to not allowed numeric values for range (minValue-maxValue) fields] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("unit validation failed: range (minValue-maxValue) not allowed")
                }
                done()
            })
        })
    })

})
