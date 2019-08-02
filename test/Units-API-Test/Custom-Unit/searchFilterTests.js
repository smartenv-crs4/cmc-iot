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
var Units = require('../../../DBEngineHandler/drivers/unitDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" +  conf.microserviceConf.port  + "/units"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var Unit = require('../../../DBEngineHandler/models/units').Unit
var unitDocuments = require('../../SetTestenv/createUnitsDocuments')

var webUiToken
var unitId


describe('Units API Test - [SEARCH FILTERS]', function() {

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
            if (err) consoleLogError.printErrorLog("Unit searchFilterTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Unit searchFilterTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        unitDocuments.createDocuments(100, function(err, newUnitId) {
            if (err) consoleLogError.printErrorLog("Unit searchFilterTests.js - beforeEach - Unit.create ---> " + err)
            unitId = newUnitId
            done()
        })
    })


    afterEach(function(done) {
        Units.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Unit searchFilterTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to field selection: fields projection [name, symbol]', function(done) {
            request.get({
                url: APIURL + '?fields=name,symbol',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to field selection: fields projection [name, symbol]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('units')
                    results._metadata.totalCount.should.be.equal(false)
                    results.units.length.should.be.equal(conf.pagination.limit)
                    results.units[0].should.have.properties("name")
                    results.units[0].should.have.properties("symbol")
                    should(results.units[0].minValue).be.eql(undefined)
                    should(results.units[0].maxValue).be.eql(undefined)
                    should(results.units[0].observedPropertyId).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to field selection: fields projection must not include observedPropertyId [-observedPropertyId]', function(done) {
            request.get({
                url: APIURL + '?fields=-thingId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to field selection: fields projection must not include observedPropertyId [-observedPropertyId]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('units')
                    results._metadata.totalCount.should.be.equal(false)
                    results.units.length.should.be.equal(conf.pagination.limit)
                    results.units[0].should.have.properties("name")
                    results.units[0].should.have.properties("symbol")
                    results.units[0].should.have.properties("minValue")
                    results.units[0].should.have.properties("maxValue")
                    results.units[0].should.have.properties("observedPropertyId")
                }
                done()
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to field selection: fields projection must not include observedPropertyId and name [-observedPropertyId -name]', function(done) {
            request.get({
                url: APIURL + '?fields=-observedPropertyId,-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to field selection: fields projection must not include observedPropertyId and name [-observedPropertyId -name]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('units')
                    results._metadata.totalCount.should.be.equal(false)
                    results.units.length.should.be.equal(conf.pagination.limit)
                    should(results.units[0].name).be.eql(undefined)
                    results.units[0].should.have.properties("symbol")
                    results.units[0].should.have.properties("minValue")
                    results.units[0].should.have.properties("maxValue")
                    should(results.units[0].observedPropertyId).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to filter by units as array ---> units=[_id1,_id2]', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var units = [results.units[0]._id, results.units[1]._id]
                    request.get({
                        url: APIURL + '?units=' + results.units[0]._id + "&units=" + results.units[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to filter by units as array units=[_id1,_id2]' -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(2)
                            units.should.containEql(Units.ObjectId(results.units[0]._id))
                            units.should.containEql(Units.ObjectId(results.units[1]._id))
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to filter by units as comma separated elements of a list ---> units="_id1, _id2"', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var units = results.units[0]._id + "," + results.units[1]._id
                    request.get({
                        url: APIURL + '?units=' + units,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to filter by units as comma separated elements of a list ---> units='_id1, _id2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(2)
                            units.should.containEql(results.units[0]._id)
                            units.should.containEql(results.units[1]._id)
                            units.indexOf(results.units[0]._id).should.be.greaterThanOrEqual(0)
                            units.indexOf(results.units[1]._id).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to filter by single value ---> units="_id"', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var units = results.units[0]._id
                    request.get({
                        url: APIURL + '?units=' + units,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to filter by single value ---> units='_id' -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(1)
                            Units.ObjectId(results.units[0]._id).should.be.eql(units)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to filter by field as comma separated elements of a list ---> name="name1,name2"', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = results.units[0].name + "," + results.units[1].name
                    request.get({
                        url: APIURL + '?name=' + name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {

                        if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliant to filter by field as comma separated elements of a list -- name='name1,name2' -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(2)
                            name.indexOf(results.units[0].name).should.be.greaterThanOrEqual(0)
                            name.indexOf(results.units[1].name).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to filter by multiple field as array or list of comma separated elements ---> name=["name1","name2"], symbol=["sym1","sym2]', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = [results.units[0].name, results.units[1].name]
                    var symbol = results.units[0].symbol + "," + results.units[1].symbol
                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&symbol=" + symbol,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliant to filter by multiple field as array or list of comma separated elements --- name=['name1','name2'] symbol=['sym1','sym2']]'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(2)
                            results.units[0].name.should.be.equalOneOf([results.units[0].name, results.units[1].name])
                            results.units[1].name.should.be.equalOneOf([results.units[0].name, results.units[1].name])
                            symbol.indexOf(results.units[0].symbol).should.be.greaterThanOrEqual(0)
                            symbol.indexOf(results.units[1].symbol).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test results order - descending', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortDesc=name,symbol',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test results order - descending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(50)
                            results.units[0].name.should.be.greaterThan(results.units[1].name)
                            results.units[1].name.should.be.greaterThan(results.units[2].name)
                            results.units[2].name.should.be.greaterThan(results.units[3].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test results order - ascending', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortAsc=name,symbol',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test results order - ascending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(50)
                            results.units[3].name.should.be.greaterThan(results.units[2].name)
                            results.units[2].name.should.be.greaterThan(results.units[1].name)
                            results.units[1].name.should.be.greaterThan(results.units[0].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /units', function() {
        it('must test API compliance to field selection ---> fields="field1, field2"', function(done) {
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var units = results.units[0]._id + "," + results.units[1]._id
                    request.get({
                        url: APIURL + '?units=' + units + "&fields=name,observedPropertyId",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /units: 'must test API compliance to field selection ---> fields=\"field1, field2\"'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('units')
                            results._metadata.totalCount.should.be.equal(false)
                            results.units.length.should.be.equal(2)
                            units.should.containEql(results.units[0]._id)
                            units.should.containEql(results.units[1]._id)
                            units.indexOf(results.units[0]._id).should.be.greaterThanOrEqual(0)
                            units.indexOf(results.units[1]._id).should.be.greaterThanOrEqual(0)
                            results.units[0].should.have.properties(["name", "observedPropertyId"])
                            results.units[0].should.not.have.properties(["symbol"])
                            results.units[0].should.not.have.properties(["minValue"])
                            results.units[0].should.not.have.properties(["maxValue"])
                        }
                        done()
                    })
                }
            })
        })
    })

})
