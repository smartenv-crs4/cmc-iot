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
var ApiActionsDriver = require('../../../DBEngineHandler/drivers/apiActionDriver');
var DomainDriver = require('../../../DBEngineHandler/drivers/domainDriver');
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/deviceTypes"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var deviceTypeDocuments = require('../../SetTestenv/createDeviceTypesDocuments');
var domainsDocuments = require('../../SetTestenv/createDomainsDocuments');
var apiActionsDocuments = require('../../SetTestenv/createApiActionsDocuments');
var should=require('should');

var webUiToken
var deviceTypeId


describe('DeviceTypes API Test - [CRUD-TESTS]', function() {

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
            var domainsID=[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()];
            var bodyParam = JSON.stringify({
                deviceType: {
                    name: "name",
                    description: "description",
                    observedPropertyId: DeviceTypes.ObjectId()
                },
                domains:domainsID
            });
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            };
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /deviceType: 'must test deviceType creation [create DeviceType] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('observedPropertyId');

                    DeviceTypesDomainsDriver.findAll({deviceTypeId:results._id},null,null,function(error,devicetypeDomainItems){
                        if (error) consoleLogError.printErrorLog("POST /deviceType: 'must test deviceType creation [create DeviceType] -->" + error.message);
                        else{
                            devicetypeDomainItems.deviceType_domains.length.should.be.eql(2);
                            domainsID.should.containEql(devicetypeDomainItems.deviceType_domains[0].domainId);
                            done();
                        }
                    });
                }
            })
        })
    });


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
                },
                domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]
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
                },
                domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]
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
                },
                domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]
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
                },
                domains:[DeviceTypesDomainsDriver.ObjectId(),DeviceTypesDomainsDriver.ObjectId()]
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
    });


    describe('DELETE /deviceType', function() {
        it('must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations]', function(done) {


            // Create Api Action
            apiActionsDocuments.createDocuments(1,function(error,apiActionsId,associatedDeviceTypeId){
                if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                else {
                    // Create Domain
                    domainsDocuments.createDocuments(1,function(error,domainId){
                        if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                        else {
                            // Create deviceType_domain
                            DeviceTypesDomainsDriver.create({deviceTypeId:associatedDeviceTypeId,domainId:domainId},function(error,deviceTypeDomainItem){
                                if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                else {
                                    deviceTypeDomainItem.should.not.be.eql(null);
                                    deviceTypeDomainItem.should.have.properties(["deviceTypeId","domainId"]);
                                    deviceTypeDomainItem.domainId.should.be.eql(domainId);
                                    deviceTypeDomainItem.deviceTypeId.should.be.eql(associatedDeviceTypeId);

                                    ApiActionsDriver.findAll({deviceTypeId:associatedDeviceTypeId},null,null,function(error,apiActions){
                                        if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                        else {
                                            apiActions.should.have.property("apiActions");
                                            apiActions.apiActions.length.should.be.eql(1);
                                            apiActions.apiActions[0].deviceTypeId.should.be.eql(associatedDeviceTypeId);
                                            DeviceTypesDomainsDriver.findAll({deviceTypeId:associatedDeviceTypeId},null,null,function(error,deviceTypeDomainItems){
                                                if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                else {
                                                    deviceTypeDomainItems.should.have.property("deviceType_domains");
                                                    deviceTypeDomainItems.deviceType_domains.length.should.be.eql(1);
                                                    deviceTypeDomainItems.deviceType_domains[0].deviceTypeId.should.be.eql(associatedDeviceTypeId);
                                                    DeviceTypes.findAll({_id:associatedDeviceTypeId},null,null,function(error,apiActions){
                                                        if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                        else {
                                                            apiActions.should.have.property("deviceTypes");
                                                            apiActions.deviceTypes.length.should.be.eql(1);
                                                            apiActions.deviceTypes[0]._id.should.be.eql(associatedDeviceTypeId);

                                                            // DELETE DeviceType
                                                            var getByIdRequestUrl = APIURL + "/" + associatedDeviceTypeId + "?access_token=" + webUiToken
                                                            request.del(getByIdRequestUrl, function(error, response, body) {
                                                                if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                                else {
                                                                    var resultsDeleteById = JSON.parse(body);
                                                                    response.statusCode.should.be.equal(200);
                                                                    resultsDeleteById.should.have.property('name');
                                                                    resultsDeleteById.should.have.property('description');
                                                                    resultsDeleteById.should.have.property('observedPropertyId');
                                                                    DeviceTypes.ObjectId(resultsDeleteById._id).should.be.eql(associatedDeviceTypeId);
                                                                }
                                                                //Search DeviceType to confirm delete
                                                                var geByIdRequestUrl = APIURL + "/" + associatedDeviceTypeId + "?access_token=" + webUiToken
                                                                request.get(geByIdRequestUrl, function(error, response, body) {
                                                                    if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                                    else {
                                                                        response.statusCode.should.be.equal(204);
                                                                        ApiActionsDriver.findAll({deviceTypeId:associatedDeviceTypeId},null,null,function(error,apiActions){
                                                                            if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                                            else {
                                                                                apiActions.should.have.property("apiActions");
                                                                                apiActions.apiActions.length.should.be.eql(0);
                                                                                DeviceTypesDomainsDriver.findAll({deviceTypeId:associatedDeviceTypeId},null,null,function(error,deviceTypeDomainItems){
                                                                                    if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                                                    else {
                                                                                        deviceTypeDomainItems.should.have.property("deviceType_domains");
                                                                                        deviceTypeDomainItems.deviceType_domains.length.should.be.eql(0);
                                                                                        DeviceTypes.findAll({_id:associatedDeviceTypeId},null,null,function(error,apiActions){
                                                                                            if (error) consoleLogError.printErrorLog("DELETE /deviceType: 'must test deviceType Delete [delete associated apiActions and deviceTypeDomain associations -->" + error.message)
                                                                                            else {
                                                                                                apiActions.should.have.property("deviceTypes");
                                                                                                apiActions.deviceTypes.length.should.be.eql(0);
                                                                                                apiActionsDocuments.deleteDocuments(function(err){
                                                                                                   domainsDocuments.deleteDocuments(function(err){
                                                                                                       done();
                                                                                                   }) ;
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        })
    })
});
