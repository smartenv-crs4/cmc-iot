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
var Vendor = require('../../DBEngineHandler/drivers/vendorDriver')
var vendorDocuments = require('../SetTestenv/createVendorsDocuments')
var should = require('should/should');


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
        Vendor.deleteMany(function(err, p) {
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


    // describe('removeVendor()', function() {
    //
    //     it('must remove a vendor with no observations', function(done) {
    //         Vendor.findOne({}, null, function(err, vendor){
    //             if(err) throw err;
    //             else{
    //                 vendor.should.have.property('description');
    //                 vendor.should.have.property('name');
    //                 Vendor.findByIdAndRemove(vendor._id, function(err, removedVendor) {
    //                     should(err).be.null();
    //                     removedVendor._id.should.be.eql(device._id);
    //                     Vendor.findById(device._id, function(err, notFoundDevice) {
    //                         should(err).be.null();
    //                         should(notFoundDevice).be.null();
    //                         done();
    //                     })
    //                 })
    //             }
    //         })
    //     })
    // })


})
