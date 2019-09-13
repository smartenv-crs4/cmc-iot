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
var Observation = require('../../DBEngineHandler/drivers/observationDriver');
var observationDocuments = require('../SetTestenv/createObservationsDocuments');
var should = require('should/should');


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
        observationDocuments.createDocuments(100, function (err) {
            if (err) throw err;
            else done();
        });
    });


    afterEach(function (done) {
        Observation.deleteMany(function (err, p) {
            if (err) throw err;
            done();
        });
    });


    describe('findAll({skip:2, limit:30})', function () {

        it('must include _metadata with correct values', function (done) {

            Observation.findAll({}, null, {skip: 2, limit: 30}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(30);
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

            Observation.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(30);
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
            Observation.findAll({}, null, {skip: 0, limit: 10}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(10);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(10);

                }
                done();
            });

        });

    });

    describe('findAll({skip:0, limit:10})', function () {

        it('must include _metadata with correct values', function (done) {
            Observation.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(10);
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

            Observation.findAll({}, null, null, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(100);
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

            Observation.findAll({}, null, {skip: 0, limit: 2}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.observations.length.should.be.equal(2);
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

            Observation.findOne({}, null, function (err, observation) {

                if (err) throw err;
                else {
                    observation.should.have.property('timestamp');
                    observation.should.have.property('value');
                    observation.should.have.property('deviceId');
                    observation.should.have.property('unitId');
                }
                done();

            });

        });

    });


    describe('findById()', function () {

        it('must set findById', function (done) {

            Observation.findOne({}, null, function (err, observation) {

                if (err) throw err;
                else {
                    observation.should.have.property('timestamp');
                    observation.should.have.property('value');
                    observation.should.have.property('deviceId');
                    observation.should.have.property('unitId');
                    Observation.findById(observation._id, "value", function (err, observationById) {

                        if (err) throw err;
                        else {
                            observationById.should.have.property('value');
                            should(observationById.deviceId).be.undefined();
                            should(observationById.unitId).be.undefined();
                            should(observationById.dismissed).be.undefined();
                            observationById._id.should.be.eql(observation._id);
                        }
                        done();
                    });
                }
            });

        });

    });


    describe('removeObservation()', function () {

        it('must remove a observation with no observations', function (done) {

            Observation.findOne({}, null, function (err, observation) {

                if (err) throw err;
                else {
                    observation.should.have.property('timestamp');
                    observation.should.have.property('value');
                    observation.should.have.property('deviceId');
                    observation.should.have.property('unitId');
                    Observation.findByIdAndRemove(observation._id, function (err, removedObservation) {
                        should(err).be.null();
                        removedObservation._id.should.be.eql(observation._id);
                        Observation.findById(observation._id, function (err, notFoundObservation) {
                            should(err).be.null();
                            should(notFoundObservation).be.null();
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateObservation()', function () {

        it('must update a observation', function (done) {

            Observation.findOne({}, null, function (err, observation) {

                if (err) throw err;
                else {
                    observation.should.have.property('timestamp');
                    observation.should.have.property('value');
                    observation.should.have.property('deviceId');
                    observation.should.have.property('unitId');
                    var updateValue = 3;
                    Observation.findByIdAndUpdate(observation._id, {value: updateValue}, function (err, updatedObservation) {
                        should(err).be.null();
                        updatedObservation._id.should.be.eql(observation._id);
                        updatedObservation.value.should.be.eql(updateValue);

                        Observation.findById(observation._id, function (err, findObservation) {
                            should(err).be.null();
                            should(findObservation).be.not.null();
                            findObservation.value.should.be.eql(updateValue);
                            findObservation.value.should.be.not.eql(observation.value);
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateObservation()', function () {

        it('must update a observation', function (done) {

            Observation.findByIdAndUpdate(Observation.ObjectId(), {value: 0}, function (err, updatedObservation) {
                should(err).be.null();
                should(updatedObservation).be.null();
                done();
            });
        });
    });


});
