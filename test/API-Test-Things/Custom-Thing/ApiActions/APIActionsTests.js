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
var Things = require('../../../../DBEngineHandler/drivers/thingDriver');
var Devices = require('../../../../DBEngineHandler/drivers/deviceDriver');
var disabledDevices = require('../../../../DBEngineHandler/drivers/disabledDeviceDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/things";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var async = require('async');
var thingDocuments = require('../../../SetTestenv/createThingsDocuments');
var deviceDocuments = require('../../../SetTestenv/createDevicesDocuments');

var webUiToken;
var thingId;


describe('Things API Test - [ACTIONS TESTS]', function () {

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
        Things.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {

        // 99 + 1(by Devices =100
        thingDocuments.createDocuments(99, function (err, newThingId) {
            if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - beforreEach - Things.create ---> " + err);
            thingId = newThingId;
            deviceDocuments.createDocuments(100, function (err, newThingId) {
                if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - beforreEach - Device.create ---> " + err);
                disabledDevices.deleteMany({},function(err){
                    if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - beforreEach - Device.create ---> " + err);
                    done();
                });
            });
        });
    });


    afterEach(function (done) {
        Things.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - afterEach - deleteMany ---> " + err);
            Devices.deleteMany({}, function (err, elm) {
                if (err) consoleLogError.printErrorLog("Thing APIActionsTests.js - afterEach - deleteMany ---> " + err);
                done();
            });
        });
    });

    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed error due to no body', function (done) {


            request.post({
                url: APIURL + '/actions/searchDismissed',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed error due to no body'  -->" + error.message);
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


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed error due to searchFilters body field missing', function (done) {

            request.post({
                url: APIURL + '/actions/searchDismissed',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({skip: 0})
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed error due to searchFilters body field missing'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('mandatory searchFilters body field missing');

                }
                done();
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed no results due to no dismissed things', function (done) {

            request.post({
                url: APIURL + '/actions/searchDismissed',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {}})
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed no results due to no dismissed things'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('_metadata');
                    results.should.have.property('things');
                    results.things.length.should.be.eql(0);
                }
                done();
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({searchFilters: {}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('things');
                                results.things.length.should.be.eql(conf.pagination.limit);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });

    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed skip, limit', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed skip, limit'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed skip, limit'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({pagination: {limit: 10, skip: 2}, searchFilters: {}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed skip, limit'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('things');
                                results.things.length.should.be.eql(10);
                                results._metadata.skip.should.be.eql(2);
                                results._metadata.limit.should.be.eql(10);
                                results._metadata.totalCount.should.be.eql(false);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed skip, limit, totalCount', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed skip, limit, totalCount'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed skip, limit, totalCount'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({
                                pagination: {limit: 10, skip: 2, totalCount: true},
                                searchFilters: {}
                            })
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed skip, limit, totalCount'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('things');
                                results.things.length.should.be.eql(10);
                                results._metadata.skip.should.be.eql(2);
                                results._metadata.limit.should.be.eql(10);
                                results._metadata.totalCount.should.be.eql(100);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed field projection[description, name]', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed field projection[description, name]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed field projection[description, name]'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({searchFilters: {fields: "name description"}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed field projection[description, name]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('things');
                                results.things.length.should.be.eql(conf.pagination.limit);
                                results.things[0].should.have.properties("name", "description");
                                results.things[0].should.not.have.property("dismissed");
                                results.things[0].should.not.have.property( "disabled");
                                results.things[0].should.not.have.property("ownerId");
                                results.things[0].should.not.have.property("vendorId");
                            }
                            done();
                        });
                    });

                }
            });
        });

    });

    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed field projection[-description]', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed field projection[-description]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed field projection[-description]  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({searchFilters: {fields: "-description"}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed field projection[-description]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('things');
                                results.things.length.should.be.eql(conf.pagination.limit);
                                results.things[0].should.not.have.property("description");
                                results.things[0].should.have.properties("dismissed", "disabled", "ownerId", "vendorId", "name");
                            }
                            done();
                        });
                    });

                }
            });
        });

    });

    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed with filters [by single name]', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {
                                name: [results.things[0].name]
                            }
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('things');
                                results.things.length.should.be.eql(1);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed with filters [by double name]', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {
                                name: [results.things[1].name, results.things[2].name]
                            }
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('things');
                                searchresults.things.length.should.be.eql(2);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed with filters [by things]', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by things]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by things]'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {
                                things: [results.things[0]._id, results.things[1]._id]
                            }
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed with filters [by things]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('things');
                                searchresults.things.length.should.be.eql(2);
                                bodyParams.searchFilters.things.should.containEql(Things.ObjectId(searchresults.things[0]._id));
                                bodyParams.searchFilters.things.should.containEql(Things.ObjectId(searchresults.things[1]._id));

                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed  ordering results desc', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results desc'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results desc'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {},
                            options: {sortDesc: "name,description"}
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results desc'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('things');
                                searchresults.things[0].name.should.be.greaterThanOrEqual(searchresults.things[1].name);
                                searchresults.things[1].name.should.be.greaterThanOrEqual(searchresults.things[2].name);
                                searchresults.things[2].name.should.be.greaterThanOrEqual(searchresults.things[3].name);

                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/actions/searchDismissed', function () {

        it('must test API action searchDismissed  ordering results asc', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    async.each(results.things, function (thing, callback) {
                        Things.findByIdAndUpdate(thing._id, {dismissed: true}, function (err, updateThing) {
                            if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + err);
                            else {
                                updateThing.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {},
                            options: {sortAsc: "name,description"}
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('things');
                                searchresults.things[3].name.should.be.greaterThanOrEqual(searchresults.things[2].name);
                                searchresults.things[2].name.should.be.greaterThanOrEqual(searchresults.things[1].name);
                                searchresults.things[1].name.should.be.greaterThanOrEqual(searchresults.things[0].name);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /things/:id/actions/disable', function () {

        it('must test API action disable [thing without devices] ', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing without devices]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    results.things[0].disabled.should.be.false();
                    request.post({
                        url: APIURL + '/' + results.things[0]._id + '/actions/disable',
                        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                    }, function (error, response, body) {

                        if (error) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing without devices]'  -->" + error);
                        else {
                            response.statusCode.should.be.equal(200);
                            var disableesults = JSON.parse(body);
                            disableesults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                            disableesults.disabled.should.be.true();
                        }
                        request.post({
                            url: APIURL + '/' + results.things[0]._id + '/actions/enable',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing without devices]'  -->" + error);
                            else {
                                response.statusCode.should.be.equal(200);
                                var disableesults = JSON.parse(body);
                                disableesults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                disableesults.disabled.should.be.false();
                            }
                            done();
                        });
                    });
                }
            });
        });

    });


    describe('POST /things/:id/actions/disable', function () {

        it('must test API action disable [thing with associated devices] ', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    results.things[0].disabled.should.be.false();
                    var thingId = results.things[0]._id;

                    Devices.findAll({}, null, null, function (err, results) {
                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + err);
                        else {
                            results.should.have.properties("devices");
                            results.should.have.properties("_metadata");
                            async.each([0, 1, 2, 3, 4], function (thingIndex, callback) {
                                Devices.findByIdAndUpdate(results.devices[thingIndex]._id, {thingId: thingId}, function (err, updateDevice) {
                                    if (err) consoleLogError.printErrorLog("POST /things/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + err);
                                    else {
                                        updateDevice.thingId.should.be.eql(thingId);
                                        callback();
                                    }
                                });

                            }, function (err) {
                                Devices.findAll({thingId: thingId}, null, null, function (err, results) {
                                    if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + err);
                                    else {
                                        results.should.have.properties("devices");
                                        results.should.have.properties("_metadata");
                                        results.devices.length.should.be.eql(5);
                                        async.each(results.devices, function (deviceFound, callback) {
                                            deviceFound.disabled.should.be.false();
                                            callback();

                                        }, function (err) {

                                            request.post({
                                                url: APIURL + '/' + thingId + '/actions/disable',
                                                headers: {
                                                    'content-type': 'application/json',
                                                    'Authorization': "Bearer " + webUiToken
                                                },
                                            }, function (error, response, body) {

                                                if (error) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + error);
                                                else {
                                                    response.statusCode.should.be.equal(200);
                                                    var disableesults = JSON.parse(body);
                                                    disableesults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                                    disableesults.disabled.should.be.true();

                                                    Devices.findAll({thingId: thingId}, null, null, function (err, results) {
                                                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + err);
                                                        else {
                                                            results.should.have.properties("devices");
                                                            results.should.have.properties("_metadata");
                                                            results.devices.length.should.be.eql(5);
                                                            async.each(results.devices, function (deviceFound, callback) {
                                                                deviceFound.disabled.should.be.true();
                                                                callback();

                                                            }, function (err) {
                                                                request.post({
                                                                    url: APIURL + '/' + thingId + '/actions/enable',
                                                                    headers: {
                                                                        'content-type': 'application/json',
                                                                        'Authorization': "Bearer " + webUiToken
                                                                    },
                                                                }, function (error, response, body) {

                                                                    if (error) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + error);
                                                                    else {
                                                                        response.statusCode.should.be.equal(200);
                                                                        var disableesults = JSON.parse(body);
                                                                        disableesults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                                                        disableesults.disabled.should.be.false();
                                                                    }
                                                                    Devices.findAll({thingId: thingId}, null, null, function (err, results) {
                                                                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + err);
                                                                        else {
                                                                            results.should.have.properties("devices");
                                                                            results.should.have.properties("_metadata");
                                                                            results.devices.length.should.be.eql(5);
                                                                            async.each(results.devices, function (deviceFound, callback) {
                                                                                deviceFound.disabled.should.be.false();
                                                                                callback();

                                                                            }, function (err) {
                                                                                disabledDevices.findAll({}, null, null, function (err, disabledDevicesFound) {
                                                                                    if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device]'  -->" + err);
                                                                                    else {
                                                                                       should(disabledDevicesFound.disabledDevices).be.empty();
                                                                                       done();
                                                                                    }
                                                                                });
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            });

                                        });
                                    }
                                });
                            });
                        }
                    });

                }
            });
        });

    });



    describe('POST /things/:id/actions/disable', function () {

        it('must test API action disable [thing with associated devices - some already disabled] ', function (done) {


            Things.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                else {

                    results.things.length.should.be.eql(100);
                    results.should.have.properties("things", "_metadata");
                    results.things[0].disabled.should.be.false();
                    var thingId = results.things[0]._id;

                    Devices.findAll({}, null, null, function (err, results) {
                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                        else {
                            results.should.have.properties("devices");
                            results.should.have.properties("_metadata");

                            // associate device to thing
                            async.each([0, 1, 2, 3, 4], function (thingIndex, callback) {
                                Devices.findByIdAndUpdate(results.devices[thingIndex]._id, {thingId: thingId}, function (err, updateDevice) {
                                    if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                                    else {
                                        updateDevice.thingId.should.be.eql(thingId);
                                        callback();
                                    }
                                });

                            }, function (err) {

                                // associate device to thing but set already disabled (must be disabled also after enable)
                                async.each([5, 6, 7, 8, 9], function (thingIndex, callback) {
                                    Devices.findByIdAndUpdate(results.devices[thingIndex]._id, {thingId: thingId, disabled:true}, function (err, updateDevice) {
                                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                                        else {
                                            updateDevice.thingId.should.be.eql(thingId);
                                            updateDevice.disabled.should.be.true();
                                            callback();
                                        }
                                    });

                                }, function (err) {

                                    Devices.findAll({thingId: thingId}, null, null, function (err, results) {
                                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                                        else {
                                            results.should.have.properties("devices");
                                            results.should.have.properties("_metadata");
                                            results.devices.length.should.be.eql(10);
                                            var disabled=0;
                                            var enabled=0;
                                            async.each(results.devices, function (deviceFound, callback) {
                                                if(deviceFound.disabled)
                                                    disabled++;
                                                else
                                                    enabled++;

                                                callback();

                                            }, function (err) {
                                                disabled.should.be.eql(5);
                                                enabled.should.be.eql(5);
                                                request.post({
                                                    url: APIURL + '/' + thingId + '/actions/disable',
                                                    headers: {
                                                        'content-type': 'application/json',
                                                        'Authorization': "Bearer " + webUiToken
                                                    },
                                                }, function (error, response, body) {

                                                    if (error) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + error);
                                                    else {
                                                        response.statusCode.should.be.equal(200);
                                                        var disableesults = JSON.parse(body);
                                                        disableesults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                                        disableesults.disabled.should.be.true();

                                                        Devices.findAll({thingId: thingId}, null, null, function (err, results) {
                                                            if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                                                            else {
                                                                results.should.have.properties("devices");
                                                                results.should.have.properties("_metadata");
                                                                results.devices.length.should.be.eql(10);
                                                                async.each(results.devices, function (deviceFound, callback) {
                                                                    deviceFound.disabled.should.be.true();
                                                                    callback();

                                                                }, function (err) {
                                                                    request.post({
                                                                        url: APIURL + '/' + thingId + '/actions/enable',
                                                                        headers: {
                                                                            'content-type': 'application/json',
                                                                            'Authorization': "Bearer " + webUiToken
                                                                        },
                                                                    }, function (error, response, body) {

                                                                        if (error) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + error);
                                                                        else {
                                                                            response.statusCode.should.be.equal(200);
                                                                            var disableesults = JSON.parse(body);
                                                                            disableesults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                                                            disableesults.disabled.should.be.false();
                                                                        }
                                                                        Devices.findAll({thingId: thingId}, null, null, function (err, results) {
                                                                            if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                                                                            else {
                                                                                results.should.have.properties("devices");
                                                                                results.should.have.properties("_metadata");
                                                                                results.devices.length.should.be.eql(10);
                                                                                disabled=0;
                                                                                enabled=0;
                                                                                async.each(results.devices, function (deviceFound, callback) {
                                                                                    if(deviceFound.disabled)
                                                                                        disabled++;
                                                                                    else
                                                                                        enabled++;
                                                                                    callback();

                                                                                }, function (err) {
                                                                                    disabled.should.be.eql(5);
                                                                                    enabled.should.be.eql(5);
                                                                                    disabledDevices.findAll({}, null, null, function (err, disabledDevicesFound) {
                                                                                        if (err) consoleLogError.printErrorLog("POST /things/:id/actions/disable: 'must test API action disable [thing with associated device - some already disabled]'  -->" + err);
                                                                                        else {
                                                                                            should(disabledDevicesFound.disabledDevices).be.empty();
                                                                                            done();
                                                                                        }
                                                                                    });
                                                                                });
                                                                            }
                                                                        });
                                                                    });
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
                }
            });
        });

    });

});
