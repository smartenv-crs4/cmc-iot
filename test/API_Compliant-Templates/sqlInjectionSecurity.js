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




exports.sqlInjectionSecurity = function (APIURL,route,fields) {


    describe("Sql Injection Test '/" + route + "' [FROM TEMPLATE]", function () {

        before(function (done) {
            commonFunctioTest.setAuthMsMicroservice(function (err) {
                if (err) throw (err);
                webUiToken = conf.testConfig.myWebUITokenToSignUP;
                done();
            });
        });

        after(function (done) {
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog(route + " sqlInjectionSecurity.js - after - resetAuthMsStatus ---> " + err);
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

            it('must test API compliant to SQL Injection protection (mongo operator $ as object)', function (done) {

                request.get({
                    url: APIURL + '?'+fields+'={ $gte:""}',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API compliant to SQL Injection protection (mongo operator $ as object) -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(400);
                        var results = JSON.parse(body);

                        results.should.have.property('error');
                        results.should.have.property('statusCode');
                        results.should.have.property('message');
                        results.message.should.be.equal("mongoDb operator \"$...\" are not allowed in query filter");
                    }
                    done();
                });
            });
        })


        describe('GET /'+route, function () {

            it('must test API compliant to SQL Injection protection (mongo operator $ as String)', function (done) {

                request.get({
                    url: APIURL + '?'+fields+'={ "$gte":""}',
                    headers: {'Authorization': "Bearer " + webUiToken}
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("GET /"+route+": 'must test API compliant to SQL Injection protection (mongo operator $ as String)-->" + error.message);
                    else {
                        response.statusCode.should.be.equal(400);
                        var results = JSON.parse(body);

                        results.should.have.property('error');
                        results.should.have.property('statusCode');
                        results.should.have.property('message');
                        results.message.should.be.equal("mongoDb operator \"$...\" are not allowed in query filter");
                    }
                    done();
                });
            });
        });


    });
};