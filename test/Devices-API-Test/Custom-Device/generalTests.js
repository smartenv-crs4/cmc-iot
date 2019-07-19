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
var Devices = require('../../../DBEngineHandler/drivers/deviceDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort +"/devices" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var mongoose=require('mongoose');
var consoleLogError=require('../../Utility/errorLogs');

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
                name:"name" + e,
                description:"description" +e,
                thingId:Devices.ObjectId(),
                typeId:Devices.ObjectId()
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



    describe('POST /device', function(){

        it('must test device creation [create Device]', function(done){
            var bodyParam=JSON.stringify({device:{name:"name", description: "description",thingId:Devices.ObjectId(), typeId:Devices.ObjectId()}});
            var requestParams={
                url:APIURL,
                headers:{'content-type': 'application/json','Authorization' : "Bearer "+ conf.testConfig.adminToken},
                body:bodyParam
            };
            request.post(requestParams,function(error, response, body){
                if(error) consoleLogError.printErrorLog("POST /device: 'must test device creation autentication(no access Token) -->" + error.message);
                else{
                    var results = JSON.parse(body);
                    response.statusCode.should.be.equal(201);
                    results.should.have.property('name');
                    results.should.have.property('description');
                    results.should.have.property('thingId');
                    results.should.have.property('typeId');
                }
                done();
            });

        });
    });


});
