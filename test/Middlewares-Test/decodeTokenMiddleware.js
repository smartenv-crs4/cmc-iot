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
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort +"/configuration" ;
var commonFunctioTest=require("../SetTestenv/testEnvironmentCreation");


describe('Decode Token Midleware API', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            done();
        });
    });

    after(function (done) {
        commonFunctioTest.resetAuthMsStatus(function(err){
            if (err) throw (err);
            done();
        });
    });


    beforeEach(function (done) {

       done();
    });


    afterEach(function (done) {
       done();
    });



    describe('GET /configuration', function () {

        it('must return  error 400 for invalid token', function (done) {

            request.get({
                url: APIURL + '?skip=0&limit=2',
                headers: {'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP + "d"}
            }, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
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



    describe('GET /configuration', function () {

        it('must return  error 400 for Access_token required', function (done) {

            request.get({url: APIURL + '?skip=0&limit=2'}, function (error, response, body) {

                if (error) console.log("######   ERRORE: " + error +"  ######");
                else {
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


    describe('GET /configuration', function () {
        this.timeout(10000);
        try {
            it('must return  error 401 for Unauthorized token', function (done) {
                request.get({
                    url: APIURL + '?skip=0&limit=2',
                    headers: {'Authorization': "Bearer " + conf.testConfig.myWebUITokenToSignUP}
                }, function (error, response, body) {
                    if (error) console.log("######   ERRORE: 401 2 " + error + "  ######");
                    else {
                        var results;
                        results = JSON.parse(body);
                        response.statusCode.should.be.equal(401);
                        results.should.have.property('statusCode');
                        results.should.have.property('error');
                        results.should.have.property('message');
                        results.message.indexOf("Only admin token types can access this resource").should.be.greaterThan(-1);
                    }
                    done();
                });
            });
        }catch (err){
           console.log("Catch " + err);
        }
    });


});
