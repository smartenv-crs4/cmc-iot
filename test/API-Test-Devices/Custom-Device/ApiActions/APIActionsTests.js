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
var Devices = require('../../../../DBEngineHandler/drivers/deviceDriver');
var Things = require('../../../../DBEngineHandler/drivers/thingDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/devices";
var commonFunctioTest = require("../../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../../Utility/errorLogs');
var async = require('async');
var deviceDocuments = require('../../../SetTestenv/createDevicesDocuments');

var webUiToken;
var deviceId;
var associatedThingId;


describe('Devices API Test - [ACTIONS TESTS]', function () {

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
        Devices.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {

        deviceDocuments.createDocuments(100, function (err, deviceForeignKeys) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - beforreEach - Devices.create ---> " + err);
            deviceId = deviceForeignKeys.deviceId;
            associatedThingId=deviceForeignKeys.thingId;
           done();
        });
    });


    afterEach(function (done) {
        deviceDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Device APIActionsTests.js - afterEach - deleteMany ---> " + err);
          done();
        });
    });

    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed error due to no body', function (done) {


            request.post({
                url: APIURL + '/actions/searchDismissed',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed error due to no body'  -->" + error.message);
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


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed error due to searchFilters body field missing', function (done) {

            request.post({
                url: APIURL + '/actions/searchDismissed',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({skip: 0})
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed error due to searchFilters body field missing'  -->" + error.message);
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


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed no results due to no dismissed devices', function (done) {

            request.post({
                url: APIURL + '/actions/searchDismissed',
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                body: JSON.stringify({searchFilters: {}})
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed no results due to no dismissed devices'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('_metadata');
                    results.should.have.property('devices');
                    results.devices.length.should.be.eql(0);
                }
                done();
            });
        });

    });


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({searchFilters: {}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('devices');
                                results.devices.length.should.be.eql(conf.pagination.limit);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });

    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed skip, limit', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed skip, limit'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed skip, limit'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({pagination: {limit: 10, skip: 2}, searchFilters: {}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed skip, limit'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('devices');
                                results.devices.length.should.be.eql(10);
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


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed skip, limit, totalCount', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed skip, limit, totalCount'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed skip, limit, totalCount'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
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

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed skip, limit, totalCount'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('devices');
                                results.devices.length.should.be.eql(10);
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


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed field projection[description, name]', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed field projection[description, name]'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed field projection[description, name]'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({searchFilters: {fields: "name description"}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed field projection[description, name]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('devices');
                                results.devices.length.should.be.eql(conf.pagination.limit);
                                results.devices[0].should.have.properties("name", "description");
                                results.devices[0].should.not.have.property("vendorId");
                                results.devices[0].should.not.have.property("ownerId");
                                results.devices[0].should.not.have.property("disabled");
                                results.devices[0].should.not.have.property("dismissed");
                            }
                            done();
                        });
                    });

                }
            });
        });

    });

    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed field projection[-description]', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed field projection[-description]'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed field projection[-description]  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify({searchFilters: {fields: "-description"}})
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed field projection[-description]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('devices');
                                results.devices.length.should.be.eql(conf.pagination.limit);
                                results.devices[0].should.not.have.property("description");
                                results.devices[0].should.have.properties("dismissed", "disabled", "typeId", "thingId", "name");
                            }
                            done();
                        });
                    });

                }
            });
        });

    });

    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed with filters [by single name]', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {
                                name: [results.devices[0].name]
                            }
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var results = JSON.parse(body);
                                results.should.have.property('_metadata');
                                results.should.have.property('devices');
                                results.devices.length.should.be.eql(1);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed with filters [by double name]', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {
                                name: [results.devices[0].name, results.devices[1].name]
                            }
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by single name]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('devices');
                                searchresults.devices.length.should.be.eql(2);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed with filters [by devices]', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by devices]'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by devices]'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
                                callback();
                            }
                        });

                    }, function (err) {
                        var bodyParams = {
                            searchFilters: {
                                devices: [results.devices[0]._id, results.devices[1]._id]
                            }
                        };
                        request.post({
                            url: APIURL + '/actions/searchDismissed',
                            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + webUiToken},
                            body: JSON.stringify(bodyParams)
                        }, function (error, response, body) {

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed with filters [by devices]'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('devices');
                                searchresults.devices.length.should.be.eql(2);
                                bodyParams.searchFilters.devices.should.containEql(Devices.ObjectId(searchresults.devices[0]._id));
                                bodyParams.searchFilters.devices.should.containEql(Devices.ObjectId(searchresults.devices[1]._id));

                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed  ordering results desc', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed  ordering results desc'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed  ordering results desc'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
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

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed  ordering results desc'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('devices');
                                searchresults.devices[0].name.should.be.greaterThan(searchresults.devices[1].name);
                                searchresults.devices[1].name.should.be.greaterThan(searchresults.devices[2].name);
                                searchresults.devices[2].name.should.be.greaterThan(searchresults.devices[3].name);

                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /devices/actions/searchDismissed', function () {

        it('must test API action searchDismissed  ordering results asc', function (done) {


            Devices.findAll({}, null, null, function (err, results) {
                if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + err);
                else {

                    results.devices.length.should.be.eql(100);
                    results.should.have.properties("devices", "_metadata");
                    async.each(results.devices, function (device, callback) {
                        Devices.findByIdAndUpdate(device._id, {dismissed: true}, function (err, updateDevice) {
                            if (err) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + err);
                            else {
                                updateDevice.dismissed.should.be.true();
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

                            if (error) consoleLogError.printErrorLog("POST /devices/actions/searchDismissed: 'must test API action searchDismissed  ordering results asc'  -->" + error.message);
                            else {
                                response.statusCode.should.be.equal(200);
                                var searchresults = JSON.parse(body);
                                searchresults.should.have.property('_metadata');
                                searchresults.should.have.property('devices');
                                searchresults.devices[3].name.should.be.greaterThan(searchresults.devices[2].name);
                                searchresults.devices[2].name.should.be.greaterThan(searchresults.devices[1].name);
                                searchresults.devices[1].name.should.be.greaterThan(searchresults.devices[0].name);
                            }
                            done();
                        });
                    });

                }
            });
        });

    });


    describe('POST /devices/:id/actions/disable', function () {

        it('must test API action disable/enable [device by enabled thing] ', function (done) {

            Things.create({name:"name",description:"description", dismissed:false, disabled:false,ownerId:Things.ObjectId(),vendorId:Things.ObjectId(),siteId:Things.ObjectId()},function(err,thing){
                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + err);
                else {
                    Devices.findAll({}, null, null, function (err, results) {
                        if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by enabled thing]'  -->" + err);
                        else {

                            results.devices.length.should.be.eql(100);
                            results.should.have.properties("devices", "_metadata");
                            results.devices[0].disabled.should.be.false();

                            Devices.findByIdAndUpdate(results.devices[0]._id,{thingId:thing._id},function(err,updatedDevice){
                                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by enabled thing]'  -->" + err);
                                else {
                                    request.post({
                                        url: APIURL + '/' + results.devices[0]._id + '/actions/disable',
                                        headers: {
                                            'content-type': 'application/json',
                                            'Authorization': "Bearer " + webUiToken
                                        },
                                    }, function (error, response, body) {

                                        if (error) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by enabled thing]'  -->" + error);
                                        else {
                                            response.statusCode.should.be.equal(200);
                                            var disableResults = JSON.parse(body);
                                            disableResults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                            disableResults.disabled.should.be.true();
                                        }
                                        request.post({
                                            url: APIURL + '/' + results.devices[0]._id + '/actions/enable',
                                            headers: {
                                                'content-type': 'application/json',
                                                'Authorization': "Bearer " + webUiToken
                                            },
                                        }, function (error, response, body) {

                                            if (error) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by enabled thing]'  -->" + error);
                                            else {
                                                response.statusCode.should.be.equal(200);
                                                var disableResults = JSON.parse(body);
                                                disableResults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                                disableResults.disabled.should.be.false();
                                            }
                                            Things.findByIdAndRemove(thing._id, function (err) {
                                                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by enabled thing]'  -->" + err);
                                                done();
                                            })

                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });

    });


    describe('POST /devices/:id/actions/disable', function () {

        it('must test API action disable/enable [device by disabled thing] ', function (done) {

            Things.create({name:"name",description:"description", dismissed:false, disabled:true,ownerId:Things.ObjectId(),vendorId:Things.ObjectId(),siteId:Things.ObjectId()},function(err,thing){
                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + err);
                else {
                    Devices.findAll({}, null, null, function (err, results) {
                        if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + err);
                        else {

                            results.devices.length.should.be.eql(100);
                            results.should.have.properties("devices", "_metadata");
                            results.devices[0].disabled.should.be.false();

                            Devices.findByIdAndUpdate(results.devices[0]._id,{thingId:thing._id},function(err,updatedDevice){
                                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + err);
                                else {
                                    request.post({
                                        url: APIURL + '/' + results.devices[0]._id + '/actions/disable',
                                        headers: {
                                            'content-type': 'application/json',
                                            'Authorization': "Bearer " + webUiToken
                                        },
                                    }, function (error, response, body) {

                                        if (error) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + error);
                                        else {
                                            response.statusCode.should.be.equal(200);
                                            var disableResults = JSON.parse(body);
                                            disableResults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                            disableResults.disabled.should.be.true();
                                        }
                                        request.post({
                                            url: APIURL + '/' + results.devices[0]._id + '/actions/enable',
                                            headers: {
                                                'content-type': 'application/json',
                                                'Authorization': "Bearer " + webUiToken
                                            },
                                        }, function (error, response, body) {

                                            if (error) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + error);
                                            else {
                                                response.statusCode.should.be.equal(400);
                                                var disableResults = JSON.parse(body);
                                                disableResults.should.have.properties('error', 'statusCode', 'message');
                                                disableResults.message.should.be.eql("Cannot enable device due to associated thing is not enabled");
                                            }
                                            Things.findByIdAndRemove(thing._id, function (err) {
                                                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by disabled thing]'  -->" + err);
                                                done();
                                            })

                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });

    });

    describe('POST /devices/:id/actions/disable', function () {

        it('must test API action disable/enable [device by unavailable thing] ', function (done) {

            Things.findByIdAndRemove(associatedThingId,function(err,deletedThing){
                if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by unavailable thing]'  -->" + err);
                else {
                    Devices.findAll({}, null, null, function (err, results) {
                        if (err) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by unavailable thing]'  -->" + err);
                        else {

                            results.devices.length.should.be.eql(100);
                            results.should.have.properties("devices", "_metadata");
                            results.devices[0].disabled.should.be.false();

                            request.post({
                                url: APIURL + '/' + results.devices[0]._id + '/actions/disable',
                                headers: {
                                    'content-type': 'application/json',
                                    'Authorization': "Bearer " + webUiToken
                                },
                            }, function (error, response, body) {

                                if (error) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by unavailable thing]'  -->" + error);
                                else {
                                    response.statusCode.should.be.equal(200);
                                    var disableResults = JSON.parse(body);
                                    disableResults.should.have.properties('name', 'description', 'dismissed', 'disabled');
                                    disableResults.disabled.should.be.true();
                                }
                                request.post({
                                    url: APIURL + '/' + results.devices[0]._id + '/actions/enable',
                                    headers: {
                                        'content-type': 'application/json',
                                        'Authorization': "Bearer " + webUiToken
                                    },
                                }, function (error, response, body) {

                                    if (error) consoleLogError.printErrorLog("POST /devices/:id/actions/disable: 'must test API action disable [device by unavailable thing]'  -->" + error);
                                    else {
                                        response.statusCode.should.be.equal(409);
                                        var disableResults = JSON.parse(body);
                                        disableResults.should.have.properties('error', 'statusCode', 'message');
                                        disableResults.message.should.be.eql("Cannot enable device due to associated thing is not available");
                                    }
                                    done();

                                });
                            });
                        }
                    });
                }
            });
        });
    });
    

});
