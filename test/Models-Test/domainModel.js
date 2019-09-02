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
var Domain = require('../../DBEngineHandler/drivers/domainDriver');
var domainDocuments = require('../SetTestenv/createDomainsDocuments');
var should = require('should/should');


describe('Domains Model Test', function () {

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
        domainDocuments.createDocuments(100, function (err) {
            if (err) throw err;
            else done();
        });
    });


    afterEach(function (done) {
        Domain.deleteMany(function (err, p) {
            if (err) throw err;
            done();
        });
    });


    describe('findAll({skip:2, limit:30})', function () {

        it('must include _metadata with correct values', function (done) {

            Domain.findAll({}, null, {skip: 2, limit: 30}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.domains.length.should.be.equal(30);
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

            Domain.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.domains.length.should.be.equal(30);
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
            Domain.findAll({}, null, {skip: 0, limit: 10}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.domains.length.should.be.equal(10);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(10);

                }
                done();
            });

        });

    });

    describe('findAll({skip:0, limit:10})', function () {

        it('must include _metadata with correct values', function (done) {
            Domain.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.domains.length.should.be.equal(10);
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

            Domain.findAll({}, null, null, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.domains.length.should.be.equal(100);
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

            Domain.findAll({}, null, {skip: 0, limit: 2}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.domains.length.should.be.equal(2);
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

            Domain.findOne({}, null, function (err, domain) {

                if (err) throw err;
                else {
                    domain.should.have.property('description');
                    domain.should.have.property('name');
                }
                done();

            });

        });

    });


    describe('findById()', function () {

        it('must set findById', function (done) {

            Domain.findOne({}, null, function (err, domain) {

                if (err) throw err;
                else {
                    domain.should.have.property('description');
                    domain.should.have.property('name');
                    Domain.findById(domain._id, "description", function (err, domainById) {

                        if (err) throw err;
                        else {
                            domainById.should.have.property('description');
                            should(domainById.name).be.undefined();
                            domainById._id.should.be.eql(domain._id);
                        }
                        done();
                    });
                }
            });

        });

    });


    describe('removeDomain()', function () {

        it('must remove a domain', function (done) {

            Domain.findOne({}, null, function (err, domain) {

                if (err) throw err;
                else {
                    domain.should.have.property('description');
                    domain.should.have.property('name');

                    Domain.findByIdAndRemove(domain._id, function (err, removedDomain) {
                        should(err).be.null();
                        removedDomain._id.should.be.eql(domain._id);
                        Domain.findById(domain._id, function (err, notFoundDomain) {
                            should(err).be.null();
                            should(notFoundDomain).be.null();
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateDomain()', function () {

        it('must update a domain', function (done) {

            Domain.findOne({}, null, function (err, domain) {

                if (err) throw err;
                else {
                    domain.should.have.property('description');
                    domain.should.have.property('name');
                    var updateName = "updateName";
                    Domain.findByIdAndUpdate(domain._id, {name: updateName}, function (err, updatedDomain) {
                        should(err).be.null();
                        updatedDomain._id.should.be.eql(domain._id);
                        updatedDomain.name.should.be.eql(updateName);

                        Domain.findById(domain._id, function (err, findDomain) {
                            should(err).be.null();
                            should(findDomain).be.not.null();
                            findDomain.name.should.be.eql(updateName);
                            findDomain.name.should.be.not.eql(domain.name);
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateDomain()', function () {

        it('must update a domain', function (done) {

            Domain.findByIdAndUpdate(Domain.ObjectId(), {name: "aa"}, function (err, updatedDomain) {
                should(err).be.null();
                should(updatedDomain).be.null();
                done();
            });
        });
    });

});
