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

var conf = require('propertiesmanager').conf;
var request = require('request');
var commonFunctioTest = require("../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../Utility/errorLogs');

var webUiToken;


exports.accessTokenCompliant = function (APIURL, resourceName) {

    describe("API Authentication /" + resourceName + " [FROM TEMPLATE]", function () {

        before(function (done) {
            commonFunctioTest.setAuthMsMicroservice(function (err) {
                if (err) throw (err);
                webUiToken = conf.testConfig.myWebUITokenToSignUP;
                done();
            });
        });

        after(function (done) {
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Device access_tokenAuthentication.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });


        beforeEach(function (done) {
            done()
        });


        afterEach(function (done) {
            done();
        });


        describe("POST /" + resourceName, function () {

            it("must test " + resourceName + " compliant to (no access Token)", function (done) {
                var bodyParam = JSON.stringify({device: {}});
                var requestParams = {
                    url: APIURL,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                };
                request.post(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("POST /" + resourceName + ": 'must test " + resourceName + " compliant to (no access Token)' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Unauthorized: Access token required, you are not allowed to use the resource");
                    }
                    done();
                });

            });
        });


        describe("POST /" + resourceName, function () {

            it("must test " + resourceName + " compliant to (Unauthorised access Token)", function (done) {
                var bodyParam = JSON.stringify({device: {}});
                var requestParams = {
                    url: APIURL,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP
                    },
                    body: bodyParam
                };
                request.post(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("POST /" + resourceName + ": 'must test " + resourceName + " compliant to (Unauthorised access Token)' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Only admin token types can access this resource : 'POST /" + resourceName + "/'");
                    }
                    done();
                });

            });
        });

        describe("POST /" + resourceName, function () {

            it("must test " + resourceName + " compliant to (Invalid access Token)", function (done) {
                var bodyParam = JSON.stringify({device: {}});
                var requestParams = {
                    url: APIURL,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP + "a"
                    },
                    body: bodyParam
                };
                request.post(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("POST /" + resourceName + ": 'must test " + resourceName + " compliant to (Invalid access Token)' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("The decode_token is invalid or malformed");
                    }
                    done();
                });

            });
        });


        describe("POST /" + resourceName, function () {

            it("must test " + resourceName + " compliant to (access_token as body parameter)", function (done) {
                var bodyParam = JSON.stringify({device: {}, access_token: conf.testConfig.myWebUITokenToSignUP + "a"});
                var requestParams = {
                    url: APIURL,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                };
                request.post(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("POST /" + resourceName + ": 'must test " + resourceName + " compliant to (access_token as body parameter)' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("The decode_token is invalid or malformed");
                    }

                    done();
                });

            });
        });


        describe("GET /" + resourceName, function () {

            it("must test " + resourceName + " compliant to (access_token as URL parameter)", function (done) {

                var requestParams = {
                    url: APIURL+"?access_token="+conf.testConfig.myWebUITokenToSignUP + "a",
                };
                request.post(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("GET /" + resourceName + ": 'must test " + resourceName + " compliant to (access_token as URL parameter)' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("The decode_token is invalid or malformed");
                    }

                    done();
                });

            });
        });


        /******************************************************************************************************************
         ************************************************** CRUD TESTS)***************************************************
         ***************************************************************************************************************** */


        // ************************************************** CREATE ***************************************************
        describe("POST /" + resourceName, function () {

            it("must test " + resourceName + " CRUD (CREATE - POST) compliant to access Token", function (done) {
                var bodyParam = JSON.stringify({device: {}});
                var requestParams = {
                    url: APIURL,
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                };
                request.post(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("POST /" + resourceName + ": 'must test " + resourceName + " CRUD (CREATE - POST) compliant to access Token' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Unauthorized: Access token required, you are not allowed to use the resource");
                    }
                    done();
                });

            });
        });

        // ************************************************** READ *****************************************************

        describe("GET /" + resourceName, function () {

            it("must test " + resourceName + " CRUD (READ - GET) compliant to access Token", function (done) {
                var requestParams = {
                    url: APIURL
                };
                request.get(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("GET /" + resourceName + ": 'must test " + resourceName + " CRUD (READ - GET) compliant to access Token' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Unauthorized: Access token required, you are not allowed to use the resource");
                    }
                    done();
                });

            });
        });


         // ************************************************** UPDATE ***************************************************
        describe("PUT /" + resourceName, function () {

            it("must test " + resourceName + " CRUD (UPDATE - PUT) compliant to access Token", function (done) {
                var bodyParam = JSON.stringify({device: {}});
                var requestParams = {
                    url: APIURL+"/id",
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                };
                request.put(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("PUT /" + resourceName + ": 'must test " + resourceName + " CRUD (UPDATE - PUT) compliant to access Token' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Unauthorized: Access token required, you are not allowed to use the resource");
                    }
                    done();
                });

            });
        });

         // ************************************************** DELETE ***************************************************


        describe("DELETE /" + resourceName, function () {

            it("must test " + resourceName + " CRUD (DELETE) compliant to access Token", function (done) {
                var bodyParam = JSON.stringify({device: {}});
                var requestParams = {
                    url: APIURL+"/id",
                    headers: {'content-type': 'application/json'},
                    body: bodyParam
                };
                request.delete(requestParams, function (error, response, body) {
                    if (error) {
                        consoleLogError.printErrorLog("DELETE /" + resourceName + ": 'must test " + resourceName + " CRUD (DELETE) compliant to access Token' -->" + error.message);
                        error.should.be.null();
                    } else {
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(400);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Unauthorized: Access token required, you are not allowed to use the resource");
                    }
                    done();
                });

            });
        });



    });

};


