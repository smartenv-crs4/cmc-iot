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
var DeviceType_Domain = require('../../DBEngineHandler/drivers/deviceType_domainDriver');
var deviceType_domainDocuments = require('../SetTestenv/createDeviceTypes_DomainsDocuments');
var should = require('should/should');


describe('DeviceType_Domains Model Test', function () {

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
        deviceType_domainDocuments.createDocuments(100, function (err) {
            if (err) throw err;
            else done();
        });
    });


    afterEach(function (done) {
        deviceType_domainDocuments.deleteDocuments(function (err) {
            if (err) throw err;
            done();
        });
    });


    describe('findAll({skip:2, limit:30})', function () {

        it('must include _metadata with correct values', function (done) {

            DeviceType_Domain.findAll({}, null, {skip: 2, limit: 30}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.deviceType_domains.length.should.be.equal(30);
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

            DeviceType_Domain.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.deviceType_domains.length.should.be.equal(30);
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
            DeviceType_Domain.findAll({}, null, {skip: 0, limit: 10}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.deviceType_domains.length.should.be.equal(10);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(10);

                }
                done();
            });

        });

    });

    describe('findAll({skip:0, limit:10})', function () {

        it('must include _metadata with correct values', function (done) {
            DeviceType_Domain.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.deviceType_domains.length.should.be.equal(10);
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

            DeviceType_Domain.findAll({}, null, null, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.deviceType_domains.length.should.be.equal(100);
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

            DeviceType_Domain.findAll({}, null, {skip: 0, limit: 2}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.deviceType_domains.length.should.be.equal(2);
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

            DeviceType_Domain.findOne({}, null, function (err, deviceType_domain) {

                if (err) throw err;
                else {
                    deviceType_domain.should.have.property('domainId');
                    deviceType_domain.should.have.property('deviceTypeId');
                }
                done();

            });

        });

    });


    describe('findById()', function () {

        it('must set findById', function (done) {

            DeviceType_Domain.findOne({}, null, function (err, deviceType_domain) {

                if (err) throw err;
                else {
                    deviceType_domain.should.have.property('domainId');
                    deviceType_domain.should.have.property('deviceTypeId');;
                    DeviceType_Domain.findById(deviceType_domain._id, "domainId", function (err, deviceType_domainById) {

                        if (err) throw err;
                        else {
                            deviceType_domainById.should.have.property('domainId');
                            should(deviceType_domainById.deviceTypeID).be.undefined();
                            deviceType_domainById._id.should.be.eql(deviceType_domain._id);
                        }
                        done();
                    });
                }
            });

        });

    });


    describe('removeDeviceType_Domain()', function () {

        it('must remove a deviceType_domain', function (done) {

            DeviceType_Domain.findOne({}, null, function (err, deviceType_domain) {

                if (err) throw err;
                else {
                    deviceType_domain.should.have.property('domainId');
                    deviceType_domain.should.have.property('deviceTypeId');

                    DeviceType_Domain.findByIdAndRemove(deviceType_domain._id, function (err, removedDeviceType_Domain) {
                        should(err).be.null();
                        removedDeviceType_Domain._id.should.be.eql(deviceType_domain._id);
                        DeviceType_Domain.findById(deviceType_domain._id, function (err, notFoundDeviceType_Domain) {
                            should(err).be.null();
                            should(notFoundDeviceType_Domain).be.null();
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateDeviceType_Domain()', function () {

        it('must update a deviceType_domain', function (done) {

            DeviceType_Domain.findOne({}, null, function (err, deviceType_domain) {

                if (err) throw err;
                else {
                    deviceType_domain.should.have.property('domainId');
                    deviceType_domain.should.have.property('deviceTypeId');
                    var updatedeviceTypeId = DeviceType_Domain.ObjectId();
                    DeviceType_Domain.findByIdAndUpdate(deviceType_domain._id, {deviceTypeId: updatedeviceTypeId}, function (err, updatedDeviceType_Domain) {
                        should(err).be.null();
                        updatedDeviceType_Domain._id.should.be.eql(deviceType_domain._id);
                        updatedDeviceType_Domain.deviceTypeId.should.be.eql(updatedeviceTypeId);

                        DeviceType_Domain.findById(deviceType_domain._id, function (err, findDeviceType_Domain) {
                            should(err).be.null();
                            should(findDeviceType_Domain).be.not.null();
                            findDeviceType_Domain.deviceTypeId.should.be.eql(updatedeviceTypeId);
                            findDeviceType_Domain.deviceTypeId.should.be.not.eql(deviceType_domain.deviceTypeId);
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateDeviceType_Domain()', function () {

        it('must update a deviceType_domain', function (done) {

            DeviceType_Domain.findByIdAndUpdate(DeviceType_Domain.ObjectId(), {deviceTypeId: DeviceType_Domain.ObjectId()}, function (err, updatedDeviceType_Domain) {
                should(err).be.null();
                should(updatedDeviceType_Domain).be.null();
                done();
            });
        });
    });


    describe('Create DeviceType_Domain()', function () {

        it('must test unique domainId,deviceTypeId', function (done) {
            var id=DeviceType_Domain.ObjectId();
            DeviceType_Domain.create({deviceTypeId:id,domainId:id},function(err,data){
                should(err).be.null();
                data.deviceTypeId.should.be.eql(id);
                data.domainId.should.be.eql(id);
                DeviceType_Domain.create({deviceTypeId:id,domainId:id},function(err,data){
                    should(err).be.not.null();
                    err.message.indexOf("duplicate key error").should.be.greaterThanOrEqual(0);
                    done();
                });
            });
        });
    });



});
