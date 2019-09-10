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


var DeviceTypes = require('../../../DBEngineHandler/drivers/deviceTypeDriver');
var DeviceTypesDomainsDriver = require('../../../DBEngineHandler/drivers/deviceType_domainDriver');
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/deviceTypes"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var deviceTypeDocuments = require('../../SetTestenv/createDeviceTypesDocuments')

var webUiToken

describe('DeviceTypes API Test - [DATA VALIDATION]', function () {

    before(function(done) {
        this.timeout(5000)
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        this.timeout(5000)
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        deviceTypeDocuments.createDocuments(100, function(err) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - DeviceTypes.create ---> " + err)
            done()
        })
    })


    afterEach(function(done) {
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('POST /deviceType', function() {
        it('must test deviceType creation [no valid deviceType field - field is not in the schema]', function(done) {
            var bodyParam = JSON.stringify({deviceType: {noschemaField: "invalid"},domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]});
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /deviceType: 'must test deviceType creation [no valid deviceType field - field is not in the schema] -->" + error.message)
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


    describe('POST /deviceType', function() {
        it('must test deviceType creation [data validation error due to required fields missing]', function(done) {
            var bodyParam = JSON.stringify({deviceType: {name: "name", description: "description"},domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /deviceType: 'must test deviceType creation [data validation error due to required fields missing] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("deviceType validation failed: observedPropertyId: Path `observedPropertyId` is required.")
                }
                done()
            })
        })
    })


    describe('POST /deviceType', function() {
        it('must test deviceType creation [data validation error due to invalid field observedPropertyId]', function(done) {
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: "observedPropertyId"
                },
                domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /deviceType: 'must test deviceType creation [data validation error due to invalid field observedPropertyId] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("deviceType validation failed: observedPropertyId: Cast to ObjectID failed for value \"observedPropertyId\" at path \"observedPropertyId\"")
                }
                done()
            })
        })
    })

})
