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
var Site = require('../../DBEngineHandler/drivers/siteDriver')
var siteDocuments = require('../SetTestenv/createSitesDocuments')
var should = require('should/should');


describe('Site Model Test', function() {

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
        siteDocuments.createDocuments(100, function(err) {
            if (err) throw err
            else done()
        })
    })


    afterEach(function(done) {
        siteDocuments.deleteDocuments(function(err, p) {
            if (err) throw err
            done()
        })
    })


    describe('findAll({skip:2, limit:30})', function() {
        it('must include _metadata with correct values', function(done) {
            Site.findAll({}, null, {skip: 2, limit: 30}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.sites.length.should.be.equal(30)
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
            Site.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.sites.length.should.be.equal(30)
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
            Site.findAll({}, null, {skip: 0, limit: 10}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.sites.length.should.be.equal(10)
                    results._metadata.skip.should.be.equal(0)
                    results._metadata.limit.should.be.equal(10)
                }
                done()
            })
        })
    })


    describe('findAll({skip:0, limit:10})', function() {
        it('must include _metadata with correct values', function(done) {
            Site.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.sites.length.should.be.equal(10)
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
            Site.findAll({}, null, null, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.sites.length.should.be.equal(100)
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
            Site.findAll({}, null, {skip: 0, limit: 2}, function(err, results) {
                if (err) throw err
                else {
                    results.should.have.property('_metadata')
                    results.sites.length.should.be.equal(2)
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
            Site.findOne({}, null, function(err, site) {
                if (err) throw err
                else {
                    site.should.have.property('name')
                    site.should.have.property('description')
                    site.should.have.property('location')
                    site.should.have.property('locatedInSiteId')
                }
                done()
            })
        })
    })


    describe('findById()', function() {
        it('must set findById', function(done) {
            Site.findOne({}, null, function(err, site) {
                if (err) throw err
                else {
                    site.should.have.property('name')
                    site.should.have.property('description')
                    site.should.have.property('location')
                    site.should.have.property('locatedInSiteId')
                    Site.findById(site._id, "description name disabled", function(err, siteById) {
                        if (err) throw err
                        else {
                            siteById.should.have.property('name')
                            siteById.should.have.property('description')
                            siteById.should.have.property('location')
                            should(siteById.observedPropertyId).be.undefined()
                            siteById._id.should.be.eql(site._id)
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('removeSite()', function() {
        it('must remove a site', function(done) {
            Site.findOne({}, null, function(err, site) {
                if (err) throw err
                else {
                    site.should.have.property('name')
                    site.should.have.property('description')
                    site.should.have.property('location')
                    site.should.have.property('locatedInSiteId')
                    Site.findByIdAndRemove(site._id, function(err, removedSite) {
                        should(err).be.null()
                        removedSite._id.should.be.eql(site._id)
                        Site.findById(site._id, function(err, notFoundSite) {
                            should(err).be.null()
                            should(notFoundSite).be.null()
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateSite()', function() {
        it('must update a site', function(done) {
            Site.findOne({}, null, function(err, site) {
                if (err) throw err
                else {
                    site.should.have.property('name')
                    site.should.have.property('description')
                    site.should.have.property('location')
                    site.should.have.property('locatedInSiteId')
                    var updateName = "updateName"
                    Site.findByIdAndUpdate(site._id, {name: updateName}, function(err, updatedSite) {
                        should(err).be.null()
                        updatedSite._id.should.be.eql(site._id)
                        updatedSite.name.should.be.eql(updateName)
                        Site.findById(site._id, function(err, findSite) {
                            should(err).be.null()
                            should(findSite).be.not.null()
                            findSite.name.should.be.eql(updateName)
                            findSite.name.should.be.not.eql(site.name)
                            done()
                        })
                    })
                }
            })
        })
    })


    describe('updateSite()', function() {
        it('must update a site', function(done) {
            Site.findByIdAndUpdate(Site.ObjectId(), {name: "aa"}, function(err, updatedSite) {
                should(err).be.null()
                should(updatedSite).be.null()
                done()
            })
        })
    })

})
