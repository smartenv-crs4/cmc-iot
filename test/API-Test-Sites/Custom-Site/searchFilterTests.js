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
var Sites = require('../../../DBEngineHandler/drivers/siteDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/sites"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var Site = require('../../../DBEngineHandler/models/sites').Site
var siteDocuments = require('../../SetTestenv/createSitesDocuments')

var webUiToken
var siteId


describe('Sites API Test - [SEARCH FILTERS]', function() {

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
        Sites.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Site searchFilterTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Site searchFilterTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        siteDocuments.createDocuments(100, function(err, newSiteId) {
            if (err) consoleLogError.printErrorLog("Site searchFilterTests.js - beforeEach - Sites.create ---> " + err)
            siteId = newSiteId
            done()
        })
    })


    afterEach(function(done) {
        Sites.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Site searchFilterTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to field selection: fields projection [name, description]', function(done) {
            request.get({
                url: APIURL + '?fields=name,description',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to field selection: fields projection [name, description]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('sites')
                    results._metadata.totalCount.should.be.equal(false)
                    results.sites.length.should.be.equal(conf.pagination.limit)
                    results.sites[0].should.have.properties("name")
                    results.sites[0].should.have.properties("description")
                    should(results.sites[0].location).be.eql(undefined)
                    should(results.sites[0].locatedInSiteId).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to field selection: fields projection must not include locatedInSiteId [-locatedInSiteId]', function(done) {

            request.get({
                url: APIURL + '?fields=-locatedInSiteId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {

                if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to field selection: fields projection must not include locatedInSiteId [-locatedInSiteId]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('sites')
                    results._metadata.totalCount.should.be.equal(false)
                    results.sites.length.should.be.equal(conf.pagination.limit)
                    results.sites[0].should.have.properties("name")
                    results.sites[0].should.have.properties("description")
                    results.sites[0].should.have.properties("location")
                }
                done()
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to field selection: fields projection must not include locatedInSiteId and name [-locatedInSiteId -name]', function(done) {
            request.get({
                url: APIURL + '?fields=-locatedInSiteId,-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to field selection: fields projection must not include locatedInSiteId and name [-locatedInSiteId -name]' -->" + error.message)
                else {
                    response.statusCode.should.be.equal(200)
                    var results = JSON.parse(body)
                    results.should.have.property('_metadata')
                    results.should.have.property('sites')
                    results._metadata.totalCount.should.be.equal(false)
                    results.sites.length.should.be.equal(conf.pagination.limit)
                    should(results.sites[0].name).be.eql(undefined)
                    results.sites[0].should.have.properties("description")
                    results.sites[0].should.have.properties("location")
                    should(results.sites[0].locatedInSiteId).be.eql(undefined)
                }
                done()
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to filter by sites as array ---> sites=[_id1,_id2]', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var sites = [results.sites[0]._id, results.sites[1]._id]
                    request.get({
                        url: APIURL + '?sites=' + results.sites[0]._id + "&sites=" + results.sites[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {

                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to filter by sites as array sites=[_id1,_id2]' -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(2)
                            sites.should.containEql(Sites.ObjectId(results.sites[0]._id))
                            sites.should.containEql(Sites.ObjectId(results.sites[1]._id))
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to filter by sites as comma separated elements of a list ---> sites="_id1, _id2"', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var sites = results.sites[0]._id + "," + results.sites[1]._id
                    request.get({
                        url: APIURL + '?sites=' + sites,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to filter by sites as comma separated elements of a list ---> sites='_id1, _id2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(2)
                            sites.should.containEql(results.sites[0]._id)
                            sites.should.containEql(results.sites[1]._id)
                            sites.indexOf(results.sites[0]._id).should.be.greaterThanOrEqual(0)
                            sites.indexOf(results.sites[1]._id).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to filter by single value ---> sites="_id"', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var sites = results.sites[0]._id
                    request.get({
                        url: APIURL + '?sites=' + sites,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to filter by single value ---> sites='_id'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(1)
                            Sites.ObjectId(results.sites[0]._id).should.be.eql(sites)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to filter by field as comma separated elements of a list ---> name="name1,name2"', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = results.sites[0].name + "," + results.sites[1].name
                    request.get({
                        url: APIURL + '?name=' + name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliant to filter by field as comma separated elements of a list -- name='name1,name2'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(2)
                            name.indexOf(results.sites[0].name).should.be.greaterThanOrEqual(0)
                            name.indexOf(results.sites[1].name).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to filter by multiple field as array or list of comma separated elements ---> name=["name1","name2"]description="desc1,desc2]', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var name = [results.sites[0].name, results.sites[1].name]
                    var description = results.sites[0].description + "," + results.sites[1].description
                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description=" + description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliant to filter by multiple field as array or list of comma separated elements --- name=['name1','name2'] description='desc1,desc2]'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(2)
                            results.sites[0].name.should.be.equalOneOf([results.sites[0].name, results.sites[1].name])
                            results.sites[1].name.should.be.equalOneOf([results.sites[0].name, results.sites[1].name])
                            description.indexOf(results.sites[0].description).should.be.greaterThanOrEqual(0)
                            description.indexOf(results.sites[1].description).should.be.greaterThanOrEqual(0)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test results order - descending', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test results order - descending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(50)
                            results.sites[0].name.should.be.greaterThan(results.sites[1].name)
                            results.sites[1].name.should.be.greaterThan(results.sites[2].name)
                            results.sites[2].name.should.be.greaterThan(results.sites[3].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test results order - ascending', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test results order - ascending'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(50)
                            results.sites[3].name.should.be.greaterThan(results.sites[2].name)
                            results.sites[2].name.should.be.greaterThan(results.sites[1].name)
                            results.sites[1].name.should.be.greaterThan(results.sites[0].name)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /sites', function() {
        it('must test API compliance to field selection ---> fields="field1, field"', function(done) {
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    var sites = results.sites[0]._id + "," + results.sites[1]._id
                    request.get({
                        url: APIURL + '?sites=' + sites + "&fields=name,location,locatedInSiteId",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites: 'must test API compliance to field selection ---> fields=\"field1, field\"'  -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(200)
                            var results = JSON.parse(body)
                            results.should.have.property('_metadata')
                            results.should.have.property('sites')
                            results._metadata.totalCount.should.be.equal(false)
                            results.sites.length.should.be.equal(2)
                            sites.should.containEql(results.sites[0]._id)
                            sites.should.containEql(results.sites[1]._id)
                            sites.indexOf(results.sites[0]._id).should.be.greaterThanOrEqual(0)
                            sites.indexOf(results.sites[1]._id).should.be.greaterThanOrEqual(0)
                            results.sites[0].should.have.properties(["name", "location", "locatedInSiteId"])
                            results.sites[0].should.not.have.property(["description"])
                        }
                        done()
                    })
                }
            })
        })
    })

})
