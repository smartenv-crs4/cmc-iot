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
var unitDriver = require('../../DBEngineHandler/drivers/unitDriver');
var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver');
var observedPropertyDriver = require('../../DBEngineHandler/drivers/observedPropertyDriver.js');
var unitsDriver = require('../../DBEngineHandler/drivers/unitDriver.js');
var deviceDocuments = require('../SetTestenv/createDevicesDocuments');
var observationsDocuments = require('../SetTestenv/createObservationsDocuments');
var observationUtility=require('../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var redisHandler=require('../../routes/routesHandlers/handlerUtility/redisHandler');
var consoleLogError = require('../Utility/errorLogs');
var conf=require('propertiesmanager').conf;
var should = require('should/should');
var async=require('async');
var _ = require('underscore');
var validUnits={first:null,second:null};
var deviceIdResource;
var typeIdResource;



describe('Observations Utility Test', function () {

    before(function (done) {

        db.connect(function () {
            redisHandler.connect(conf.redisCache, function (err) {
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
        deviceDocuments.createDocuments(100, function (err,deviceForeignKeys) {
            if (err) throw err;
            else {
                deviceIdResource=deviceForeignKeys.deviceId;
                typeIdResource=deviceForeignKeys.deviceTypeId;
                unitDriver.create({
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 10,
                    observedPropertyId: deviceForeignKeys.observedPropertyId
                },function(err,unitId){
                    validUnits.first=unitId;
                    unitDriver.create({
                        name: "nameBis",
                        symbol: "symbolBis",
                        minValue: 0,
                        maxValue: 100,
                        observedPropertyId: deviceForeignKeys.observedPropertyId
                    },function(err,unitIdBis){
                        validUnits.second=unitIdBis;
                        redisHandler.flushDb(function (err, data) {
                            done();
                        });
                    })
                });
            }
        });
    });


    afterEach(function (done) {
        unitDriver.deleteMany({},function(err){
            if(!err){
                deviceDocuments.deleteDocuments(function (err) {
                    if (err) throw err;
                    observationsDocuments.deleteDocuments(function (err) {
                        if (err) throw err;
                        redisHandler.flushDb(function (err, data) {
                            done();
                        });
                    });
                });
            }else{
                throw err;
            }
        });

    });




    describe('observation Utility', function () {

        it('must test checkIfValid [observation is valid]', function (done) {

            observationUtility.checkIfValid(deviceIdResource,{unitId:validUnits.first._id,value:validUnits.first.minValue+1},function(err,response){
                should(err).be.null();
                response.should.have.properties("authorized", "authInfo");
                response.authorized.should.be.true();
                response.authInfo.should.have.properties("dismissed", "disabled", "thing", "units");
                response.authInfo.dismissed.should.be.false();
                response.authInfo.disabled.should.be.false();
                response.authInfo.units.length.should.be.eql(2);
                [validUnits.first._id, validUnits.second._id].should.containEql(response.authInfo.units[0]._id);
                [validUnits.first._id, validUnits.second._id].should.containEql(response.authInfo.units[1]._id);
                [response.authInfo.units[0]._id, response.authInfo.units[1]._id].should.containEql(validUnits.first._id);
                done();
            });
        });
    });


    describe('observation Utility', function () {

        it('must test checkIfValid [The observation value is out of range]', function (done) {

            observationUtility.checkIfValid(deviceIdResource,{unitId:validUnits.first._id, value:validUnits.first.maxValue+1},function(err,response){
                should(err).be.not.null();
                err.should.have.properties("name", "message");
                err.name.should.be.eql("outOfRangeError");
                err.message.should.be.eql("The observation value is out of range.");
                done();
            });
        });
    });


    describe('observation Utility', function () {

        it('must test checkIfValid [observation not valid due to unit is not associated to Device Type]', function (done) {

            observationUtility.checkIfValid(deviceIdResource,{unitId:unitDriver.ObjectId(),value:validUnits.first.maxValue+1},function(err,response){
                should(err).be.not.null();
                err.should.have.properties("name", "message");
                err.name.should.be.eql("DeviceTypeError");
                err.message.should.be.eql("Not a valid unitId for this device type.");
                done();
            });
        });
    });

    describe('observation Utility', function () {

        it('must test checkIfValid [observation not valid due to Dismissed Device]', function (done) {

            deviceDriver.findByIdAndUpdate(deviceIdResource,{dismissed:true},function(err,dismissedDev){
                if (err) consoleLogError.printErrorLog("checkIfValid: 'ust test checkIfValid [observation not valid due to Dismissed Device]'  -->" + err);
                else{
                    observationUtility.checkIfValid(deviceIdResource,{unitId:unitDriver.ObjectId(),value:validUnits.first.maxValue+1},function(err,response){
                        should(err).be.not.null();
                        err.should.have.properties("name", "message");
                        err.name.should.be.eql("DismissedError");
                        err.message.should.be.eql("The device/thing was removed from available devices/things.");
                        done();
                    });
                }
            });
        });
    });

    describe('observation Utility', function () {

        it('must test checkIfValid [observation not valid due to Disabled Device]', function (done) {

            deviceDriver.findByIdAndUpdate(deviceIdResource,{disabled:true},function(err,dismissedDev){
                if (err) consoleLogError.printErrorLog("checkIfValid: 'ust test checkIfValid [observation not valid due to Disabled Device]'  -->" + err);
                else{
                    observationUtility.checkIfValid(deviceIdResource,{unitId:unitDriver.ObjectId(),value:validUnits.first.maxValue+1},function(err,response){
                        should(err).be.not.null();
                        err.should.have.properties("name", "message");
                        err.name.should.be.eql("DisabledError");
                        err.message.should.be.eql("The device/thing was disable. It must be enabled to set observations.");
                        done();
                    });
                }
            });
        });
    });


    describe('observation Utility', function () {

        it('must test checkIfValid [observation not valid due to Device not exist]', function (done) {

            observationUtility.checkIfValid(deviceDriver.ObjectId(),{unitId:unitDriver.ObjectId(),value:validUnits.first.maxValue+1},function(err,response){
                should(err).be.not.null();
                err.should.have.properties("name", "message");
                err.name.should.be.eql("NotExistError");
                err.message.should.be.eql("The device/thing not exist.");
                done();
            });
        });
    });



    describe('observation Utility', function () {
        it('must test create and redis synchronization', function (done) {
            if(redisHandler.getRedisStatus()) {
                observationsDocuments.createDocuments(100, function (err, deviceForeignKeys) {
                    observationUtility.findOne({},null,null,function(err,obs){
                        if (err) consoleLogError.printErrorLog("must test create and redis synchronization [ERROR] --> " + err);
                        var newObs=JSON.parse(JSON.stringify(obs));
                        delete newObs._id;
                        var key2=observationUtility.ObjectId();
                        newObs.deviceId=key2;
                        observationUtility.create(newObs,function(err,nObs){
                            if (err) consoleLogError.printErrorLog("must test create and redis synchronization [ERROR] --> " + err);
                            // wait to redis Sync
                            setTimeout(function () {
                                var key;
                                redisHandler.getAllKey("*", function (err, data) {
                                    key = deviceForeignKeys.deviceId.toString();
                                    redisHandler.KeyLength(key, function (err, data) {
                                        redisHandler.getValuesFromKey(key, 0, 100, function (err, data) {
                                            redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                                if (err) consoleLogError.printErrorLog("must test create and redis synchronization [ERROR] --> " + err);
                                                _.isArray(data).should.be.equal(true);
                                                data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                for (obscache in data) {
                                                    data[obscache].deviceId.should.be.equal(deviceForeignKeys.deviceId.toString());
                                                    data[obscache].value.should.be.equal(100 - obscache - 1);
                                                }

                                                redisHandler.getObservationsFromCache(key2, {returnAsObject: true}, function (err, data) {
                                                    if (err) consoleLogError.printErrorLog("must test create and redis synchronization [ERROR] --> " + err);
                                                    _.isArray(data).should.be.equal(true);
                                                    data.length.should.be.equal(1);
                                                    observationUtility.deleteMany({}, function (err, data) {
                                                        // wait to redis Sync
                                                        setTimeout(function () {
                                                            redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                                                if (err) consoleLogError.printErrorLog("must test create and redis synchronization [ERROR] --> " + err);
                                                                _.isArray(data).should.be.equal(true);
                                                                data.length.should.be.equal(0);
                                                                redisHandler.getObservationsFromCache(key2, {returnAsObject: true}, function (err, data) {
                                                                    if (err) consoleLogError.printErrorLog("must test create and redis synchronization [ERROR] --> " + err);
                                                                    _.isArray(data).should.be.equal(true);
                                                                    data.length.should.be.equal(0);
                                                                    done();

                                                                });
                                                            }, 100);
                                                        })
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            }, 500);
                        })
                    });
                });
            }else{
                done();
            }
        });
    });


    describe('observation Utility', function () {
        it('must test deleteMany', function (done) {
            observationsDocuments.createDocuments(100, function (err,deviceForeignKeys) {
                observationUtility.deleteMany({},function(err,data){
                    done();
                });
            });
        });
    });


    describe('observation Utility', function () {
        it('must test deleteMany and redis synchronization', function (done) {
            if(redisHandler.getRedisStatus()) {
                observationsDocuments.createDocuments(100, function (err, deviceForeignKeys) {

                    // wait to redis Sync
                    setTimeout(function () {
                        var key;
                        redisHandler.getAllKey("*", function (err, data) {
                            key = deviceForeignKeys.deviceId.toString();
                            redisHandler.KeyLength(key, function (err, data) {
                                redisHandler.getValuesFromKey(key, 0, 100, function (err, data) {
                                    redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                        if (err) consoleLogError.printErrorLog("must test deleteMany and redis synchronization [ERROR] --> " + err);
                                        _.isArray(data).should.be.equal(true);
                                        data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                        for (obscache in data) {
                                            data[obscache].deviceId.should.be.equal(deviceForeignKeys.deviceId.toString());
                                            data[obscache].value.should.be.equal(100 - obscache - 1);
                                        }

                                        observationUtility.deleteMany({}, function (err, data) {
                                            // wait to redis Sync
                                            setTimeout(function () {
                                                redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                                    if (err) consoleLogError.printErrorLog("must test deleteMany and redis synchronization [ERROR] --> " + err);
                                                    _.isArray(data).should.be.equal(true);
                                                    data.length.should.be.equal(0);
                                                    done();

                                                }, 100);
                                            })
                                        });
                                    });
                                });
                            });
                        });
                    }, 500);
                });
            }else{
                done();
            }
        });
    });



    describe('observation Utility', function () {
        it('must test findByIdAndUpdate and redis synchronization', function (done) {
            if(redisHandler.getRedisStatus()) {
                observationsDocuments.createDocuments(100, function (err, deviceForeignKeys) {
                    observationsDocuments.createDocuments(10, function (err, device2ForeignKeys) {
                        // wait to redis Sync
                        setTimeout(function () {
                            var key,key1;
                            redisHandler.getAllKey("*", function (err, data) {
                                key = deviceForeignKeys.deviceId.toString();
                                key1= device2ForeignKeys.deviceId.toString();
                                redisHandler.KeyLength(key, function (err, data) {
                                    redisHandler.getValuesFromKey(key, 0, 100, function (err, data) {
                                        redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                            if (err) consoleLogError.printErrorLog("must test findByIdAndUpdate and redis synchronization [ERROR] --> " + err);
                                            _.isArray(data).should.be.equal(true);
                                            data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                            for (obscache in data) {
                                                data[obscache].deviceId.should.be.equal(deviceForeignKeys.deviceId.toString());
                                                data[obscache].value.should.be.equal(100 - obscache - 1);
                                            }

                                            redisHandler.KeyLength(key1, function (err, data) {
                                                redisHandler.getValuesFromKey(key1, 0, 100, function (err, data) {
                                                    redisHandler.getObservationsFromCache(key1, {returnAsObject: true}, function (err, data) {
                                                        if (err) consoleLogError.printErrorLog("must test findByIdAndUpdate and redis synchronization [ERROR] --> " + err);
                                                        _.isArray(data).should.be.equal(true);
                                                        data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                        for (obscache in data) {
                                                            data[obscache].deviceId.should.be.equal(device2ForeignKeys.deviceId.toString());
                                                            data[obscache].value.should.be.equal(10 - obscache - 1);
                                                        }

                                                        observationUtility.findByIdAndUpdate(deviceForeignKeys.observationId,{value:50}, function (err, updateObs) {
                                                            if (err) consoleLogError.printErrorLog("must test findByIdAndUpdate and redis synchronization [ERROR] --> " + err);
                                                            updateObs.should.have.properties("_id","value","deviceId","unitId","location");
                                                            updateObs.deviceId.toString().should.be.equal(key);
                                                            updateObs.value.should.be.equal(50);

                                                            // wait to redis Sync
                                                            setTimeout(function () {
                                                                redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                                                    if (err) consoleLogError.printErrorLog("must test findByIdAndUpdate and redis synchronization [ERROR] --> " + err);
                                                                    _.isArray(data).should.be.equal(true);
                                                                    data.length.should.be.equal(0);
                                                                    redisHandler.getObservationsFromCache(key1, {returnAsObject: true}, function (err, data) {
                                                                        if (err) consoleLogError.printErrorLog("must test findByIdAndUpdate and redis synchronization [ERROR] --> " + err);
                                                                        _.isArray(data).should.be.equal(true);
                                                                        data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                                        done();
                                                                    });
                                                                }, 100);
                                                            })
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        }, 500);
                    });
                });
            }else{
                done();
            }
        });
    });



    describe('observation Utility', function () {
        it('must test findByIdAndRemove and redis synchronization', function (done) {
            if(redisHandler.getRedisStatus()) {
                observationsDocuments.createDocuments(100, function (err, deviceForeignKeys) {
                    observationsDocuments.createDocuments(10, function (err, device2ForeignKeys) {
                        // wait to redis Sync
                        setTimeout(function () {
                            var key,key1;
                            redisHandler.getAllKey("*", function (err, data) {
                                key = deviceForeignKeys.deviceId.toString();
                                key1= device2ForeignKeys.deviceId.toString();
                                redisHandler.KeyLength(key, function (err, data) {
                                    redisHandler.getValuesFromKey(key, 0, 100, function (err, data) {
                                        redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                            if (err) consoleLogError.printErrorLog("must test findByIdAndRemove and redis synchronization [ERROR] --> " + err);
                                            _.isArray(data).should.be.equal(true);
                                            data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                            for (obscache in data) {
                                                data[obscache].deviceId.should.be.equal(deviceForeignKeys.deviceId.toString());
                                                data[obscache].value.should.be.equal(100 - obscache - 1);
                                            }

                                            redisHandler.KeyLength(key1, function (err, data) {
                                                redisHandler.getValuesFromKey(key1, 0, 100, function (err, data) {
                                                    redisHandler.getObservationsFromCache(key1, {returnAsObject: true}, function (err, data) {
                                                        if (err) consoleLogError.printErrorLog("must test findByIdAndRemove and redis synchronization [ERROR] --> " + err);
                                                        _.isArray(data).should.be.equal(true);
                                                        data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                        for (obscache in data) {
                                                            data[obscache].deviceId.should.be.equal(device2ForeignKeys.deviceId.toString());
                                                            data[obscache].value.should.be.equal(10 - obscache - 1);
                                                        }

                                                        observationUtility.findByIdAndRemove(deviceForeignKeys.observationId, function (err, updateObs) {
                                                            if (err) consoleLogError.printErrorLog("must test findByIdAndRemove and redis synchronization [ERROR] --> " + err);
                                                            updateObs.should.have.properties("_id","value","deviceId","unitId","location");
                                                            updateObs.deviceId.toString().should.be.equal(key);

                                                            // wait to redis Sync
                                                            setTimeout(function () {
                                                                redisHandler.getObservationsFromCache(key, {returnAsObject: true}, function (err, data) {
                                                                    if (err) consoleLogError.printErrorLog("must test findByIdAndRemove and redis synchronization [ERROR] --> " + err);
                                                                    _.isArray(data).should.be.equal(true);
                                                                    data.length.should.be.equal(0);
                                                                    redisHandler.getObservationsFromCache(key1, {returnAsObject: true}, function (err, data) {
                                                                        if (err) consoleLogError.printErrorLog("must test findByIdAndRemove and redis synchronization [ERROR] --> " + err);
                                                                        _.isArray(data).should.be.equal(true);
                                                                        data.length.should.be.equal(conf.cmcIoTOptions.observationsCacheItems);
                                                                        done();
                                                                    });
                                                                }, 100);
                                                            })
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        }, 500);
                    });
                });
            }else{
                done();
            }
        });
    });


});
