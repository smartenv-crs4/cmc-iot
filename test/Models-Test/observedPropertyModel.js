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
var ObservedProperty = require('../../DBEngineHandler/drivers/observedPropertyDriver')
var observedPropertyDocuments = require('../SetTestenv/createObservedPropertiesDocuments')
var should = require('should/should')


describe('ObservedProperty Model Test', function() {

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
        observedPropertyDocuments.createDocuments(100, function(err) {
            if (err) throw err
            else done()
        })
    })


    afterEach(function(done) {
        ObservedProperty.deleteMany(function(err, p) {
            if (err) throw err
            done()
        })
    })


    describe('findAll({skip:2, limit:30})', function() {
        it('must include _metadata with correct values', function(done) {
            ObservedProperty.findAll({}, null, {skip: 2, limit: 30}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.observedProperties.length.should.be.equal(30)
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
            ObservedProperty.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.observedProperties.length.should.be.equal(30)
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
            ObservedProperty.findAll({}, null, {skip: 0, limit: 10}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.observedProperties.length.should.be.equal(10)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(10)
                }
                done()
            })
        })
    })

    describe('findAll({skip:0, limit:10})', function() {
        it('must include _metadata with correct values', function(done) {
            ObservedProperty.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.observedProperties.length.should.be.equal(10)
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
            ObservedProperty.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.observedProperties.length.should.be.equal(100)
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
            ObservedProperty.findAll({}, null, {skip: 0, limit: 2}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.observedProperties.length.should.be.equal(2)
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
            ObservedProperty.findOne({}, null, function(err, observedProperty) {
                if (err) throw err
                else {
                    observedProperty.should.have.property('description')
                    observedProperty.should.have.property('name')
                }
                done()
            })
        })
    })


    describe('findById()', function() {
        it('must set findById', function(done) {
            ObservedProperty.findOne({}, null, function(err, observedProperty) {
                if (err) throw err
                else {
                    observedProperty.should.have.property('name')
                    observedProperty.should.have.property('description')
                    ObservedProperty.findById(observedProperty._id, "name disabled", function(err, observedPropertyById) {
                        if (err) throw err
                        else {
                            observedPropertyById.should.have.property('name')
                            should(observedPropertyById.description).be.undefined()
                            observedPropertyById._id.should.be.eql(observedProperty._id)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('removeObservedProperty()', function() {
        it('must remove a observedProperty', function(done) {
            ObservedProperty.findOne({}, null, function(err, observedProperty) {
                if (err) throw err
                else {
                    observedProperty.should.have.property('name')
                    observedProperty.should.have.property('description')
                    ObservedProperty.findByIdAndRemove(observedProperty._id, function(err, removedObservedProperty) {
                        should(err).be.null()
                        removedObservedProperty._id.should.be.eql(observedProperty._id)
                        ObservedProperty.findById(observedProperty._id, function(err, notFoundObservedProperty) {
                            should(err).be.null()
                            should(notFoundObservedProperty).be.null()
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateObservedProperty()', function() {
        it('must update an ObservedProperty', function(done) {
            ObservedProperty.findOne({}, null, function(err, observedProperty) {
                if (err) throw err
                else {
                    observedProperty.should.have.property('name')
                    observedProperty.should.have.property('description')
                    var updatedName = "updatedName"
                    ObservedProperty.findByIdAndUpdate(observedProperty._id, {name: updatedName}, function(err, updatedObservedProperty) {
                        should(err).be.null()
                        updatedObservedProperty._id.should.be.eql(observedProperty._id)
                        updatedObservedProperty.name.should.be.eql(updatedName)
                        ObservedProperty.findById(observedProperty._id, function(err, foundObservedProperty) {
                            should(err).be.null()
                            should(foundObservedProperty).be.not.null()
                            foundObservedProperty.name.should.be.eql(updatedName)
                            foundObservedProperty.name.should.be.not.eql(observedProperty.name)
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateObservedProperty()', function() {
        it('must update an ObservedProperty', function(done) {
            ObservedProperty.findByIdAndUpdate(ObservedProperty.ObjectId(), {name: "aa"}, function(err, updatedObservedProperty) {
                should(err).be.null()
                should(updatedObservedProperty).be.null()
                done()
            })
        })
    })


})
