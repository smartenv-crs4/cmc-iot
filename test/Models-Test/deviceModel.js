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
var Device = require('../../DBEngineHandler/drivers/deviceDriver');
var deviceDocuments = require('../SetTestenv/createDevicesDocuments');
var should = require('should/should');


describe('Devices Model Test', function () {

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
        deviceDocuments.createDocuments(100, function (err) {
            if (err) throw err;
            else done();
        });
    });


    afterEach(function (done) {
        Device.deleteMany(function (err, p) {
            if (err) throw err;
            done();
        });
    });


    describe('findAll({skip:2, limit:30})', function () {

        it('must include _metadata with correct values', function (done) {

            Device.findAll({}, null, {skip: 2, limit: 30}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(30);
                    results._metadata.skip.should.be.equal(2);
                    results._metadata.limit.should.be.equal(30);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(false);
                }
                done();
            });

        });

    });

    describe('findAll({skip:2, limit:30})', function () {

        it('must include _metadata with correct values', function (done) {

            Device.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(30);
                    results._metadata.skip.should.be.equal(2);
                    results._metadata.limit.should.be.equal(30);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(100);
                }
                done();
            });

        });

    });


    describe('findAll({skip:0, limit:10})', function () {

        it('must include _metadata with correct values', function (done) {
            Device.findAll({}, null, {skip: 0, limit: 10}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(10);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(10);

                }
                done();
            });

        });

    });

    describe('findAll({skip:0, limit:10})', function () {

        it('must include _metadata with correct values', function (done) {
            Device.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(10);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(10);
                    results._metadata.totalCount.should.be.equal(100);

                }
                done();
            });

        });

    });


    describe('findAll() no pagination', function () {

        it('must include _metadata with default values', function (done) {

            Device.findAll({}, null, null, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(100);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(-1);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(false);

                }
                done();
            });

        });

    });

    describe('findAll({skip:0, limit:2})', function () {

        it('must include _metadata with correct values and only 2 entries', function (done) {

            Device.findAll({}, null, {skip: 0, limit: 2}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(2);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(2);
                    results._metadata.should.have.property('totalCount')
                    results._metadata.totalCount.should.be.equal(false);
                    ;

                }
                done();

            });

        });

    });

    describe('findOne()', function () {

        it('must include all required properties', function (done) {

            Device.findOne({}, null, function (err, device) {

                if (err) throw err;
                else {
                    device.should.have.property('description');
                    device.should.have.property('name');
                    device.should.have.property('thingId');
                    device.should.have.property('typeId');
                    device.should.have.property('dismissed');
                    device.should.have.property('disabled');
                    device.dismissed.should.be.false();
                    device.disabled.should.be.false();
                }
                done();

            });

        });

    });


    describe('findById()', function () {

        it('must set findById', function (done) {

            Device.findOne({}, null, function (err, device) {

                if (err) throw err;
                else {
                    device.should.have.property('description');
                    device.should.have.property('name');
                    device.should.have.property('thingId');
                    device.should.have.property('typeId');
                    device.should.have.property('dismissed');
                    device.should.have.property('disabled');
                    device.dismissed.should.be.false();
                    device.disabled.should.be.false();
                    Device.findById(device._id, "description name disabled", function (err, deviceById) {

                        if (err) throw err;
                        else {
                            deviceById.should.have.property('description');
                            deviceById.should.have.property('name');
                            should(deviceById.thingId).be.undefined();
                            should(deviceById.typeId).be.undefined();
                            should(deviceById.dismissed).be.undefined();
                            deviceById.should.have.property('disabled');
                            deviceById.disabled.should.be.false();
                            deviceById._id.should.be.eql(device._id);
                        }
                        done();
                    });
                }
            });

        });

    });


    describe('removeDevice()', function () {

        it('must remove a device with no observations', function (done) {

            Device.findOne({}, null, function (err, device) {

                if (err) throw err;
                else {
                    device.should.have.property('description');
                    device.should.have.property('name');
                    device.should.have.property('thingId');
                    device.should.have.property('typeId');
                    device.should.have.property('dismissed');
                    device.should.have.property('disabled');
                    device.dismissed.should.be.false();
                    device.disabled.should.be.false();

                    Device.findByIdAndRemove(device._id, function (err, removedDevice) {
                        should(err).be.null();
                        removedDevice._id.should.be.eql(device._id);
                        Device.findById(device._id, function (err, notFoundDevice) {
                            should(err).be.null();
                            should(notFoundDevice).be.null();
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateDevice()', function () {

        it('must update a device', function (done) {

            Device.findOne({}, null, function (err, device) {

                if (err) throw err;
                else {
                    device.should.have.property('description');
                    device.should.have.property('name');
                    device.should.have.property('thingId');
                    device.should.have.property('typeId');
                    device.should.have.property('dismissed');
                    device.should.have.property('disabled');
                    device.dismissed.should.be.false();
                    device.disabled.should.be.false();
                    var updateName = "updateName";
                    Device.findByIdAndUpdate(device._id, {name: updateName}, function (err, updatedDevice) {
                        should(err).be.null();
                        updatedDevice._id.should.be.eql(device._id);
                        updatedDevice.name.should.be.eql(updateName);

                        Device.findById(device._id, function (err, findDevice) {
                            should(err).be.null();
                            should(findDevice).be.not.null();
                            findDevice.name.should.be.eql(updateName);
                            findDevice.name.should.be.not.eql(device.name);
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateDevice()', function () {

        it('must update a device', function (done) {

            Device.findByIdAndUpdate(Device.ObjectId(), {name: "aa"}, function (err, updatedDevice) {
                should(err).be.null();
                should(updatedDevice).be.null();
                done();
            });
        });
    });


});
