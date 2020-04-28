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


var should = require('should/should');
var Sites = require('../../../../DBEngineHandler/drivers/siteDriver');
var Devices = require('../../../../DBEngineHandler/drivers/deviceDriver');
var disabledDevices = require('../../../../DBEngineHandler/drivers/disabledDeviceDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/sites";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var async = require('async');
var siteDocuments = require('../../../SetTestenv/createSitesDocuments');
var deviceDocuments = require('../../../SetTestenv/createDevicesDocuments');
var geoLatLon=require('../../../../routes/routesHandlers/handlerUtility/geoLatLon');
var async=require('async');

var webUiToken;
var siteId;


describe('Sites API Test - [ACTIONS TESTS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function (err) {
            if (err) throw (err);
            webUiToken = conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        this.timeout(0);
        Sites.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {


        siteDocuments.createDocuments(100, function (err, ForeignKeys) {
            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
            siteId = ForeignKeys.siteId;
            done();
        });
    });


    afterEach(function (done) {
        siteDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - afterEach - deleteMany ---> " + err);
            done()
        });
    });


    var testTypeMessage='POST /sites/actions/getLinkedSites';
    var testMessage;

    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites error due to no body';
        it(testMessage, function (done) {
            request.post({
                url: APIURL + '/actions/getLinkedSites',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body missing');

                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites error due to sites body field missing';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/getLinkedSites',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({skip: 0})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body fields \'sites\' missing or empty');

                }
                done();
            });
        });

    });



    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites error due to sites body field is not a valid array list but a number';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({sites:0});
            request.post({
                url: APIURL + '/actions/getLinkedSites',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('sites body field must be an array list of sites id');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites error due to sites body field is not a valid array list but a text';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/getLinkedSites',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({sites: "text"})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('sites body field must be an array list of sites id');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites error due to sql injection';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/getLinkedSites',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({sites: [{ "$in": siteId }]})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('mongoDb operator "$..." are not allowed in query filter');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get one site]';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/getLinkedSites',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({sites:[siteId]})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('linkedSites');
                    results.linkedSites.length.should.be.equal(1);
                    Sites.ObjectId(results.linkedSites[0]).should.be.eql(siteId);

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get two site]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, function (err, ForeignKeys) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);


                request.post({
                    url: APIURL + '/actions/getLinkedSites',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({sites:[siteId,ForeignKeys.siteId]})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property('linkedSites');
                        results.linkedSites.length.should.be.equal(2);
                        results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                        results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.greaterThanOrEqual(0);
                    }
                    done();
                });

            });


        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get two nested site]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, ForeignKeys) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);


                request.post({
                    url: APIURL + '/actions/getLinkedSites',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({sites:[siteId]})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property('linkedSites');
                        results.linkedSites.length.should.be.equal(2);
                        results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                        results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.greaterThanOrEqual(0);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get two nested site, one single]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, ForeignKeysNested) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                    request.post({
                        url: APIURL + '/actions/getLinkedSites',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        body: JSON.stringify({sites:[siteId,ForeignKeys.siteId]})
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('linkedSites');
                            results.linkedSites.length.should.be.equal(3);
                            results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                            results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.greaterThanOrEqual(0);
                            results.linkedSites.indexOf(ForeignKeysNested.siteId.toString()).should.be.greaterThanOrEqual(0);
                        }
                        done();
                    });

                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get two nested site, other two nested]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, ForeignKeysNested) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                    siteDocuments.createDocuments(1,ForeignKeys.siteId, function (err, ForeignKeysBis) {
                        if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                        request.post({
                            url: APIURL + '/actions/getLinkedSites',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({sites:[siteId,ForeignKeys.siteId]})
                        }, function (error, response, body) {

                            if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('linkedSites');
                                results.linkedSites.length.should.be.equal(4);
                                results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeysNested.siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeysBis.siteId.toString()).should.be.greaterThanOrEqual(0);
                            }
                            done();
                        });
                    });
                });
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[search twice same value]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, ForeignKeysNested) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                    siteDocuments.createDocuments(1,ForeignKeys.siteId, function (err, ForeignKeysBis) {
                        if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                        request.post({
                            url: APIURL + '/actions/getLinkedSites',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({sites:[siteId,siteId]})
                        }, function (error, response, body) {

                            if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('linkedSites');
                                results.linkedSites.length.should.be.equal(2);
                                results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.equal(-1);
                                results.linkedSites.indexOf(ForeignKeysNested.siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeysBis.siteId.toString()).should.be.equal(-1);
                            }
                            done();
                        });
                    });
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get two nested site, other two nested not searched]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, ForeignKeysNested) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, function (err, ForeignKeys) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                    siteDocuments.createDocuments(1,ForeignKeys.siteId, function (err, ForeignKeysBis) {
                        if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                        request.post({
                            url: APIURL + '/actions/getLinkedSites',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({sites:[siteId]})
                        }, function (error, response, body) {

                            if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('linkedSites');
                                results.linkedSites.length.should.be.equal(2);
                                results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeysNested.siteId.toString()).should.be.greaterThanOrEqual(0);
                                results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.equal(-1);
                                results.linkedSites.indexOf(ForeignKeysBis.siteId.toString()).should.be.equal(-1);

                            }
                            done();
                        });
                    });
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[get four nested site, other two nested]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, FK1Nested) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, FK1Nested.siteId,function (err, FK2Nested) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                    siteDocuments.createDocuments(1, FK2Nested.siteId,function (err, FK3Nested) {
                        if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                        siteDocuments.createDocuments(1, function (err, ForeignKeys) {
                            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                            siteDocuments.createDocuments(1,ForeignKeys.siteId, function (err, ForeignKeysBis) {
                                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                                request.post({
                                    url: APIURL + '/actions/getLinkedSites',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({sites:[siteId,ForeignKeys.siteId]})
                                }, function (error, response, body) {

                                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.should.have.property('linkedSites');
                                        results.linkedSites.length.should.be.equal(6);
                                        results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(ForeignKeys.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(ForeignKeysBis.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(FK1Nested.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(FK2Nested.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(FK3Nested.siteId.toString()).should.be.greaterThanOrEqual(0);
                                    }
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[mixed Case s1->s2->s3, s3->s4, s4->s5,s6]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, s2) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, siteId,function (err, s3) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                    siteDocuments.createDocuments(1, s3.siteId,function (err, s4) {
                        if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                        siteDocuments.createDocuments(1, s4.siteId,function (err, s5) {
                            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                            siteDocuments.createDocuments(1,s4.siteId, function (err, s6) {
                                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                                request.post({
                                    url: APIURL + '/actions/getLinkedSites',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({sites:[siteId]})
                                }, function (error, response, body) {

                                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.should.have.property('linkedSites');
                                        results.linkedSites.length.should.be.equal(6);
                                        results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s2.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s3.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s4.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s5.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s6.siteId.toString()).should.be.greaterThanOrEqual(0);
                                    }
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action getLinkedSites[mixed Case s1->s2->s3, s3->s4, s4->s5,s6 mutiple search]';
        it(testMessage, function (done) {

            siteDocuments.createDocuments(1, siteId,function (err, s2) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                siteDocuments.createDocuments(1, siteId,function (err, s3) {
                    if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                    siteDocuments.createDocuments(1, s3.siteId,function (err, s4) {
                        if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                        siteDocuments.createDocuments(1, s4.siteId,function (err, s5) {
                            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                            siteDocuments.createDocuments(1,s4.siteId, function (err, s6) {
                                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);

                                request.post({
                                    url: APIURL + '/actions/getLinkedSites',
                                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                    body: JSON.stringify({sites:[siteId,s4.siteId]})
                                }, function (error, response, body) {

                                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.should.have.property('linkedSites');
                                        results.linkedSites.length.should.be.equal(6);
                                        results.linkedSites.indexOf(siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s2.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s3.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s4.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s5.siteId.toString()).should.be.greaterThanOrEqual(0);
                                        results.linkedSites.indexOf(s6.siteId.toString()).should.be.greaterThanOrEqual(0);
                                    }
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });





    // searchSitesByLocation tests

    testTypeMessage='POST /sites/actions/searchSitesByLocation';


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to no body';
        it(testMessage, function (done) {
            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body missing');

                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to location body field missing';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({skip: 0})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body fields \'location, distance, distanceOptions\' missing or empty');

                }
                done();
            });
        });

    });



    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to location body field is not a valid location';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({location:0,distance:1, distanceOptions:{mode:"bbox"}});
            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location format');

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to location body field is not a valid location';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({location:{coordinate:[]},distance:1, distanceOptions:{mode:"bbox"}});
            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location format');

                }
                done();
            });
        });
    });

  describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to location body field is not a valid location.coordinates';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({location:{coordinates:[]},distance:1, distanceOptions:{mode:"bbox"}});
            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location format');

                }
                done();
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to location body field is not a valid location';
        it(testMessage, function (done) {
            var bodyParam=JSON.stringify({location:{coordinates:[360,360]},distance:1, distanceOptions:{mode:"bbox"}});
            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: bodyParam
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid location coordinates: longitude must be in range [-180,180]');

                }
                done();
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to sql injection';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({distance:1, distanceOptions:false, location: [{ "$in": siteId }]})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('mongoDb operator "$..." are not allowed in query filter');

                }
                done();
            });
        });
    });



    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to distance body field missing';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location: [0,0]})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body fields \'distance, distanceOptions\' missing or empty');

                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to distance as text';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location: {coordinates:[0,0]},distance:"text", distanceOptions:{mode:"bbox"}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('Invalid distance format. Must be a number');
                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to distanceOptions body field missing';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location: [0,0],distance:1})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body fields \'distanceOptions\' missing or empty');

                }
                done();
            });
        });

    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to distanceOptions format is not valid';
        it(testMessage, function (done) {
            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location:{ coordinates:[0,0]},distance:1,distanceOptions:true})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('distanceOptions must be as {mode:\'BBOX || RADIUS\', returndistance:\'boolean\'}. mode field must be set to BBOX or RADIUS');

                }
                done();
            });
        });

    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to mode option value is not valid';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location:{ coordinates:[0,0]},distance:1,distanceOptions:{mode:"NOTMODE"}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('distanceOptions must be as {mode:\'BBOX || RADIUS\', returndistance:\'boolean\'}. mode field must be set to BBOX or RADIUS');

                }
                done();
            });
        });

    });



    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation not error if returnDistance option is not set';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location:{ coordinates:[0,0]},distance:1,distanceOptions:{mode:"BBOX",returnDistance:"notBoolean"}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('sites');
                    results.sites.length.should.be.equal(0);

                }
                done();
            });
        });

    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation not error if returnDistance option is not set';
        it(testMessage, function (done) {

            request.post({
                url: APIURL + '/actions/searchSitesByLocation',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({location:{ coordinates:[0,0]},distance:1,distanceOptions:{mode:"RADIUS"}})
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('sites');
                    results.sites.length.should.be.equal(0);

                }
                done();
            });
        });

    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation error due to distance as numerical text';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance="2700x";
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(400);
                        var results = JSON.parse(body);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.eql('Invalid distance format. Must be a number');

                    }
                    done();
                });
            });
        });
    });



    function localizeSites(centrePoint,numberForBB,bBNumber,distance,deltaDistance,returnCallback){

        var start=new geoLatLon(centrePoint[0],centrePoint[1]);
        Sites.find({},function(err,results){
            if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
            var currentLoc=[];
            var tmpLatLon;
            var distMin,distMax
            for (var bbox=0;bbox<bBNumber;++bbox){
                distMin=(distance*bbox)+deltaDistance;
                distMax=(distance*(bbox+1));
                for (var site=0;site<numberForBB;++site){
                    tmpLatLon=start.destinationPoint(Math.floor(Math.random()*(distMax-distMin))+distMin,Math.floor(Math.random()*361));
                    currentLoc.push([tmpLatLon.lon,tmpLatLon.lat]);
                }
            }

            async.eachOf(currentLoc, function(location,index, callback) {

                Sites.findByIdAndUpdate(results[index]._id,{location:{coordinates:location}},function(err,res){
                    callback(err);
                });

            }, function(err) {
                if (err) consoleLogError.printErrorLog("Site APIActionsTests.js - beforreEach - Sites.create ---> " + err);
                returnCallback(null,currentLoc);
            });
        });
    }


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get one or more site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:300,distanceOptions:{mode:"bbox"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.greaterThanOrEqual(1);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get two or more site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:600,distanceOptions:{mode:"bbox"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.greaterThanOrEqual(2);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 5 or more site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:1500,distanceOptions:{mode:"bbox"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.greaterThanOrEqual(5);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 9 or more site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:2700,distanceOptions:{mode:"bbox"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.greaterThanOrEqual(9);
                    }
                    done();
                });
            });
        });
    });


    // Accurate results with mode  option set to radius

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get one site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:300,distanceOptions:{mode:"radius"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.equal(1);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get two site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:600,distanceOptions:{mode:"radius"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.equal(2);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 5 site]';
        it(testMessage, function (done) {
            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:1500,distanceOptions:{mode:"radius"}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.equal(5);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 9 site]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:2700,distanceOptions:{mode:"radius", returnDistance:false}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.not.have.property("distances");
                        results.sites.length.should.be.equal(9);
                        for(res in results.sites){
                            results.sites[res].should.not.have.property("siteId");
                            results.sites[res].should.not.have.property("distance");
                        }
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 9 or more site and distance]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"bbox", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.have.property("distances");
                        results.sites.length.should.be.greaterThanOrEqual(9);
                        results.distances.length.should.be.greaterThanOrEqual(9);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 9 or more site and distance]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"bbox", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.have.property("distances");
                        results.sites.length.should.be.greaterThanOrEqual(9);
                        results.distances.length.should.be.greaterThanOrEqual(9);
                    }
                    done();
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved, get 9 site and distance]';
        it(testMessage, function (done) {
            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.have.property("distances");
                        results.sites.length.should.be.equal(9);
                        results.distances.length.should.be.equal(9);
                        for(res in results.sites){
                            results.distances[res].should.be.lessThanOrEqual(test_distance);
                        }
                    }
                    done();
                });
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation [10 sites saved and one linkedSite, get 9 site and distance]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.sites.length.should.be.equal(9);


                        siteDocuments.createDocuments(1, results.sites[0],function (error, s2) {
                            if (error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            request.post({
                                url: APIURL + '/actions/searchSitesByLocation',
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:true}})
                            }, function (error, response, body) {

                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var resultsLs = JSON.parse(body);
                                    resultsLs.should.have.property("sites");
                                    resultsLs.should.have.property("distances");
                                    resultsLs.sites.length.should.be.equal(10);
                                    resultsLs.distances.length.should.be.equal(10);
                                    for(res in resultsLs.sites){
                                        resultsLs.distances[res].should.be.lessThanOrEqual(test_distance);
                                    }
                                }
                                done();
                            });
                        });

                    }
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation not distance[10 sites saved and one linkedSite, get 9 site and distance]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.have.property("distances");
                        results.sites.length.should.be.equal(9);


                        siteDocuments.createDocuments(1, results.sites[0],function (error, s2) {
                            if (error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            request.post({
                                url: APIURL + '/actions/searchSitesByLocation',
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:false}})
                            }, function (error, response, body) {

                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var resultsLs = JSON.parse(body);
                                    resultsLs.should.have.property("sites");
                                    resultsLs.should.not.have.property("distances");
                                    resultsLs.sites.length.should.be.equal(10);
                                }
                                done();
                            });
                        });

                    }
                });
            });
        });
    });

    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation bbox mode [10 sites saved and one linkedSite, get 9 or more site and distance]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"BBOX", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.have.property("distances");
                        results.sites.length.should.be.greaterThanOrEqual(9);


                        siteDocuments.createDocuments(1, results.sites[0],function (error, s2) {
                            if (error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            request.post({
                                url: APIURL + '/actions/searchSitesByLocation',
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:true}})
                            }, function (error, response, body) {

                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var resultsLs = JSON.parse(body);
                                    resultsLs.should.have.property("sites");
                                    results.should.have.property("distances");
                                    resultsLs.sites.length.should.be.greaterThanOrEqual(10);
                                    resultsLs.distances.length.should.be.greaterThanOrEqual(10);
                                }
                                done();
                            });
                        });

                    }
                });
            });
        });
    });


    describe(testTypeMessage, function () {
        testMessage='must test API action searchSitesByLocation bbox mode no distance [10 sites saved and one linkedSite, get 9 or more site and distance]';
        it(testMessage, function (done) {

            var site=[38.990519,8.936253];
            var test_distance=2700;
            localizeSites(site,1,10,300,100,function(err,locations){
                request.post({
                    url: APIURL + '/actions/searchSitesByLocation',
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"BBOX", returnDistance:true}})
                }, function (error, response, body) {

                    if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property("sites");
                        results.should.have.property("distances");
                        results.sites.length.should.be.greaterThanOrEqual(9);


                        siteDocuments.createDocuments(1, results.sites[0],function (error, s2) {
                            if (error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                            request.post({
                                url: APIURL + '/actions/searchSitesByLocation',
                                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                                body: JSON.stringify({location: {coordinates:site},distance:test_distance,distanceOptions:{mode:"radius", returnDistance:false}})
                            }, function (error, response, body) {

                                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var resultsLs = JSON.parse(body);
                                    resultsLs.should.have.property("sites");
                                    resultsLs.should.not.have.property("distances");
                                    resultsLs.sites.length.should.be.greaterThanOrEqual(10);
                                    for(res in resultsLs.sites){
                                        resultsLs.sites[res].should.not.have.property("siteId");
                                        resultsLs.sites[res].should.not.have.property("distance");
                                    }
                                }
                                done();
                            });
                        });
                    }
                });
            });
        });
    });


});
