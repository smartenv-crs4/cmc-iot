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
var Domains = require('../../../DBEngineHandler/drivers/domainDriver');
var domainDocuments = require('../../SetTestenv/createDomainsDocuments');
var DeviceTypeDomainDriver = require('../../../DBEngineHandler/drivers/deviceType_domainDriver');
var deviceTypesDocuments = require('../../SetTestenv/createDeviceTypesDocuments');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/domains";
var APIURLDeviceTypes = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/deviceTypes";
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../Utility/errorLogs');

var webUiToken;
var domainId;


describe('Domains API Test - [ACTIONS TESTS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function (err) {
            if (err) throw (err);
            webUiToken = conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        this.timeout(0);
        Domains.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Domain APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("Domain APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {

        domainDocuments.createDocuments(100, function (err, newDomainId) {
            if (err) consoleLogError.printErrorLog("Domain APIActionsTests.js - beforreEach - Domains.create ---> " + err);
            domainId = newDomainId;
           done();
        });
    });


    afterEach(function (done) {
        Domains.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Domain APIActionsTests.js - afterEach - deleteMany ---> " + err);
          done();
        });
    });

   
    describe('POST /domains/:id/actions/getDeviceTypes', function () {

        it('must test API action getDeviceTypes', function (done) {


            //create Device Type
            deviceTypesDocuments.createDocuments(1,function(error,deviceId){
                if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);

                //add Domain reference
                var body=JSON.stringify({domains: [domainId]});
                request.post({
                    url: APIURLDeviceTypes + '/' + deviceId +'/actions/addDomains',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + webUiToken
                    },
                    body: body
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.length.should.be.equal(1);
                        Domains.ObjectId(results[0].domainId).should.be.eql(Domains.ObjectId(domainId));
                        Domains.ObjectId(results[0].deviceTypeId).should.be.eql(Domains.ObjectId(deviceId));
                    }

                    //check
                    DeviceTypeDomainDriver.findAll({domainId:domainId},null,null,function(error,data){
                        if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);
                        else{
                            data.should.have.property("deviceType_domains");
                            data.deviceType_domains.length.should.be.equal(1);
                            Domains.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(Domains.ObjectId(domainId));
                            Domains.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(Domains.ObjectId(deviceId));

                            // Create second deviceType
                            deviceTypesDocuments.createDocuments(1,function(error,deviceTypeIdBis){
                                if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);
                                var body=JSON.stringify({domains: [domainId]});
                                request.post({
                                    url: APIURLDeviceTypes + '/' + deviceTypeIdBis +'/actions/addDomains',
                                    headers: {
                                        'content-type': 'application/json',
                                        'Authorization': "Bearer " + webUiToken
                                    },
                                    body: body
                                }, function (error, response, body) {

                                    if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.length.should.be.equal(1);
                                        Domains.ObjectId(results[0].domainId).should.be.eql(Domains.ObjectId(domainId));
                                        Domains.ObjectId(results[0].deviceTypeId).should.be.eql(Domains.ObjectId(deviceTypeIdBis));
                                    }

                                    //check
                                    DeviceTypeDomainDriver.findAll({domainId:domainId},null,null,function(error,data){
                                        if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);
                                        else{
                                            data.should.have.property("deviceType_domains");
                                            data.deviceType_domains.length.should.be.equal(2);
                                            Domains.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(Domains.ObjectId(domainId));
                                            Domains.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.oneOf(deviceId,deviceTypeIdBis);
                                            Domains.ObjectId(data.deviceType_domains[1].domainId).should.be.eql(Domains.ObjectId(domainId));
                                            Domains.ObjectId(data.deviceType_domains[1].deviceTypeId).should.be.oneOf(deviceId,deviceTypeIdBis);

                                            request.post({
                                                url: APIURL + '/' + domainId +'/actions/getDeviceTypes',
                                                headers: {
                                                    'content-type': 'application/json',
                                                    'Authorization': "Bearer " + webUiToken
                                                }
                                            }, function (error, response, body) {

                                                response.statusCode.should.be.equal(200);
                                                var resultsGetDevicetypes = JSON.parse(body);
                                                resultsGetDevicetypes.length.should.be.equal(2);
                                                Domains.ObjectId(resultsGetDevicetypes[0]._id).should.be.oneOf(deviceId,deviceTypeIdBis);
                                                Domains.ObjectId(resultsGetDevicetypes[1]._id).should.be.oneOf(deviceId,deviceTypeIdBis);
                                                DeviceTypeDomainDriver.deleteMany({},null,function(error){
                                                    if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes'  -->" + error.message);
                                                    deviceTypesDocuments.deleteDocuments(function(err){
                                                        done();
                                                    });
                                                });

                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });

                });
            });
        });
    });



    describe('POST /domains/:id/actions/getDeviceTypes', function () {

        it('must test API action getDeviceTypes [204 NoContent]', function (done) {

            var bodyRequest=JSON.stringify({domains: [Domains.ObjectId()]});

            request.post({
                url: APIURL + '/' +domainId +'/actions/getDeviceTypes',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': "Bearer " + webUiToken
                },
                body: bodyRequest
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /domains/:id/actions/getDeviceTypes: 'must test API action getDeviceTypes [204 NoContent]'  -->" + error.message);
                else {
                    console.log(body);
                    response.statusCode.should.be.equal(204);
                }
                done();
            });
        });

    });



});
