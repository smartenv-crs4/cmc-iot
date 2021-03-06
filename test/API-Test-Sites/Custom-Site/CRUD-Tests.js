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
var Thing = require('../../../DBEngineHandler/drivers/thingDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/sites"
var APIURL_things = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/things"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var siteDocuments = require('../../SetTestenv/createSitesDocuments')
var should=require("should");

var webUiToken
var siteId


describe('Sites API Test - [GENERAL TESTS]', function() {

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
            if (err) consoleLogError.printErrorLog("Site generalTest.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Site generalTest.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        siteDocuments.createDocuments(100, function(err, ForeignKeys) {
            if (err) consoleLogError.printErrorLog("Site generalTest.js - beforeEach - Sites.create ---> " + err)
            siteId = ForeignKeys.siteId
            done()
        })
    })


    afterEach(function(done) {
        siteDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("Site generalTest.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    /******************************************************************************************************************
     ************************************************** CREATE TESTS **************************************************
     ***************************************************************************************************************** */

    describe('POST /sites', function() {
        it('must test site creation [create Site]', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /sites: 'must test Site creation [create Site] -->" + error.message)
                else {
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }
                done()
            })
        })
    })


    /******************************************************************************************************************
     ********************************************* READ TESTS (Get By ID)**********************************************
     ***************************************************************************************************************** */

    describe('GET /sites/:id', function() {
        it('must test get site by Id', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Site
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /sites/:id :'must test get Site by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }
                var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.get(geByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("GET /site/:id :'must test get Site by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('description')
                        resultsById.should.have.property('location')
                        resultsById.location.should.have.property('type')
                        resultsById.location.should.have.property('coordinates')
                        resultsById.should.have.property('locatedInSiteId')
                        resultsById._id.should.be.eql(results._id)
                    }
                    done()
                })
            })
        })
    })


    describe('GET /sites/:id', function() {
        it('must test get site by Id (no Results)', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Site
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("GET /sites/:id :must test get site by Id (no Results)-->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }

                Sites.findByIdAndRemove(results._id, function(err, deletedSite) {
                    should(err).be.null()
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("GET /sites/:id :must test get site by Id (no Results)-->" + error.message)
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

    describe('PUT /sites/:id', function() {
        it('must test update site by Id', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // Create Site
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("PUT /sites/:id :'must test update site by Id -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }
                var nameUpdated = "nameUpdated"
                bodyParam = JSON.stringify({site: {name: nameUpdated}, access_token: webUiToken})
                requestParams = {
                    url: APIURL + "/" + results._id,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                }
                request.put(requestParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("PUT /sites/:id :'must test update site by Id -->" + error.message)
                    else {
                        var resultsById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsById.should.have.property('name')
                        resultsById.should.have.property('description')
                        resultsById.should.have.property('location')
                        resultsById.location.should.have.property('type')
                        resultsById.location.should.have.property('coordinates')
                        resultsById.should.have.property('locatedInSiteId')
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

    describe('DELETE /sites', function() {
        it('must test site Delete (without associated entities)', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // create Site
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (without associated entities) -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }
                // DELETE Site
                var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                request.del(getByIdRequestUrl, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (without associated entities) -->" + error.message)
                    else {
                        var resultsDeleteById = JSON.parse(body)
                        response.statusCode.should.be.equal(200)
                        resultsDeleteById.should.have.property('name')
                        resultsDeleteById.should.have.property('description')
                        resultsDeleteById.should.have.property('location')
                        resultsDeleteById.location.should.have.property('type')
                        resultsDeleteById.location.should.have.property('coordinates')
                        resultsDeleteById.should.have.property('locatedInSiteId')
                        resultsDeleteById._id.should.be.eql(results._id)
                    }
                    //Search Site to confirm delete
                    var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                    request.get(geByIdRequestUrl, function(error, response, body) {
                        if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (without associated entities) -->" + error.message)
                        else {
                            response.statusCode.should.be.equal(204)
                        }
                        done()
                    })
                })
            })
        })
    })


    describe('DELETE /sites', function() {
        it('must test site Delete (with associated Things)', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // create Site
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (with associated Things) -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }
                // Now let's prepare the body for the associated Thing POST request
                var bodyThingParam = JSON.stringify({
                    thing: {
                        name: "name",
                        description: "description",
                        api: {url: "HTTP://127.0.0.1"},
                        ownerId: Thing.ObjectId(),
                        vendorId: Thing.ObjectId(),
                        siteId: results._id
                    }
                })
                var requestThingParams = {
                    url: APIURL_things,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.adminToken
                    },
                    body: bodyThingParam
                }
                // Create the associated Thing
                request.post(requestThingParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("POST /things: " + error.message)
                    else {
                        response.statusCode.should.be.equal(201)
                        // DELETE Site
                        var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                        request.del(getByIdRequestUrl, function(error, response, body) {
                            if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (with associated Things) -->" + error.message)
                            else {
                                var resultsDeleteById = JSON.parse(body)
                                response.statusCode.should.be.equal(409) //HTTP Conflict
                                resultsDeleteById.should.have.property("message")
                                resultsDeleteById.message.should.be.equal("Cannot delete the Site due to associated Thing(s)")
                            }
                            //Search Site to confirm that the it hasn't been deleted
                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                            request.get(geByIdRequestUrl, function(error, response, body) {
                                if (error){
                                    consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (with associated Things) -->" + error.message)
                                    throw (error);
                                }
                                else {
                                    var resultsUndeletedSite = JSON.parse(body)
                                    response.statusCode.should.be.equal(200)
                                    resultsUndeletedSite.should.have.property("name")
                                    resultsUndeletedSite.should.have.property("description")
                                    resultsUndeletedSite.should.have.property('location')
                                    resultsUndeletedSite.location.should.have.property('type')
                                    resultsUndeletedSite.location.should.have.property('coordinates')
                                    resultsUndeletedSite.should.have.property('locatedInSiteId')
                                    Thing.deleteMany({},function(err){
                                        should(err).be.null();
                                        done();
                                    });
                                }

                            })
                        })
                    }
                })
            })
        })
    })


    describe('DELETE /sites', function() {
        it('must test site Delete (with associated Sites)', function(done) {
            var bodyParam = JSON.stringify({
                site: {
                    name: "name",
                    description: "description",
                    location: {type: "Point", coordinates: [1, 1]},
                    locatedInSiteId: siteId
                }
            })
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            // create Site
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (with associated Sites) -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                    results.should.have.property('location')
                    results.location.should.have.property('type')
                    results.location.should.have.property('coordinates')
                    results.should.have.property('locatedInSiteId')
                }
                // Now let's prepare the body for the associated Site POST request
                var bodySiteParam = JSON.stringify({
                    site: {
                        name: "name",
                        description: "description",
                        location: {type: "Point", coordinates: [1, 1]},
                        locatedInSiteId: results._id
                    }
                })
                var requestSiteParams = {
                    url: APIURL,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.adminToken
                    },
                    body: bodySiteParam
                }
                // Create the associated Site
                request.post(requestSiteParams, function(error, response, body) {
                    if (error) consoleLogError.printErrorLog("POST /site: " + error.message)
                    else {
                        response.statusCode.should.be.equal(201)
                        // DELETE Site
                        var getByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                        request.del(getByIdRequestUrl, function(error, response, body) {
                            if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (with associated Sites) -->" + error.message)
                            else {
                                var resultsDeleteById = JSON.parse(body)
                                response.statusCode.should.be.equal(409) //HTTP Conflict
                                resultsDeleteById.should.have.property("message")
                                resultsDeleteById.message.should.be.equal("Cannot delete the Site due to associated Site(s)")
                            }
                            //Search Site to confirm that the it hasn't been deleted
                            var geByIdRequestUrl = APIURL + "/" + results._id + "?access_token=" + webUiToken
                            request.get(geByIdRequestUrl, function(error, response, body) {
                                if (error) consoleLogError.printErrorLog("DELETE /sites: 'must test Site Delete (with associated Sites) -->" + error.message)
                                else {
                                    var resultsUndeletedSite = JSON.parse(body)
                                    response.statusCode.should.be.equal(200)
                                    resultsUndeletedSite.should.have.property("name")
                                    resultsUndeletedSite.should.have.property("description")
                                    resultsUndeletedSite.should.have.property("description")
                                    resultsUndeletedSite.should.have.property('location')
                                    resultsUndeletedSite.location.should.have.property('type')
                                    resultsUndeletedSite.location.should.have.property('coordinates')
                                    resultsUndeletedSite.should.have.property('locatedInSiteId')
                                }
                                done()
                            })
                        })
                    }
                })
            })
        })
    })

})
