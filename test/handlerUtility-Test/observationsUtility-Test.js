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

var db = require("../../DBEngineHandler/models/mongooseConnection");
var unitDriver = require('../../DBEngineHandler/drivers/unitDriver');
var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver');
var observedPropertyDriver = require('../../DBEngineHandler/drivers/observedPropertyDriver.js');
var unitsDriver = require('../../DBEngineHandler/drivers/unitDriver.js');
var deviceDocuments = require('../SetTestenv/createDevicesDocuments');
var observationUtility=require('../../routes/routesHandlers/handlerUtility/observationUtility');
var consoleLogError = require('../Utility/errorLogs');
var should = require('should/should');
var validUnits={first:null,second:null};
var deviceIdResource;
var typeIdResource;


describe('Observations Model Test', function () {

    before(function (done) {

        db.connect(function () {
            done();
        });
    });

    after(function (done) {

        db.disconnect(function () {
            done();
        });
    });


    beforeEach(function (done) {
        deviceDocuments.createDocuments(100, function (err,deviceId,deviceTypeId,observedPropertyId) {
            if (err) throw err;
            else {
                deviceIdResource=deviceId;
                typeIdResource=deviceTypeId;
                unitDriver.create({
                    name: "name",
                    symbol: "symbol",
                    minValue: 0,
                    maxValue: 10,
                    observedPropertyId: observedPropertyId
                },function(err,unitId){
                    validUnits.first=unitId;
                    unitDriver.create({
                        name: "nameBis",
                        symbol: "symbolBis",
                        minValue: 0,
                        maxValue: 100,
                        observedPropertyId: observedPropertyId
                    },function(err,unitIdBis){
                        validUnits.second=unitIdBis;
                        done()
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
                    done();
                });
            }else{
                throw err;
            }
        });

    });




    describe('observation checkIfValid', function () {

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


    describe('observation checkIfValid', function () {

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


    describe('observation checkIfValid', function () {

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

    describe('observation checkIfValid', function () {

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

    describe('observation checkIfValid', function () {

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


    describe('observation checkIfValid', function () {

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


});
