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
var db = require("../../connectionsHandler/mongooseConnection")
var Vendor = require('../../DBEngineHandler/drivers/vendorDriver')
var vendorDocuments = require('../SetTestenv/createVendorsDocuments')
var should = require('should/should')


describe('Vendors Model Test', function() {

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
        vendorDocuments.createDocuments(100, function(err) {
            if (err) throw err
            else done()
        })
    })


    afterEach(function(done) {
        vendorDocuments.deleteDocuments(function(err) {
            if (err) throw err
            done()
        })
    })


    describe('findAll({skip:2, limit:30})', function() {
        it('must include _metadata with correct values', function(done) {
            Vendor.findAll({}, null, {skip: 2, limit: 30}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.vendors.length.should.be.equal(30)
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
            Vendor.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.vendors.length.should.be.equal(30)
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
            Vendor.findAll({}, null, {skip: 0, limit: 10}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.vendors.length.should.be.equal(10)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(10)
                }
                done()
            })
        })
    })

    describe('findAll({skip:0, limit:10})', function() {
        it('must include _metadata with correct values', function(done) {
            Vendor.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.vendors.length.should.be.equal(10)
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
            Vendor.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.vendors.length.should.be.equal(100)
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
            Vendor.findAll({}, null, {skip: 0, limit: 2}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.vendors.length.should.be.equal(2)
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
            Vendor.findOne({}, null, function(err, vendor) {
                if (err) throw err
                else {
                    vendor.should.have.property('description')
                    vendor.should.have.property('name')
                }
                done()
            })
        })
    })


    describe('findById()', function() {
        it('must set findById', function(done) {
            Vendor.findOne({}, null, function(err, vendor) {
                if (err) throw err
                else {
                    vendor.should.have.property('name')
                    vendor.should.have.property('description')
                    Vendor.findById(vendor._id, "name disabled", function(err, vendorById) {
                        if (err) throw err
                        else {
                            vendorById.should.have.property('name')
                            should(vendorById.description).be.undefined()
                            vendorById._id.should.be.eql(vendor._id)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('removeVendor()', function() {
        it('must remove a vendor', function(done) {
            Vendor.findOne({}, null, function(err, vendor) {
                if (err) throw err
                else {
                    vendor.should.have.property('name')
                    vendor.should.have.property('description')
                    Vendor.findByIdAndRemove(vendor._id, function(err, removedVendor) {
                        should(err).be.null()
                        removedVendor._id.should.be.eql(vendor._id)
                        Vendor.findById(vendor._id, function(err, notFoundVendor) {
                            should(err).be.null()
                            should(notFoundVendor).be.null()
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateVendor()', function() {
        it('must update a Vendor', function(done) {
            Vendor.findOne({}, null, function(err, vendor) {
                if (err) throw err
                else {
                    vendor.should.have.property('name')
                    vendor.should.have.property('description')
                    var updatedName = "updatedName"
                    Vendor.findByIdAndUpdate(vendor._id, {name: updatedName}, function(err, updatedVendor) {
                        should(err).be.null()
                        updatedVendor._id.should.be.eql(vendor._id)
                        updatedVendor.name.should.be.eql(updatedName)
                        Vendor.findById(vendor._id, function(err, foundVendor) {
                            should(err).be.null()
                            should(foundVendor).be.not.null()
                            foundVendor.name.should.be.eql(updatedName)
                            foundVendor.name.should.be.not.eql(vendor.name)
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateVendor()', function() {
        it('must update a Vendor', function(done) {
            Vendor.findByIdAndUpdate(Vendor.ObjectId(), {name: "aa"}, function(err, updatedVendor) {
                should(err).be.null()
                should(updatedVendor).be.null()
                done()
            })
        })
    })


})
