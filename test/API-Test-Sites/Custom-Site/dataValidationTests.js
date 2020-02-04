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


var Sites = require('../../../DBEngineHandler/drivers/siteDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/sites"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var siteDocuments = require('../../SetTestenv/createSitesDocuments')
var should = require('should/should');

var webUiToken

describe('Sites API Test - [DATA VALIDATION]', function () {

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
        Sites.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        siteDocuments.createDocuments(100, function(err) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Sites.create ---> " + err)
            done()
        })
    })


    afterEach(function(done) {
        siteDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [no valid site field - field is not in the schema]', function(done) {
            var bodyParam = JSON.stringify({site: {noschemaField: "invalid"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [no valid site field - field is not in the schema] -->" + error.message)
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


    describe('POST /sites', function() {
        it('must test site creation [data validation error due to required fields missing]', function(done) {
            var bodyParam = JSON.stringify({site: {name: "name", location: {type: "Point", coordinates: [1,1]}}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due to required fields missing] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("site validation failed: description: Path `description` is required.")
                }
                done()
            })
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [data validation error due to invalid field locatedInSiteId]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1,1]},
                    locatedInSiteId: "locatedInSiteId"
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due to invalid field locatedInSiteId] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("site validation failed: locatedInSiteId: Cast to ObjectID failed for value \"locatedInSiteId\" at path \"locatedInSiteId\"")
                }
                done()
            })
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [data validation error due coordinates not in range]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [500,500]}
                }
            });
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due coordinates not in range] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("Invalid location coordinates: longitude must be in range [-180,180]")
                }
                done()
            })
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [data validation error due coordinates not in range for latitude]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [120,500]}
                }
            });
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due coordinates not in range for latitude] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("Invalid location coordinates: latitude must be in range [-90,90]")
                }
                done()
            })
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [data validation error due not coordinates field in location]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point"}
                }
            });
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due not coordinates field in location] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("Invalid location field values: coordinates:[longitude,latitude] and type:\"Point\" must be set")
                }
                done()
            })
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [data validation error due not type field in location]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {coordinates: [0,0]},
                }
            });
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due not type field in location] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("Invalid location field values: coordinates:[longitude,latitude] and type:\"Point\" must be set")
                }
                done()
            })
        })
    })


    describe('POST /sites', function() {
        it('must test site creation [data validation error due to both location and locatedInSite not set]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description"
                }
            });
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test site creation [data validation error due to both location and locatedInSite not set] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(400)
                    results.should.have.property('statusCode')
                    results.should.have.property('error')
                    results.should.have.property('message')
                    results.message.should.be.equal("One between location or locatedInSiteId field must be set")
                }
                done()
            })
        })
    })


})
