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
var Unit = require('../../DBEngineHandler/drivers/unitDriver')
var unitDocuments = require('../SetTestenv/createUnitsDocuments')
var should = require('should/should');


describe('Unit Model Test', function() {

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
        unitDocuments.createDocuments(100, function(err) {
            if (err) throw err
            else done()
        })
    })


    afterEach(function(done) {
        unitDocuments.deleteDocuments(function(err, p) {
            if (err) throw err
            done()
        })
    })


    describe('findAll({skip:2, limit:30})', function() {
        it('must include _metadata with correct values', function(done) {
            Unit.findAll({}, null, {skip: 2, limit: 30}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.units.length.should.be.equal(30)
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
            Unit.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.units.length.should.be.equal(30)
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
            Unit.findAll({}, null, {skip: 0, limit: 10}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.units.length.should.be.equal(10)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(10)
                }
                done()
            })
        })
    })


    describe('findAll({skip:0, limit:10})', function() {
        it('must include _metadata with correct values', function(done) {
            Unit.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.units.length.should.be.equal(10)
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
            Unit.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.units.length.should.be.equal(100)
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
            Unit.findAll({}, null, {skip: 0, limit: 2}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.units.length.should.be.equal(2)
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
            Unit.findOne({}, null, function(err, unit) {
                if (err) throw err
                else {
                    unit.should.have.property('name')
                    unit.should.have.property('symbol')
                    unit.should.have.property('minValue')
                    unit.should.have.property('maxValue')
                }
                done()
            })
        })
    })


    describe('findById()', function() {
        it('must set findById', function(done) {
            Unit.findOne({}, null, function(err, unit) {
                if (err) throw err
                else {
                    unit.should.have.property('name')
                    unit.should.have.property('symbol')
                    unit.should.have.property('minValue')
                    unit.should.have.property('maxValue')
                    Unit.findById(unit._id, "name disabled", function(err, unitById) {
                        if (err) throw err
                        else {
                            unitById.should.have.property('name')
                            should(unitById.description).be.undefined()
                            unitById._id.should.be.eql(unit._id)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('removeUnit()', function() {
        it('must remove a Unit', function(done) {
            Unit.findOne({}, null, function(err, unit) {
                if (err) throw err
                else {
                    unit.should.have.property('name')
                    unit.should.have.property('symbol')
                    unit.should.have.property('minValue')
                    unit.should.have.property('maxValue')
                    Unit.findByIdAndRemove(unit._id, function(err, removedUnit) {
                        should(err).be.null()
                        removedUnit._id.should.be.eql(unit._id)
                        Unit.findById(unit._id, function(err, notFoundUnit) {
                            should(err).be.null()
                            should(notFoundUnit).be.null()
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateUnit()', function() {
        it('must update a Unit', function(done) {
            Unit.findOne({}, null, function(err, unit) {
                if (err) throw err
                else {
                    unit.should.have.property('name')
                    unit.should.have.property('symbol')
                    unit.should.have.property('minValue')
                    unit.should.have.property('maxValue')
                    var updatedName = "updatedName"
                    Unit.findByIdAndUpdate(unit._id, {name: updatedName}, function(err, updatedUnit) {
                        should(err).be.null()
                        updatedUnit._id.should.be.eql(unit._id)
                        updatedUnit.name.should.be.eql(updatedName)
                        Unit.findById(unit._id, function(err, foundUnit) {
                            should(err).be.null()
                            should(foundUnit).be.not.null()
                            foundUnit.name.should.be.eql(updatedName)
                            foundUnit.name.should.be.not.eql(unit.name)
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateUnit()', function() {
        it('must update a Unit', function(done) {
            Unit.findByIdAndUpdate(Unit.ObjectId(), {name: "aa"}, function(err, updatedUnit) {
                should(err).be.null()
                should(updatedUnit).be.null()
                done()
            })
        })
    })

})
