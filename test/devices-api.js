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


var should = require('should');
var _ = require('underscore')._;
var async = require('async');
var Devices = require('../models/devices').Device;
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort +"/devices" ;
var commonFunctioTest=require("./setTestenv/testEnvironmentCreation");

var webUiToken;
var deviceId;


describe('Devices API Test', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Devices.deleteMany({}, function (err,elm) {
            if (err) console.log("######   ERRORE After 1: " + err +"  ######");
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) console.log("######   ERRORE After 1: " + err +"  ######");
                done();
            });
        });
    });



    beforeEach(function (done) {

        var range = _.range(100);

        async.each(range, function (e, cb) {

            Devices.create({
                description:"description" + e,
                field1:"field1" +e,
                field2:"field2"+e
            }, function (err, newDevice) {
                if (err) console.log("######   ERRORE BEFOREEACH: " + err +"  ######");
                if(e===1) deviceId=newDevice._id;
                cb();
            });

        }, function (err) {
            done();
        });
    });


    afterEach(function (done) {
        Devices.deleteMany({}, function (err, elm) {
            if (err) console.log("######   ERRORE AfterEach: " + err +"  ######");
            done();
        });
    });





    describe('GET /devices', function () {

        it('must return ONE device and _metadata, all fields', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=1',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('devices');
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(1);
                    results._metadata.totalCount.should.be.equal(100);
                    should.exist(results.devices[0].description);
                    should.exist(results.devices[0].field1);
                    should.exist(results.devices[0].field2);
                }
                done();
            });

        });

    });


    describe('GET /devices', function () {

        it('must return 2 devices and _metadata, all fields', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=2&fields=-type',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('devices');
                    results._metadata.skip.should.be.equal(0);
                    results._metadata.limit.should.be.equal(2);
                    results._metadata.totalCount.should.be.equal(100);
                    should.exist(results.devices[0].description);
                    should.exist(results.devices[0].field1);
                    should.exist(results.devices[0].field2);

                }
                done();
            });
        });
    });

});
