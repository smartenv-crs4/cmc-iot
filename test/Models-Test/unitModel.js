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


var _ = require('underscore')._
var db = require("../../DBEngineHandler/models/mongooseConnection")
var DeviceType = require('../../DBEngineHandler/drivers/deviceTypeDriver')
var deviceTypeDocuments = require('../SetTestenv/createDeviceTypesDocuments')
var should = require('should/should');


describe('DeviceTypes Model Test', function() {

    before(function(done) {
        db.connect(function() {
            done()
        })
    })


    after(function(done) {
        db.disconnect(function() {
            done()
        })
    })


    beforeEach(function(done) {
        deviceTypeDocuments.createDocuments(100, function(err) {
            if (err) throw err
            else done()
        })
    })


    afterEach(function(done) {
        DeviceType.deleteMany(function(err, p) {
            if (err) throw err
            done()
        })
    })


    describe('findAll({skip:2, limit:30})', function() {
        it('must include _metadata with correct values', function(done) {
            DeviceType.findAll({}, null, {skip: 2, limit: 30}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.deviceTypes.length.should.be.equal(30)
                    results._metadata.skip.should.be.equal(2)
                    results._metadata.limit.should.be.equal(30)
                    results._metadata.should.have.property('totalCount')
                    results._metadata.totalCount.should.be.equal(false)
                }
                done()
            })
        })
    })


    describe('findAll({skip:2, limit:30})', function() {
        it('must include _metadata with correct values', function(done) {
            DeviceType.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.deviceTypes.length.should.be.equal(30)
                    results._metadata.skip.should.be.equal(2)
                    results._metadata.limit.should.be.equal(30)
                    results._metadata.should.have.property('totalCount')
                    results._metadata.totalCount.should.be.equal(100)
                }
                done()
            })
        })
    })


    describe('findAll({skip:0, limit:10})', function() {
        it('must include _metadata with correct values', function(done) {
            DeviceType.findAll({}, null, {skip: 0, limit: 10}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.deviceTypes.length.should.be.equal(10)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(10)
                }
                done()
            })
        })
    })


    describe('findAll({skip:0, limit:10})', function() {
        it('must include _metadata with correct values', function(done) {
            DeviceType.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.deviceTypes.length.should.be.equal(10)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(10)
                    results._metadata.totalCount.should.be.equal(100)
                }
                done()
            })
        })
    })


    describe('findAll() no pagination', function() {
        it('must include _metadata with default values', function(done) {
            DeviceType.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.deviceTypes.length.should.be.equal(100)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(-1)
                    results._metadata.should.have.property('totalCount')
                    results._metadata.totalCount.should.be.equal(false)
                }
                done()
            })
        })
    })


    describe('findAll({skip:0, limit:2})', function() {
        it('must include _metadata with correct values and only 2 entries', function(done) {
            DeviceType.findAll({}, null, {skip: 0, limit: 2}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.deviceTypes.length.should.be.equal(2)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(2)
                    results._metadata.should.have.property('totalCount')
                    results._metadata.totalCount.should.be.equal(false)
                }
                done()
            })
        })
    })


    describe('findOne()', function() {
        it('must include all required properties', function(done) {
            DeviceType.findOne({}, null, function(err, deviceType) {
                if (err) throw err
                else {
                    deviceType.should.have.property('description')
                    deviceType.should.have.property('name')
                    deviceType.should.have.property('observedPropertyId')
                }
                done()
            })
        })
    })


    describe('findById()', function() {
        it('must set findById', function(done) {
            DeviceType.findOne({}, null, function(err, deviceType) {
                if (err) throw err
                else {
                    deviceType.should.have.property('description')
                    deviceType.should.have.property('name')
                    deviceType.should.have.property('observedPropertyId')
                    DeviceType.findById(deviceType._id, "description name disabled", function(err, deviceTypeById) {
                        if (err) throw err
                        else {
                            deviceTypeById.should.have.property('name')
                            deviceTypeById.should.have.property('description')
                            should(deviceTypeById.observedPropertyId).be.undefined()
                            deviceTypeById._id.should.be.eql(deviceType._id)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('removeDeviceType()', function() {
        it('must remove a deviceType', function(done) {
            DeviceType.findOne({}, null, function(err, deviceType) {
                if (err) throw err
                else {
                    deviceType.should.have.property('name')
                    deviceType.should.have.property('description')
                    deviceType.should.have.property('observedPropertyId')
                    DeviceType.findByIdAndRemove(deviceType._id, function(err, removedDeviceType) {
                        should(err).be.null()
                        removedDeviceType._id.should.be.eql(deviceType._id)
                        DeviceType.findById(deviceType._id, function(err, notFoundDeviceType) {
                            should(err).be.null()
                            should(notFoundDeviceType).be.null()
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateDeviceType()', function() {
        it('must update a deviceType', function(done) {
            DeviceType.findOne({}, null, function(err, deviceType) {
                if (err) throw err
                else {
                    deviceType.should.have.property('description')
                    deviceType.should.have.property('name')
                    deviceType.should.have.property('observedPropertyId')
                    var updateName = "updateName"
                    DeviceType.findByIdAndUpdate(deviceType._id, {name: updateName}, function(err, updatedDeviceType) {
                        should(err).be.null()
                        updatedDeviceType._id.should.be.eql(deviceType._id)
                        updatedDeviceType.name.should.be.eql(updateName)
                        DeviceType.findById(deviceType._id, function(err, findDeviceType) {
                            should(err).be.null()
                            should(findDeviceType).be.not.null()
                            findDeviceType.name.should.be.eql(updateName)
                            findDeviceType.name.should.be.not.eql(deviceType.name)
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateDeviceType()', function() {
        it('must update a deviceType', function(done) {
            DeviceType.findByIdAndUpdate(DeviceType.ObjectId(), {name: "aa"}, function(err, updatedDeviceType) {
                should(err).be.null()
                should(updatedDeviceType).be.null()
                done()
            })
        })
    })

})
