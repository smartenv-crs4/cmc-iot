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

var webUiToken;
var vendorId;


describe('Vendors API Test - [DATA VALIDATION]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Vendors.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {
        var range = _.range(100);
        async.each(range, function (e, cb) {
            Vendors.create({
                name:"name" + e,
                description:"description" +e
            }, function (err, newVendor) {
                if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - Vendors.create ---> " + err);
                if(e===1) vendorId=newVendor._id;
                cb();
            });
        }, function (err) {
            done();
        });
    });


    afterEach(function (done) {
        Vendors.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("dataValidationTests.js - beforeEach - deleteMany ---> " + err);
            done();
        });
    });


    describe('POST /vendor', function(){
        it('must test vendor creation [no valid vendor field - field is not in the schema]', function(done){
            var bodyParam=JSON.stringify({vendor: {noschemaField: "invalid"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /vendor: 'must test vendor creation [no valid vendor field - field is not in the schema] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("Field `noschemaField` is not in schema and strict mode is set to throw.");
                }
                done();
            });
        });
    });



    describe('POST /vendor', function() {
        it('must test vendor creation [data validation error due to required fields missing]', function(done) {
            var bodyParam=JSON.stringify({vendor: {description: "description"}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body) {
                if(error) consoleLogError.printErrorLog("POST /vendor: 'must test vendor creation [data validation error due to required fields missing] -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(400);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.equal("vendor validation failed: name: Path `name` is required.");
                }
                done()
            })
        })
    })

//Vendor has only string fields
    // describe('POST /vendor', function() {
    //     it('must test vendor creation [data validation error due to invalid field name]', function(done) {
    //         var bodyParam=JSON.stringify({vendor: {name:Vendors.ObjectId(), description: "description"}});
    //         var requestParams={
    //             url:APIURL,
    //             headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
    //             body:bodyParam
    //         }
    //         request.post(requestParams,function(error, response, body) {
    //             if(error) consoleLogError.printErrorLog("POST /vendor: 'must test vendor creation [data validation error due to invalid field name] -->" + error.message);
    //             else{
    //                 var results = JSON.parse(body);
    //                 response.statusCode.should.be.equal(400);
    //                 results.should.have.property('statusCode');
    //                 results.should.have.property('error');
    //                 results.should.have.property('message');
    //                 results.message.should.be.equal("vendor validation failed: name: Cast to ObjectID failed for value \"name\" at path \"name\"");
    //             }
    //             done()
    //         })
    //     })
    // })


})
