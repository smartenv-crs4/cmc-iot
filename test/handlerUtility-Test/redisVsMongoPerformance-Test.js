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

var db = require("../../connectionsHandler/mongooseConnection");
var observationUtility = require('../../routes/routesHandlers/handlerUtility/observationUtility');
var observationDocuments = require('../SetTestenv/createObservationsDocuments');
var consoleLogError = require('../Utility/errorLogs');
var redisHandler = require('../../DBEngineHandler/drivers/redisDriver');
var conf = require('propertiesmanager').conf;
var should = require('should/should');
var async = require('async');
var _ = require('underscore');
var observation;
var testType = "Redis Handler Test Functions";
var testMessage = "";
var deviceId;


describe('Redis Handler Test', function () {

    before(function (done) {
        db.connect(function () {
            redisHandler.connect(conf.redisCache, function (err) {
                if (err) consoleLogError.printErrorLog("Redis Handler Test - beforeEach ---> " + err);
                done();
            });

        });
    });

    after(function (done) {
        db.disconnect(function () {
            redisHandler.disconnect();
            done();
        });
    });

    beforeEach(function (done) {
        observationDocuments.createDocuments(1, function (err, ForeignKeys) {
            if (err) consoleLogError.printErrorLog("Redis Handler Test - beforeEach ---> " + err);
            deviceId = ForeignKeys.deviceId;
            observationUtility.findById(ForeignKeys.observationId, function (err, obs) {
                if (err) consoleLogError.printErrorLog("Redis Handler Test - beforeEach ---> " + err);
                observation = obs;
                redisHandler.flushall(function (err, data) {
                    done();
                });
            })
        });
    });


    afterEach(function (done) {
        observationDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation CRUD-Tests.js - afterEach - deleteMany ---> " + err);
            redisHandler.flushall(function (err, data) {
                done();
            });
        });
    });


    describe(testType, function () {
        testMessage = "must test single observation save and read";
        it(testMessage, function (done) {
            redisHandler.addObservations(deviceId, [observation], function (err, data) {
                if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                data.should.be.equal(1);
                redisHandler.getObservations(deviceId, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    _.isArray(data).should.be.equal(true);
                    data[0].should.not.have.property("deviceId");
                    data[0].should.not.have.property("value");
                    data[0].should.not.have.property("unitId");
                    done();
                });
            })
        });
    });

    describe(testType, function () {
        testMessage = "must test single observation save and read as Obj";
        it(testMessage, function (done) {
            redisHandler.addObservations(deviceId, [observation], function (err, data) {
                if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                data.should.be.equal(1);
                redisHandler.getObservations(deviceId, {returnAsObject: true}, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    _.isArray(data).should.be.equal(true);
                    data[0].deviceId.should.be.equal(observation.deviceId.toString());
                    data[0].unitId.should.be.equal(observation.unitId.toString());
                    data[0].value.should.be.equal(observation.value);
                    done();
                });
            })
        });
    });


    describe(testType, function () {
        testMessage = "must test 2 observation save and read as Obj";
        it(testMessage, function (done) {
            redisHandler.addObservations(deviceId, [observation, observation], function (err, data) {
                if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                data.should.be.equal(2);
                redisHandler.getObservations(deviceId, {returnAsObject: true}, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    _.isArray(data).should.be.equal(true);
                    data.length.should.be.equal(2);
                    data[0].deviceId.should.be.equal(observation.deviceId.toString());
                    data[0].unitId.should.be.equal(observation.unitId.toString());
                    data[0].value.should.be.equal(observation.value);
                    data[1].deviceId.should.be.equal(observation.deviceId.toString());
                    data[1].unitId.should.be.equal(observation.unitId.toString());
                    data[1].value.should.be.equal(observation.value);
                    done();
                });
            })
        });
    });


    describe(testType, function () {
        testMessage = "must test 2 observation save and read";
        it(testMessage, function (done) {
            redisHandler.addObservations(deviceId, [observation, observation], function (err, data) {
                if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                data.should.be.equal(2);
                redisHandler.getObservations(deviceId, false, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    _.isArray(data).should.be.equal(true);
                    data.length.should.be.equal(2);
                    data[0].should.not.have.property("deviceId");
                    data[0].should.not.have.property("value");
                    data[0].should.not.have.property("unitId");
                    done();
                });
            })
        });
    });


    describe(testType, function () {
        this.timeout(0);
        testMessage = "must test 20 observation single save and 5 read";
        it(testMessage, function (done) {

            var range = _.range(0, 20);
            async.eachSeries(range, function (value, clb) {
                observation.value = value;
                redisHandler.addObservations(deviceId, [observation], function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    data.should.be.lessThanOrEqual(conf.cmcIoTOptions.observationsCacheItems);
                    clb();
                })
            }, function (err) {
                redisHandler.getObservations(deviceId, {returnAsObject: true}, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    _.isArray(data).should.be.equal(true);
                    data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                    data[0].deviceId.should.be.equal(observation.deviceId.toString());
                    data[0].unitId.should.be.equal(observation.unitId.toString());
                    data[1].deviceId.should.be.equal(observation.deviceId.toString());
                    data[1].unitId.should.be.equal(observation.unitId.toString());
                    data[0].value.should.be.equal(19);
                    data[1].value.should.be.equal(18);
                    data[2].value.should.be.equal(17);
                    data[3].value.should.be.equal(16);
                    data[4].value.should.be.equal(15);
                    done();
                });
            });
        });
    });

    describe(testType, function () {
        this.timeout(0);
        testMessage = "must test 20 observation multiple save and 5 read";
        it(testMessage, function (done) {

            var range = _.range(0, 20);
            var obs = [];
            async.eachSeries(range, function (value, clb) {
                observation.value = value;
                obs.push(JSON.parse(JSON.stringify(observation)));
                clb();
            }, function (err) {
                redisHandler.addObservations(deviceId, obs, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    data.should.be.lessThanOrEqual(conf.cmcIoTOptions.observationsCacheItems);
                    redisHandler.getObservations(deviceId, {returnAsObject: true}, function (err, data) {
                        if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                        _.isArray(data).should.be.equal(true);
                        data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                        data[0].deviceId.should.be.equal(observation.deviceId.toString());
                        data[0].unitId.should.be.equal(observation.unitId.toString());
                        data[1].deviceId.should.be.equal(observation.deviceId.toString());
                        data[1].unitId.should.be.equal(observation.unitId.toString());
                        data[0].value.should.be.equal(19);
                        data[1].value.should.be.equal(18);
                        data[2].value.should.be.equal(17);
                        data[3].value.should.be.equal(16);
                        data[4].value.should.be.equal(15);
                        done();
                    });
                })
            });
        });
    });

    describe(testType, function () {
        this.timeout(0);
        testMessage = "must test getObservat6ion limit option";
        it(testMessage, function (done) {

            var range = _.range(0, 20);
            var obs = [];
            async.eachSeries(range, function (value, clb) {
                observation.value = value;
                obs.push(JSON.parse(JSON.stringify(observation)));
                clb();
            }, function (err) {
                redisHandler.addObservations(deviceId, obs, function (err, data) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    data.should.be.lessThanOrEqual(conf.cmcIoTOptions.observationsCacheItems);
                    redisHandler.getObservations(deviceId, {returnAsObject: true, limit:2}, function (err, data) {
                        if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                        _.isArray(data).should.be.equal(true);
                        data.length.should.be.equal(2);
                        data[0].deviceId.should.be.equal(observation.deviceId.toString());
                        data[0].unitId.should.be.equal(observation.unitId.toString());
                        data[1].deviceId.should.be.equal(observation.deviceId.toString());
                        data[1].unitId.should.be.equal(observation.unitId.toString());
                        data[0].value.should.be.equal(19);
                        data[1].value.should.be.equal(18);
                        done();
                    });
                })
            });
        });
    });


});
