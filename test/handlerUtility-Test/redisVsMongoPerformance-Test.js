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
var observationUtility = require('../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var observationDriver=require('../../DBEngineHandler/drivers/observationDriver');
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
var deviceId,unitId;
var testTime=require('../Utility/TestTime');
var numbers=200;


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
            unitId = ForeignKeys.unitId;

            observationUtility.findById(ForeignKeys.observationId, function (err, obs) {
                if (err) consoleLogError.printErrorLog("Redis Handler Test - beforeEach ---> " + err);
                observation = obs;
                done();
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
        this.timeout(0);
        testMessage = "must test " + numbers + " observation items creations";
        it(testMessage, function (done) {
            var range = _.range(numbers);

            async.series([
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationDriver.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, testTime.stopTimeRaw()); //0
                        });

                    },
                    function(callback) {
                        observationDriver.deleteMany({},null,function(err,deleted){
                            callback(err, deleted); //1
                        });

                    },
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationUtility.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//2
                        });
                    },
                    function(callback) {
                        observationUtility.deleteMany({},null,function(err,deleted){
                            callback(err, deleted); //3
                        });

                    }
                ],
                function(err, results) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    else{
                        results[0].should.be.lessThanOrEqual(results[2]);
                        console.log("Creation without Redis: "+results[0].format('x'));
                        console.log("Creatiion With Redis: "+results[2].format('x'));
                        done();
                    }
                });

        });
    });


    describe(testType, function () {
        this.timeout(0);
        testMessage = "must test " + numbers + " observation items Reads with limit=1";
        it(testMessage, function (done) {
            var range = _.range(numbers);

            async.series([
                    function(callback) {
                        async.eachSeries(range, function(e,cb){
                            observationDriver.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, "done"); //0
                        });

                    },
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationUtility.searchFilter({devicesId:[deviceId],unitsId:[unitId]},{limit:1},false,function(err,foundedObj){
                                if(err) callback(err);
                                else{
                                    foundedObj._metadata.source.should.be.equal("Database");
                                    foundedObj.observations.length.should.be.equal(1);
                                    cb();
                                }
                            })

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//1
                        });
                    },
                    function(callback) {
                        observationDriver.deleteMany({},null,function(err,deleted){
                            callback(err, deleted); //2
                        });

                    },
                    function(callback) {
                        async.eachSeries(range, function(e,cb){
                            observationUtility.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, "done");//0
                        });
                    },
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationUtility.searchFilter({devicesId:[deviceId]},{limit:1},false,function(err,foundedObj){
                                if(err) callback(err);
                                else{
                                    foundedObj._metadata.source.should.be.equal("Redis cache");
                                    foundedObj.observations.length.should.be.equal(1);
                                    cb();
                                }
                            })

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//4
                        });
                    },
                    function(callback) {
                        observationUtility.deleteMany({},null,function(err,deleted){
                            callback(err, deleted);
                        });

                    }
                ],
                function(err, results) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    else{
                        results[1].should.be.greaterThanOrEqual(results[4]);
                        console.log("Read without Redis Cache: "+ results[1].format('x'));
                        console.log("Read With Redis Cache: "+results[4].format('x'));
                        done();
                    }
                });
        });
    });


    describe(testType, function () {
        this.timeout(0);
        testMessage = "must test " + numbers + " observation items Reads with limit=5";
        it(testMessage, function (done) {
            var range = _.range(numbers);

            async.series([
                    function(callback) {
                        async.eachSeries(range, function(e,cb){
                            observationDriver.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, "done");//0
                        });

                    },
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationUtility.searchFilter({devicesId:[deviceId],unitsId:[unitId]},{limit:5},false,function(err,foundedObj){
                                if(err) callback(err);
                                else{
                                    foundedObj._metadata.source.should.be.equal("Database");
                                    foundedObj.observations.length.should.be.equal(5);
                                    cb();
                                }
                            })

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//0
                        });
                    },
                    function(callback) {
                        observationDriver.deleteMany({},null,function(err,deleted){
                            callback(err, deleted);//2
                        });

                    },
                    function(callback) {
                        async.eachSeries(range, function(e,cb){
                            observationUtility.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, "done");//3
                        });
                    },
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationUtility.searchFilter({devicesId:[deviceId]},{limit:5},false,function(err,foundedObj){
                                if(err) callback(err);
                                else{
                                    foundedObj._metadata.source.should.be.equal("Redis cache");
                                    foundedObj.observations.length.should.be.equal(5);
                                    cb();
                                }
                            })

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//4
                        });
                    },
                    function(callback) {
                        observationUtility.deleteMany({},null,function(err,deleted){
                            callback(err, deleted);//5
                        });

                    }
                ],
                function(err, results) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    else{
                        results[1].should.be.greaterThanOrEqual(results[4]);
                        console.log("Read without Redis Cache: "+ results[1].format('x'));
                        console.log("Read With Redis Cache: "+results[4].format('x'));
                        done();
                    }
                });
        });
    });


    describe(testType, function () {
        this.timeout(0);
        testMessage = "must test " + numbers + " observation items Creation and Read with limit=5";
        it(testMessage, function (done) {
            var range = _.range(numbers);

            async.series([
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationDriver.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, "done");//0
                        });

                    },
                    function(callback) {
                        async.eachSeries(range, function(e,cb){
                            observationUtility.searchFilter({devicesId:[deviceId],unitsId:[unitId]},{limit:5},false,function(err,foundedObj){
                                if(err) callback(err);
                                else{
                                    foundedObj._metadata.source.should.be.equal("Database");
                                    foundedObj.observations.length.should.be.equal(5);
                                    cb();
                                }
                            })

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//1
                        });
                    },
                    function(callback) {
                        observationDriver.deleteMany({},null,function(err,deleted){
                            callback(err, deleted);//2
                        });

                    },
                    function(callback) {
                        testTime.startTime();
                        async.eachSeries(range, function(e,cb){
                            observationUtility.create({
                                timestamp:new Date().getTime(),
                                value:e,
                                deviceId:deviceId,
                                unitId:unitId,
                                location: { coordinates: [0,0] }
                            },function(err,newObservation){
                                if (err) throw err;
                                cb();
                            });

                        }, function(err){
                            callback(null, "done");//3
                        });
                    },
                    function(callback) {
                        async.eachSeries(range, function(e,cb){
                            observationUtility.searchFilter({devicesId:[deviceId]},{limit:5},false,function(err,foundedObj){
                                if(err) callback(err);
                                else{
                                    foundedObj._metadata.source.should.be.equal("Redis cache");
                                    foundedObj.observations.length.should.be.equal(5);
                                    cb();
                                }
                            })

                        }, function(err){
                            callback(null, testTime.stopTimeRaw());//4
                        });
                    },
                    function(callback) {
                        observationUtility.deleteMany({},null,function(err,deleted){
                            callback(err, deleted);//5
                        });

                    }
                ],
                function(err, results) {
                    if (err) consoleLogError.printErrorLog(testMessage + " [ERROR] --> " + err);
                    else{
                        results[1].should.be.greaterThanOrEqual(results[4]);
                        console.log("Read without Redis Cache: "+ results[1].format('x'));
                        console.log("Read With Redis Cache: "+results[4].format('x'));
                        done();
                    }
                });
        });
    });

});
