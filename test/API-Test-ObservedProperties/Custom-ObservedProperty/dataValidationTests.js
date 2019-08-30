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


var should = require('should/should')
var _ = require('underscore')._
var async = require('async')
var ObservedProperties = require('../../../DBEngineHandler/drivers/observedPropertyDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/observedProperties"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')

var webUiToken
var observedPropertyId


describe('ObservedProperties API Test - [DATA VALIDATION]', function() {

    before(function(done) {
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })

    after(function(done) {
        ObservedProperties.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        var range = _.range(100)
        async.each(range, function(e, cb) {
            ObservedProperties.create({
                name: "name" + e,
                description: "description" + e
            }, function(err, newObservedProperty) {
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - ObservedProperties.create ---> " + err)
                if (e === 1) observedPropertyId = newObservedProperty._id
                cb()
            })
        }, function(err) {
            done()
        })
    })


    afterEach(function(done) {
        ObservedProperties.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('POST /observedProperties', function() {
        it('must test observedProperty creation [no valid observedProperty field - field is not in the schema]', function(done) {
            var bodyParam = JSON.stringify({observedProperty: {noschemaField: "invalid"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /observedProperty: 'must test observedProperty creation [no valid observedProperty field - field is not in the schema] -->" + error.message)
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


    describe('POST /observedProperties', function() {
        it('must test observedProperty creation [data validation error due to required fields missing]', function(done) {
            var bodyParam = JSON.stringify({observedProperty: {description: "description"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /observedProperty: 'must test observedProperty creation [data validation error due to required fields missing] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("observedProperty validation failed: name: Path `name` is required.")
                }
                done()
            })
        })
    })


})
