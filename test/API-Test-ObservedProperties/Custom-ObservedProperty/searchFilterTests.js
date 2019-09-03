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
var ObservedProperties = require('../../../DBEngineHandler/drivers/observedPropertyDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/observedProperties"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var ObservedProperty = require('../../../DBEngineHandler/models/observedProperties').ObservedProperty
var vendorDocuments = require('../../SetTestenv/createObservedPropertiesDocuments')

var webUiToken
var vendorId


describe('ObservedProperties API Test - [SEARCH FILTERS]', function() {

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
            if (err) consoleLogError.printErrorLog("ObservedProperty searchFilterTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("ObservedProperty searchFilterTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        vendorDocuments.createDocuments(100, function(err, newObservedPropertyId) {
            if (err) consoleLogError.printErrorLog("ObservedProperty searchFilterTests.js - beforeEach - ObservedProperties.create ---> " + err)
            vendorId = newObservedPropertyId
            done()
        })
    })


    afterEach(function(done) {
        ObservedProperties.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("ObservedProperty searchFilterTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliance to field selection: fields projection [name]', function(done) {
            request.get({
                url: APIURL + '?fields=name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliance to field selection: fields projection [name]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('observedProperties')
                    results._metadata.totalCount.should.be.equal(false)
                    results.observedProperties.length.should.be.equal(conf.pagination.limit)
                    results.observedProperties[0].should.have.properties("name")
                    results.observedProperties[0].should.not.have.property("description")
                    should(results.observedProperties[0].description).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliance to field selection: fields projection must not include description [-description]', function(done) {
            request.get({
                url: APIURL + '?fields=-description',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliance to field selection: fields projection must not include description [-description]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('observedProperties')
                    results._metadata.totalCount.should.be.equal(false)
                    results.observedProperties.length.should.be.equal(conf.pagination.limit)
                    results.observedProperties[0].should.have.properties("name")
                    should(results.observedProperties[0].description).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliance to filter by observedProperties as array ---> observedProperties=[_id1,_id2]', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var observedProperties = [results.observedProperties[0]._id, results.observedProperties[1]._id]
                    request.get({
                        url: APIURL + '?observedProperties=' + results.observedProperties[0]._id + "&observedProperties=" + results.observedProperties[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliant to filter by observedProperties as array ---> observedProperties=[_id1,_id2]' -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(2)
                            observedProperties.should.containEql(ObservedProperties.ObjectId(results.observedProperties[0]._id))
                            observedProperties.should.containEql(ObservedProperties.ObjectId(results.observedProperties[1]._id))
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliance to filter by observedProperties as comma separated elements of a list  ---> observedProperties="_id1, _id2"', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var observedProperties = results.observedProperties[0]._id + "," + results.observedProperties[1]._id
                    request.get({
                        url: APIURL + '?observedProperties=' + observedProperties,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliance to filter by observedProperties as comma separated elements of a list ---> observedProperties='_id1, _id2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(2)
                            observedProperties.should.containEql(results.observedProperties[0]._id)
                            observedProperties.should.containEql(results.observedProperties[1]._id)
                            observedProperties.indexOf(results.observedProperties[0]._id).should.be.greaterThanOrEqual(0)
                            observedProperties.indexOf(results.observedProperties[1]._id).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliance to filter by single value  ---> observedProperties="_id"', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var observedProperties = results.observedProperties[0]._id
                    request.get({
                        url: APIURL + '?observedProperties=' + observedProperties,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliance to filter by single value  ---> observedProperties='_id'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(1)
                            ObservedProperties.ObjectId(results.observedProperties[0]._id).should.be.eql(observedProperties)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliant to filter by field as a list of comma separated elements ---> name="name1,name2"', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = results.observedProperties[0].name + "," + results.observedProperties[1].name
                    request.get({
                        url: APIURL + '?name=' + name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliance to filter by field as a list of comma separated elements -- name='name1,name2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(2)
                            name.indexOf(results.observedProperties[0].name).should.be.greaterThanOrEqual(0)
                            name.indexOf(results.observedProperties[1].name).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test API compliance to filter by multiple field as array or list of comma separated elements ---> name=["name1","name2"], description="desc1,desc2]', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = [results.observedProperties[0].name, results.observedProperties[1].name]
                    var description = results.observedProperties[0].description + "," + results.observedProperties[1].description
                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description=" + description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test API compliant to filter by multiple field as array or list of comma separated elements ---> name=['name1','name2'] description='desc1,desc2]'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(2)
                            results.observedProperties[0].name.should.be.equalOneOf([results.observedProperties[0].name, results.observedProperties[1].name])
                            results.observedProperties[1].name.should.be.equalOneOf([results.observedProperties[0].name, results.observedProperties[1].name])
                            description.indexOf(results.observedProperties[0].description).should.be.greaterThanOrEqual(0)
                            description.indexOf(results.observedProperties[1].description).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test results order - descending', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test results order - descending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(50)
                            results.observedProperties[0].name.should.be.greaterThan(results.observedProperties[1].name)
                            results.observedProperties[1].name.should.be.greaterThan(results.observedProperties[2].name)
                            results.observedProperties[2].name.should.be.greaterThan(results.observedProperties[3].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /observedProperties', function() {
        it('must test results order - ascending', function(done) {
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /observedProperties: 'must test results order - ascending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('observedProperties')
                            results._metadata.totalCount.should.be.equal(false)
                            results.observedProperties.length.should.be.equal(50)
                            results.observedProperties[3].name.should.be.greaterThan(results.observedProperties[2].name)
                            results.observedProperties[2].name.should.be.greaterThan(results.observedProperties[1].name)
                            results.observedProperties[1].name.should.be.greaterThan(results.observedProperties[0].name)
                        }
                        done()
                    })
                }
            })
        })
    })


})
