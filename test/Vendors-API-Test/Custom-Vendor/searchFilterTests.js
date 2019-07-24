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


var should = require('should/should');
var _ = require('underscore')._;
var async = require('async');
var Vendors = require('../../../DBEngineHandler/drivers/vendorDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort +"/vendors" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var Vendor = require('../../../DBEngineHandler/models/vendors').Vendor;

var webUiToken;
var vendorId;


describe('Vendors API Test - [SEARCH FILTERS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done()
        })
    })


    after(function (done) {
        Vendors.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("Vendor searchFilterTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Vendor searchFilterTests.js - after - resetAuthMsStatus ---> " + err);
                done()
            })
        })
    })


    beforeEach(function (done) {
        var range = _.range(100);
        async.each(range, function (e, cb) {
            Vendors.create({
                name:"name" + e,
                description:"description" +e
            }, function (err, newVendor) {
                if (err) consoleLogError.printErrorLog("Vendor searchFilterTests.js - beforeEach - Vendors.create ---> " + err);
                if(e===1) vendorId=newVendor._id;
                cb()
            })
        }, function (err) {
            done()
        })
    })


    afterEach(function (done) {
        Vendors.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor searchFilterTests.js - afterEach - deleteMany ---> " + err);
            done()
        })
    })


    describe('GET /vendors', function () {
        it('must test API compliance to field selection: fields projection [name]', function (done) {
            request.get({
                url: APIURL + '?fields=name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {
                if(error) consoleLogError.printErrorLog("GET /vendors: 'must test API compliance to field selection: fields projection [name]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('_metadata');
                    results.should.have.property('vendors');
                    results._metadata.totalCount.should.be.equal(false);
                    results.vendors.length.should.be.equal(conf.pagination.limit);
                    results.vendors[0].should.have.properties("name");
                    results.vendors[0].should.not.have.properties("description");
                    should(results.vendors[0].description).be.eql(undefined);
                }
                done()
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test API compliance to field selection: fields projection must not include description [-description]', function (done) {
            request.get({
                url: APIURL + '?fields=-description',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {
                if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliance to field selection: fields projection must not include description [-description]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);
                    results.should.have.property('_metadata');
                    results.should.have.property('vendors');
                    results._metadata.totalCount.should.be.equal(false);
                    results.vendors.length.should.be.equal(conf.pagination.limit);
                    results.vendors[0].should.have.properties("name");
                    should(results.vendors[0].description).be.eql(undefined);
                }
                done()
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test API compliance to filter by vendors as array ---> vendors=[_id1,_id2]', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    var vendors = [results.vendors[0]._id, results.vendors[1]._id];
                    request.get({
                        url: APIURL + '?vendors=' + results.vendors[0]._id + "&vendors=" + results.vendors[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test API compliant to filter by vendors as array ---> vendors=[_id1,_id2]' -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(2);
                            vendors.should.containEql(Vendors.ObjectId(results.vendors[0]._id));
                            vendors.should.containEql(Vendors.ObjectId(results.vendors[1]._id));
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /_metadata', function () {
        it('must test API compliance to filter by vendors as comma separated elements of a list  ---> vendors="_id1, _id2"', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    var vendors = results.vendors[0]._id + "," + results.vendors[1]._id;
                    request.get({
                        url: APIURL + '?vendors=' + vendors,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test API compliance to filter by vendors as comma separated elements of a list ---> vendors='_id1, _id2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(2);
                            vendors.should.containEql(results.vendors[0]._id);
                            vendors.should.containEql(results.vendors[1]._id);
                            vendors.indexOf(results.vendors[0]._id).should.be.greaterThanOrEqual(0);
                            vendors.indexOf(results.vendors[1]._id).should.be.greaterThanOrEqual(0);
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test API compliance to filter by single value  ---> vendors="_id"', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    var vendors=results.vendors[0]._id;
                    request.get({
                        url: APIURL + '?vendors=' + vendors,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test API compliance to filter by single value  ---> vendors='_id'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(1);
                            Vendors.ObjectId(results.vendors[0]._id).should.be.eql(vendors);
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test API compliant to filter by field as a list of comma separated elements ---> name="name1,name2"', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    var name=results.vendors[0].name + "," + results.vendors[1].name;
                    request.get({
                        url: APIURL + '?name=' + name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test API compliance to filter by field as a list of comma separated elements -- name='name1,name2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(2);
                            name.indexOf(results.vendors[0].name).should.be.greaterThanOrEqual(0);
                            name.indexOf(results.vendors[1].name).should.be.greaterThanOrEqual(0);
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test API compliance to filter by multiple field as array or list of comma separated elements ---> name=["name1","name2"], description="desc1,desc2]', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    var name = [results.vendors[0].name, results.vendors[1].name];
                    var description =results.vendors[0].description + "," + results.vendors[1].description;
                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description=" + description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test API compliant to filter by multiple field as array or list of comma separated elements ---> name=['name1','name2'] description='desc1,desc2]'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(2);
                            results.vendors[0].name.should.be.equalOneOf([results.vendors[0].name , results.vendors[1].name ]);
                            results.vendors[1].name.should.be.equalOneOf([results.vendors[0].name , results.vendors[1].name ]);
                            description.indexOf(results.vendors[0].description).should.be.greaterThanOrEqual(0);
                            description.indexOf(results.vendors[1].description).should.be.greaterThanOrEqual(0);
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test results order - desc', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test results order - desc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(50);
                            results.vendors[0].name.should.be.greaterThan(results.vendors[1].name);
                            results.vendors[1].name.should.be.greaterThan(results.vendors[2].name);
                            results.vendors[2].name.should.be.greaterThan(results.vendors[3].name);
                        }
                        done()
                    })
                }
            })
        })
    })


    describe('GET /vendors', function () {
        it('must test results order - asc', function (done) {
            Vendor.findAll({}, null, null, function(err, results) {
                if(err) throw err;
                else{
                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {
                        if(error) consoleLogError.printErrorLog("GET /vendors: 'must test results order - asc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('vendors');
                            results._metadata.totalCount.should.be.equal(false);
                            results.vendors.length.should.be.equal(50);
                            results.vendors[3].name.should.be.greaterThan(results.vendors[2].name);
                            results.vendors[2].name.should.be.greaterThan(results.vendors[1].name);
                            results.vendors[1].name.should.be.greaterThan(results.vendors[0].name);
                        }
                        done()
                    })
                }
            })
        })
    })


});
