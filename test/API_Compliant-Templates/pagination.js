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
var conf = require('propertiesmanager').conf;
var request = require('request');
var consoleLogError=require('../Utility/errorLogs');
var _=require('underscore');
var webUiToken;


exports.paginationTests = function (APIURL,route,fields) {



    describe("Test pagination resource " + route + " [FROM TEMPLATE]"  , function () {



        before(function (done) {
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });

        after(function (done) {
            done();
        });


        beforeEach(function (done) {
            done();
        });


        afterEach(function (done) {
            done();
        });


        describe('GET /' +route, function () {

            it('must test API pagination compliant: return ONE '+route+' and _metadata, all fields', function (done) {

                request.get({
                    url: APIURL + '?skip=0&limit=1',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API pagination compliant: return ONE "+route+" and _metadata, all fields -->" + error.message);
                    else {

                        // console.log(webUiToken);
                        console.log(body);

                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);

                        results.should.have.property('_metadata');
                        results.should.have.property(route);
                        results._metadata.skip.should.be.equal(0);
                        results._metadata.limit.should.be.equal(1);
                        results._metadata.totalCount.should.be.equal(false);
                        _.each(fields,function(value,index){
                            should.exist(results[route][0][value]);
                        });
                    }
                    done();
                });

            });

        });


        describe('GET /'+route, function () {

            it('must test API pagination compliant: return 2 '+route+' and _metadata, all fields', function (done) {

                request.get({
                    url: APIURL + '?skip=0&limit=2&fields=-type',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API pagination compliant: return 2 "+route+" and _metadata, all fields -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);

                        results.should.have.property('_metadata');
                        results.should.have.property(route);
                        results._metadata.skip.should.be.equal(0);
                        results._metadata.limit.should.be.equal(2);
                        results._metadata.totalCount.should.be.equal(false);
                        _.each(fields,function(value,index){
                            should.exist(results[route][0][value]);
                        });

                    }
                    done();
                });
            });
        });


        describe('GET /'+route, function () {

            it('must test API pagination compliant: return 2 '+route+' and _metadata with totalCount', function (done) {

                request.get({
                    url: APIURL + '?skip=0&limit=2&fields=-type&totalCount=true',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API pagination compliant: return 2 "+route+" and _metadata with totalCount' -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);

                        results.should.have.property('_metadata');
                        results.should.have.property(route);
                        results._metadata.skip.should.be.equal(0);
                        results._metadata.limit.should.be.equal(2);
                        results._metadata.should.have.properties("totalCount");
                        results._metadata.totalCount.should.be.equal(100);
                        _.each(fields,function(value,index){
                            should.exist(results[route][0][value]);
                        });

                    }
                    done();
                });
            });
        });


        describe('GET /'+route, function () {

            it('must test API compliant to skip and limit by default', function (done) {


                request.get({
                    url: APIURL + '?sortDesc=name,description',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API compliant to skip and limit by default'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property('_metadata');
                        results.should.have.property(route);
                        results._metadata.totalCount.should.be.equal(false);
                        results[route].length.should.be.equal(50);
                        results._metadata.skip.should.be.equal(conf.pagination.skip);
                        results._metadata.limit.should.be.equal(conf.pagination.limit);
                    }
                    done();
                });
            });

        });


        describe('GET /'+route, function () {

            it('must test API compliant to limit check by default', function (done) {

                request.get({
                    url: APIURL + '?limit=80',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API compliant to limit check by default'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(400);
                        var results = JSON.parse(body);
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.should.have.property('statusCode');
                        results.message.should.be.equal("limit must be less then " + conf.pagination.limit);
                    }
                    done();
                });

            });

        });


        describe('GET /'+route, function () {

            it('must test API compliant to limit check by default', function (done) {


                var oldLimit = conf.pagination.allowLargerLimit;
                conf.pagination.allowLargerLimit = true;//infinite


                request.get({
                    url: APIURL + '?limit=80&totalCount=true',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    conf.pagination.allowLargerLimit = oldLimit; // restore limit for next tests

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API compliant to limit check by default'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.should.have.property('_metadata');
                        results._metadata.limit.should.be.eql(80);
                        results._metadata.skip.should.be.eql(conf.pagination.skip);
                        results._metadata.totalCount.should.be.eql(100);
                    }
                    done();
                });

            });

        });
    });

};
