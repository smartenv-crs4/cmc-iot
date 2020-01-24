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
var ApiAction = require('../../DBEngineHandler/drivers/apiActionDriver');
var apiActionDocuments = require('../SetTestenv/createApiActionsDocuments');
var should = require('should/should');


describe('ApiActions Model Test', function () {

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
        apiActionDocuments.createDocuments(100, function (err) {
            if (err) throw err;
            else done();
        });
    });


    afterEach(function (done) {
        apiActionDocuments.deleteDocuments(function (err) {
            if (err) throw err;
            done();
        });
    });


    describe('findAll({skip:2, limit:30})', function () {

        it('must include _metadata with correct values', function (done) {

            ApiAction.findAll({}, null, {skip: 2, limit: 30}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.apiActions.length.should.be.equal(30);
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

            ApiAction.findAll({}, null, {skip: 2, limit: 30, totalCount: true}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.apiActions.length.should.be.equal(30);
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
            ApiAction.findAll({}, null, {skip: 0, limit: 10}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.apiActions.length.should.be.equal(10);
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(10);

                }
                done();
            });

        });

    });

    describe('findAll({skip:0, limit:10})', function () {

        it('must include _metadata with correct values', function (done) {
            ApiAction.findAll({}, null, {skip: 0, limit: 10, totalCount: true}, function (err, results) {
                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.apiActions.length.should.be.equal(10);
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

            ApiAction.findAll({}, null, null, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.apiActions.length.should.be.equal(100);
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

            ApiAction.findAll({}, null, {skip: 0, limit: 2}, function (err, results) {

                if (err) throw err;
                else {
                    results.should.have.property('_metadata');
                    results.apiActions.length.should.be.equal(2);
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

            ApiAction.findOne({}, null, function (err, apiAction) {

                if (err) throw err;
                else {
                    apiAction.should.have.property('actionName');
                    apiAction.should.have.property('method');
                    apiAction.should.have.property('header');
                    apiAction.should.have.property('bodyPrototype');
                    apiAction.should.have.property('deviceTypeId');
                    apiAction.header.should.have.property('Content-Type');
                    apiAction.header["Content-Type"].should.be.eql("application/json");
                    apiAction.header.should.have.property('Accept');
                    apiAction.header.Accept.should.be.eql("application/json");
                    apiAction.bodyPrototype.should.have.property("field");
                }
                done();
            });
        });
    });


    describe('findById()', function () {

        it('must test findById', function (done) {

            ApiAction.findOne({}, null, function (err, apiAction) {

                if (err) throw err;
                else {
                    apiAction.should.have.property('actionName');
                    apiAction.should.have.property('method');
                    apiAction.should.have.property('header');
                    apiAction.should.have.property('bodyPrototype');
                    apiAction.should.have.property('deviceTypeId');
                    apiAction.header.should.have.property('Content-Type');
                    apiAction.header["Content-Type"].should.be.eql("application/json");
                    apiAction.header.should.have.property('Accept');
                    apiAction.header.Accept.should.be.eql("application/json");
                    apiAction.bodyPrototype.should.have.property("field");
                    ApiAction.findById(apiAction._id, "actionName method", function (err, apiActionById) {

                        if (err) throw err;
                        else {
                            apiActionById.should.have.property('actionName');
                            apiActionById.should.have.property('method');
                            should(apiActionById.header).be.undefined();
                            should(apiActionById.bodyPrototype).be.undefined();
                            should(apiActionById.deviceTypeId).be.undefined();
                        }
                        done();
                    });
                }
            });

        });

    });


    describe('removeApiAction()', function () {

        it('must remove a apiAction', function (done) {

            ApiAction.findOne({}, null, function (err, apiAction) {

                if (err) throw err;
                else {
                    apiAction.should.have.property('actionName');
                    apiAction.should.have.property('method');
                    apiAction.should.have.property('header');
                    apiAction.should.have.property('bodyPrototype');
                    apiAction.should.have.property('deviceTypeId');
                    apiAction.header.should.have.property('Content-Type');
                    apiAction.header["Content-Type"].should.be.eql("application/json");
                    apiAction.header.should.have.property('Accept');
                    apiAction.header.Accept.should.be.eql("application/json");
                    apiAction.bodyPrototype.should.have.property("field");

                    ApiAction.findByIdAndRemove(apiAction._id, function (err, removedApiAction) {
                        should(err).be.null();
                        removedApiAction._id.should.be.eql(apiAction._id);
                        ApiAction.findById(apiAction._id, function (err, notFoundApiAction) {
                            should(err).be.null();
                            should(notFoundApiAction).be.null();
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateApiAction()', function () {

        it('must update a apiAction', function (done) {

            ApiAction.findOne({}, null, function (err, apiAction) {

                if (err) throw err;
                else {
                    apiAction.should.have.property('actionName');
                    apiAction.should.have.property('method');
                    apiAction.should.have.property('header');
                    apiAction.should.have.property('bodyPrototype');
                    apiAction.should.have.property('deviceTypeId');
                    apiAction.header.should.have.property('Content-Type');
                    apiAction.header["Content-Type"].should.be.eql("application/json");
                    apiAction.header.should.have.property('Accept');
                    apiAction.header.Accept.should.be.eql("application/json");
                    apiAction.bodyPrototype.should.have.property("field");
                    var updateName = "updateName";
                    ApiAction.findByIdAndUpdate(apiAction._id, {actionName: updateName}, function (err, updatedApiAction) {
                        should(err).be.null();
                        updatedApiAction._id.should.be.eql(apiAction._id);
                        updatedApiAction.actionName.should.be.eql(updateName);

                        ApiAction.findById(apiAction._id, function (err, findApiAction) {
                            should(err).be.null();
                            should(findApiAction).be.not.null();
                            findApiAction.actionName.should.be.eql(updateName);
                            findApiAction.actionName.should.be.not.eql(apiAction.actionName);
                            done();
                        });
                    });
                }
            });
        });
    });


    describe('updateApiAction()', function () {

        it('must update a apiAction (no apiAction with this _id to update)', function (done) {

            ApiAction.findByIdAndUpdate(ApiAction.ObjectId(), {actionName: "aa"}, function (err, updatedApiAction) {
                should(err).be.null();
                should(updatedApiAction).be.null();
                done();
            });
        });
    });


});
