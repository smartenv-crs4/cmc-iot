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
});
