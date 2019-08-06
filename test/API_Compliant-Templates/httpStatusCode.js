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
var commonFunctioTest=require("../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../Utility/errorLogs');
var webUiToken;




exports.httpStatusCode = function (APIURL,route,id) {


    describe("HTTP status code Compliant Test '/" + route + "' [FROM TEMPLATE]", function () {

        before(function (done) {
            commonFunctioTest.setAuthMsMicroservice(function (err) {
                if (err) consoleLogError.printErrorLog(route +" httpStatusCode.js - after - setAuthMsMicroservice ---> " + err);
                webUiToken = conf.testConfig.myWebUITokenToSignUP;
                done();
            });
        });

        after(function (done) {
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog(route +" httpStatusCode.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });


        beforeEach(function (done) {
         done();
        });


        afterEach(function (done) {
          done()
        });


        describe('GET /' +route, function () {

            it('must test API compliant to http status code 204 (No content) in find by Id ' + route, function (done) {

                request.get({
                    url: APIURL + "/"+ id,
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API compliant to http status code 204 (No content) in find by Id  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(204);
                    }
                    done();
                });
            });
        });

        describe('PUT /' +route, function () {

            it('must test API compliant to http status code 204 (No content) in update by Id ' + route, function (done) {

                var entityName = (route.endsWith("ies")) ? (route.slice(0,-3))+"y" :(route.slice(0,-1));
                //cannot stringify because must resolve entityName value
                //JSON.stringify({entityName:{name:"name"}, access_token:webUiToken});
                var bodyParam = {};
                bodyParam[entityName] = {name:"name"};
                bodyParam["access_token"] = webUiToken;

                requestParams={
                    url:APIURL+"/" + id,
                    headers:{'content-type': 'application/json'},
                    body:JSON.stringify(bodyParam)
                };

                request.put(requestParams, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("PUT /"+route+": 'must test API compliant to http status code 204 (No content) in update by Id  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(204);
                    }
                    done();
                });
            });
        });


        describe('DELETE /' +route, function () {

            it('must test API compliant to http status code 204 (No content) in delete by Id ' + route, function (done) {

                request.del({
                    url: APIURL + "/" +id,
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("DELETE /"+route+": 'must test API compliant to http status code 204 (No content) in delete by Id  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(204);
                    }
                    done();
                });
            });
        });

    });
};