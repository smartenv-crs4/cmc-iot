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
var DeviceTypes = require('../../../DBEngineHandler/drivers/deviceTypeDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort + "/deviceTypes"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var DeviceType = require('../../../DBEngineHandler/models/deviceTypes').DeviceType
var deviceTypeDocuments = require('../../SetTestenv/createDeviceTypesDocuments')

var webUiToken
var deviceTypeId


describe('DeviceTypes API Test - [SEARCH FILTERS]', function() {

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
            if (err) consoleLogError.printErrorLog("DeviceType searchFilterTests.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("DeviceType searchFilterTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        deviceTypeDocuments.createDocuments(100, function(err, newDeviceTypeId) {
            if (err) consoleLogError.printErrorLog("DeviceType searchFilterTests.js - beforeEach - DeviceTypes.create ---> " + err)
            deviceTypeId = newDeviceTypeId
            done()
        })
    })


    afterEach(function(done) {
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType searchFilterTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to field selection: fields projection [name, description]', function(done) {
            request.get({
                url: APIURL + '?fields=name,description',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliance to field selection: fields projection [name, description]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('deviceTypes')
                    results._metadata.totalCount.should.be.equal(false)
                    results.deviceTypes.length.should.be.equal(conf.pagination.limit)
                    results.deviceTypes[0].should.have.properties("name")
                    results.deviceTypes[0].should.have.properties("description")
                    should(results.deviceTypes[0].observedPropertyId).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to field selection: fields projection must not include observedPropertyId [-observedPropertyId]', function(done) {

            request.get({
                url: APIURL + '?fields=-thingId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {

                if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliance to field selection: fields projection must not include observedPropertyId [-observedPropertyId]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('deviceTypes')
                    results._metadata.totalCount.should.be.equal(false)
                    results.deviceTypes.length.should.be.equal(conf.pagination.limit)
                    results.deviceTypes[0].should.have.properties("name")
                    results.deviceTypes[0].should.have.properties("description")
                    results.deviceTypes[0].should.have.properties("observedPropertyId")
                }
                done()
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to field selection: fields projection must not include observedPropertyId and name [-observedPropertyId -name]', function(done) {
            request.get({
                url: APIURL + '?fields=-observedPropertyId,-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliance to field selection: fields projection must not include observedPropertyId and name [-observedPropertyId -name]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('deviceTypes')
                    results._metadata.totalCount.should.be.equal(false)
                    results.deviceTypes.length.should.be.equal(conf.pagination.limit)
                    should(results.deviceTypes[0].name).be.eql(undefined)
                    results.deviceTypes[0].should.have.properties("description")
                    should(results.deviceTypes[0].observedPropertyId).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to filter by devices as array ---> deviceTypes=[_id1,_id2]', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var deviceTypes = [results.deviceTypes[0]._id, results.deviceTypes[1]._id]
                    request.get({
                        url: APIURL + '?deviceTypes=' + results.deviceTypes[0]._id + "&deviceTypes=" + results.deviceTypes[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {

                        if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliance to filter by deviceTypes as array deviceTypes=[_id1,_id2]' -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(2)
                            deviceTypes.should.containEql(DeviceTypes.ObjectId(results.deviceTypes[0]._id))
                            deviceTypes.should.containEql(DeviceTypes.ObjectId(results.deviceTypes[1]._id))
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to filter by deviceTypes as comma separated elements of a list ---> deviceTypes="_id1, _id2"', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var deviceTypes = results.deviceTypes[0]._id + "," + results.deviceTypes[1]._id
                    request.get({
                        url: APIURL + '?deviceTypes=' + deviceTypes,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliance to filter by deviceTypes as comma separated elements of a list ---> deviceTypes='_id1, _id2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(2)
                            deviceTypes.should.containEql(results.deviceTypes[0]._id)
                            deviceTypes.should.containEql(results.deviceTypes[1]._id)
                            deviceTypes.indexOf(results.deviceTypes[0]._id).should.be.greaterThanOrEqual(0)
                            deviceTypes.indexOf(results.deviceTypes[1]._id).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to filter by single value ---> deviceTypes="_id"', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var deviceTypes = results.deviceTypes[0]._id
                    request.get({
                        url: APIURL + '?deviceTypes=' + deviceTypes,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliance to filter by single value ---> deviceTypes='_id'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(1)
                            DeviceTypes.ObjectId(results.deviceTypes[0]._id).should.be.eql(deviceTypes)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to filter by field as comma separated elements of a list ---> name="name1,name2"', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = results.deviceTypes[0].name + "," + results.deviceTypes[1].name
                    request.get({
                        url: APIURL + '?name=' + name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {

                        if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliant to filter by field as comma separated elements of a list -- name='name1,name2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(2)
                            name.indexOf(results.deviceTypes[0].name).should.be.greaterThanOrEqual(0)
                            name.indexOf(results.deviceTypes[1].name).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to filter by multiple field as array or list of comma separated elements ---> name=["name1","name2"]description="desc1,desc2]', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = [results.deviceTypes[0].name, results.deviceTypes[1].name]
                    var description = results.deviceTypes[0].description + "," + results.deviceTypes[1].description
                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description=" + description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test API compliant to filter by multiple field as array or list of comma separated elements --- name=['name1','name2'] description='desc1,desc2]'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(2)
                            results.deviceTypes[0].name.should.be.equalOneOf([results.deviceTypes[0].name, results.deviceTypes[1].name])
                            results.deviceTypes[1].name.should.be.equalOneOf([results.deviceTypes[0].name, results.deviceTypes[1].name])
                            description.indexOf(results.deviceTypes[0].description).should.be.greaterThanOrEqual(0)
                            description.indexOf(results.deviceTypes[1].description).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test results order - descending', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /deviceTypes: 'must test results order - descending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(50)
                            results.deviceTypes[0].name.should.be.greaterThan(results.deviceTypes[1].name)
                            results.deviceTypes[1].name.should.be.greaterThan(results.deviceTypes[2].name)
                            results.deviceTypes[2].name.should.be.greaterThan(results.deviceTypes[3].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test results order - ascending', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /devicesType: 'must test results order - ascending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(50)
                            results.deviceTypes[3].name.should.be.greaterThan(results.deviceTypes[2].name)
                            results.deviceTypes[2].name.should.be.greaterThan(results.deviceTypes[1].name)
                            results.deviceTypes[1].name.should.be.greaterThan(results.deviceTypes[0].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /deviceTypes', function() {
        it('must test API compliance to field selection ---> fields="field1, field"', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var deviceTypes = results.deviceTypes[0]._id + "," + results.deviceTypes[1]._id
                    request.get({
                        url: APIURL + '?deviceTypes=' + deviceTypes + "&fields=name,observedPropertyId",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /devicesType: 'must test API compliance to field selection ---> fields=\"field1, field\"'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('deviceTypes')
                            results._metadata.totalCount.should.be.equal(false)
                            results.deviceTypes.length.should.be.equal(2)
                            deviceTypes.should.containEql(results.deviceTypes[0]._id)
                            deviceTypes.should.containEql(results.deviceTypes[1]._id)
                            deviceTypes.indexOf(results.deviceTypes[0]._id).should.be.greaterThanOrEqual(0)
                            deviceTypes.indexOf(results.deviceTypes[1]._id).should.be.greaterThanOrEqual(0)
                            results.deviceTypes[0].should.have.properties(["name", "observedPropertyId"])
                            results.deviceTypes[0].should.not.have.properties(["description"])
                        }
                        done()
                    })
                }
            })
        })
    })

})
