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




exports.accessTokenCompliant = function (APIURL) {

    describe('Devices API Authentication Test', function () {

        before(function (done) {
            commonFunctioTest.setAuthMsMicroservice(function(err){
                if(err) throw (err);
                webUiToken=conf.testConfig.myWebUITokenToSignUP;
                done();
            });
        });

        after(function (done) {
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) console.log("######   ERRORE After 1: " + err +"  ######");
                done();
            });
        });



        beforeEach(function (done) {
            done()
        });


        afterEach(function (done) {
            done();
        });


        describe('POST /device', function(){

            it('must test device creation autentication(no access Token)', function(done){
                var bodyParam=JSON.stringify({device:{}});
                var requestParams={
                    url:APIURL,
                    headers:{'content-type': 'application/json'},
                    body:bodyParam
                };
                request.post(requestParams,function(error, response, body){
                    if(error){
                        consoleLogError.printErrorLog("POST /device: 'must test device creation autentication(no access Token) -->" + error.message);
                        error.should.be.null();
                    }
                    else{
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



        describe('POST /device', function(){

            it('must test device creation autentication(Unauthorised access Token)', function(done){
                var bodyParam=JSON.stringify({device:{}});
                var requestParams={
                    url:APIURL,
                    headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.myWebUITokenToSignUP},
                    body:bodyParam
                };
                request.post(requestParams,function(error, response, body){
                    if(error) {
                        consoleLogError.printErrorLog("POST /device: 'must test device creation autentication(Unauthorised access Token -->" + error.message);
                        error.should.be.null();
                    }
                    else{
                        var results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.should.be.equal("Only admin token types can access this resource : 'POST /devices/'");
                    }
                    done();
                });

            });
        });

    });
};


