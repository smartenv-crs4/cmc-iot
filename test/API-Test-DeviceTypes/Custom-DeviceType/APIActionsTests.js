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
var DeviceTypes = require('../../../DBEngineHandler/drivers/deviceTypeDriver');
var deviceTypeDocuments = require('../../SetTestenv/createDeviceTypesDocuments');
var DeviceTypeDomainDriver = require('../../../DBEngineHandler/drivers/deviceType_domainDriver');
var DomainDriver = require('../../../DBEngineHandler/drivers/domainDriver');
var domainsDocuments = require('../../SetTestenv/createDomainsDocuments');
var Things = require('../../../DBEngineHandler/drivers/thingDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/deviceTypes";
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError = require('../../Utility/errorLogs');
var async = require('async');


var webUiToken;
var deviceTypeId;


describe('DeviceTypes API Test - [ACTIONS TESTS]', function () {

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
        DeviceTypes.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType APIActionsTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function (err) {
                if (err) consoleLogError.printErrorLog("DeviceType APIActionsTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });


    beforeEach(function (done) {

        deviceTypeDocuments.createDocuments(100, function (err, newDeviceTypeId) {
            if (err) consoleLogError.printErrorLog("DeviceType APIActionsTests.js - beforreEach - DeviceTypes.create ---> " + err);
            deviceTypeId = newDeviceTypeId;
           done();
        });
    });


    afterEach(function (done) {
        DeviceTypes.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType APIActionsTests.js - afterEach - deleteMany ---> " + err);
          done();
        });
    });

    describe('POST /deviceTypes/:id/actions/addDomains', function () {

        it('must test API action addDomains error due to no body [no header content-Type]', function (done) {


            request.post({
                url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains error due to no body[no header content-Type]'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body missing');
                }
                done();
            });
        });

    });

 describe('POST /deviceTypes/:id/actions/addDomains', function () {

        it('must test API action addDomains error due to no body', function (done) {


            request.post({
                url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': "Bearer " + webUiToken
                },
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains error due to no body'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body missing');
                }
                done();
            });
        });

    });

describe('POST /deviceTypes/:id/actions/addDomains', function () {

        it('must test API action addDomains error due to no header Content-Type', function (done) {


            request.post({
                url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                headers: {
                    'Authorization': "Bearer " + webUiToken
                },
                body: JSON.stringify({skip: "0"})
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains error due to no header Content-Type'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql('body missing');
                }
                done();
            });
        });

    });


    describe('POST /deviceTypes/:id/actions/addDomains', function () {

        it('must test API action addDomains error due to no domains body field missing', function (done) {

            var body=JSON.stringify({skip: "0"});

            request.post({
                url: APIURL + '/' +deviceTypeId +'/actions/addDomains',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': "Bearer " + webUiToken
                },
                body: body
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains error due to no domains body field missing'  -->" + error.message);
                else {
                    response.statusCode.should.be.equal(400);
                    var results = JSON.parse(body);
                    results.should.have.property('statusCode');
                    results.should.have.property('error');
                    results.should.have.property('message');
                    results.message.should.be.eql("body fields 'domains' missing");
                }
                done();
            });
        });

    });


    describe('POST /deviceTypes/:id/actions/addDomains', function () {

        it('must test API action addDomains', function (done) {

            domainsDocuments.createDocuments(1,function(error,domainID){
                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains'  -->" + error.message);
                var body=JSON.stringify({domains: [domainID]});
                request.post({
                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + webUiToken
                    },
                    body: body
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.length.should.be.equal(1);
                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                    }

                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains'  -->" + error.message);
                        else{
                            data.should.have.property("deviceType_domains");
                            data.deviceType_domains.length.should.be.equal(1);
                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                            DomainDriver.deleteMany({},null,function(error){
                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains'  -->" + error.message);
                                DeviceTypeDomainDriver.deleteMany({},null,function(error){
                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains'  -->" + error.message);
                                    done();
                                });
                            });
                        }
                    });

                });
            });
        });
    });


    describe('POST /deviceTypes/:id/actions/addDomains', function () {

        it('must test API action addDomains [two times]', function (done) {

            domainsDocuments.createDocuments(1,function(error,domainID){
                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                var body=JSON.stringify({domains: [domainID]});
                request.post({
                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + webUiToken
                    },
                    body: body
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.length.should.be.equal(1);
                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                    }

                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                        else{
                            data.should.have.property("deviceType_domains");
                            data.deviceType_domains.length.should.be.equal(1);
                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));

                            // twice
                            domainsDocuments.createDocuments(1,function(error,domainIDBis){
                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                                var body=JSON.stringify({domains: [domainIDBis]});
                                request.post({
                                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                                    headers: {
                                        'content-type': 'application/json',
                                        'Authorization': "Bearer " + webUiToken
                                    },
                                    body: body
                                }, function (error, response, body) {

                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.length.should.be.equal(1);
                                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainIDBis));
                                    }

                                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                                        else{
                                            data.should.have.property("deviceType_domains");
                                            data.deviceType_domains.length.should.be.equal(2);
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.oneOf(DeviceTypes.ObjectId(domainID), DeviceTypes.ObjectId(domainIDBis));
                                            DomainDriver.deleteMany({},null,function(error){
                                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                                                DeviceTypeDomainDriver.deleteMany({},null,function(error){
                                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains [two times]'  -->" + error.message);
                                                    done();
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




    describe('POST /deviceTypes/:id/actions/removeDomains', function () {

        it('must test API action addDomains then removeDomains [two times]', function (done) {

            domainsDocuments.createDocuments(1,function(error,domainID){
                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                var bodyRequest=JSON.stringify({domains: [domainID]});
                request.post({
                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + webUiToken
                    },
                    body: bodyRequest
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.length.should.be.equal(1);
                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                    }

                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                        else{
                            data.should.have.property("deviceType_domains");
                            data.deviceType_domains.length.should.be.equal(1);
                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));

                            // twice
                            domainsDocuments.createDocuments(1,function(error,domainIDBis){
                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                bodyRequest=JSON.stringify({domains: [domainIDBis]});
                                request.post({
                                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                                    headers: {
                                        'content-type': 'application/json',
                                        'Authorization': "Bearer " + webUiToken
                                    },
                                    body: bodyRequest
                                }, function (error, response, body) {

                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.length.should.be.equal(1);
                                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainIDBis));
                                    }

                                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                        else{
                                            data.should.have.property("deviceType_domains");
                                            data.deviceType_domains.length.should.be.equal(2);
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.oneOf(DeviceTypes.ObjectId(domainID), DeviceTypes.ObjectId(domainIDBis));




                                           ////REMOVE ACTIONS///
                                            bodyRequest=JSON.stringify({domains: [domainID]});
                                            request.post({
                                                url: APIURL + '/' + deviceTypeId +'/actions/removeDomains',
                                                headers: {
                                                    'content-type': 'application/json',
                                                    'Authorization': "Bearer " + webUiToken
                                                },
                                                body: bodyRequest
                                            }, function (error, response, body) {

                                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                                else {
                                                    response.statusCode.should.be.equal(200);
                                                    var results = JSON.parse(body);
                                                    results.length.should.be.equal(1);

                                                    DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                                    DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                                                }

                                                DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                                    else{
                                                        data.should.have.property("deviceType_domains");
                                                        data.deviceType_domains.length.should.be.equal(1);
                                                        DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                                        DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainIDBis));

                                                        // twice
                                                        bodyRequest=JSON.stringify({domains: [domainIDBis]});
                                                        request.post({
                                                            url: APIURL + '/' + deviceTypeId +'/actions/removeDomains',
                                                            headers: {
                                                                'content-type': 'application/json',
                                                                'Authorization': "Bearer " + webUiToken
                                                            },
                                                            body: bodyRequest
                                                        }, function (error, response, body) {

                                                            if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                                            else {
                                                                response.statusCode.should.be.equal(200);
                                                                var results = JSON.parse(body);
                                                                results.length.should.be.equal(1);
                                                                DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                                                DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainIDBis));
                                                            }

                                                            DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                                                else{
                                                                    data.should.have.property("deviceType_domains");
                                                                    data.deviceType_domains.length.should.be.equal(0);
                                                                    DomainDriver.deleteMany({},null,function(error){
                                                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                                                        DeviceTypeDomainDriver.deleteMany({},null,function(error){
                                                                            if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action addDomains then removeDomains [two times]'  -->" + error.message);
                                                                            done();
                                                                        });
                                                                    });
                                                                }
                                                            });
                                                        });
                                                    }
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


    describe('POST /deviceTypes/:id/actions/removeDomains', function () {

        it('must test API action removeDomains [no Content]', function (done) {

            var bodyRequest=JSON.stringify({domains: [DeviceTypes.ObjectId()]});

            request.post({
                url: APIURL + '/' +deviceTypeId +'/actions/removeDomains',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': "Bearer " + webUiToken
                },
                body: bodyRequest
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/removeDomains: 'must test API action removeDomains [no Content]'  -->" + error.message);
                else {
                    console.log(body);
                    response.statusCode.should.be.equal(204);
                }
                done();
            });
        });

    });



    describe('POST /deviceTypes/:id/actions/setDomains', function () {

        it('must test API action setDomains', function (done) {

            //create domain
            domainsDocuments.createDocuments(1,function(error,domainID){
                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                var bodyRequest=JSON.stringify({domains: [domainID]});

                // add first association device Type domain
                request.post({
                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + webUiToken
                    },
                    body: bodyRequest
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.length.should.be.equal(1);
                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                    }

                    // verify deviceType domain association
                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                        else{
                            data.should.have.property("deviceType_domains");
                            data.deviceType_domains.length.should.be.equal(1);
                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));

                            //  create second domain
                            domainsDocuments.createDocuments(1,function(error,domainIDBis){
                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                bodyRequest=JSON.stringify({domains: [domainIDBis]});

                                // add second association device Type domain
                                request.post({
                                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                                    headers: {
                                        'content-type': 'application/json',
                                        'Authorization': "Bearer " + webUiToken
                                    },
                                    body: bodyRequest
                                }, function (error, response, body) {

                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.length.should.be.equal(1);
                                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainIDBis));
                                    }

                                    // verify deviceType domain association
                                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                        else{
                                            data.should.have.property("deviceType_domains");
                                            data.deviceType_domains.length.should.be.equal(2);
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.oneOf(DeviceTypes.ObjectId(domainID), DeviceTypes.ObjectId(domainIDBis));




                                            ////Set domain ACTIONS///

                                            domainsDocuments.createDocuments(1,function(error,domainToSetId){
                                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                                else{
                                                    bodyRequest=JSON.stringify({domains: [domainToSetId]});
                                                    request.post({
                                                        url: APIURL + '/' + deviceTypeId +'/actions/setDomains',
                                                        headers: {
                                                            'content-type': 'application/json',
                                                            'Authorization': "Bearer " + webUiToken
                                                        },
                                                        body: bodyRequest
                                                    }, function (error, response, body) {

                                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                                        else {
                                                            response.statusCode.should.be.equal(200);
                                                            var results = JSON.parse(body);
                                                            results.length.should.be.equal(1);
                                                            DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                                            DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainToSetId));
                                                        }

                                                        // verify new Set
                                                        DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                                            if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                                            else{
                                                                data.should.have.property("deviceType_domains");
                                                                data.deviceType_domains.length.should.be.equal(1);
                                                                DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                                                DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainToSetId));

                                                                domainsDocuments.deleteDocuments(function(error){
                                                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                                                    DeviceTypeDomainDriver.deleteMany({},null,function(error){
                                                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action setDomains'  -->" + error.message);
                                                                        done();
                                                                    });
                                                                });
                                                            }
                                                        });
                                                    });
                                                }
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



    describe('POST /deviceTypes/:id/actions/getDomains', function () {

        it('must test API action getDomains', function (done) {

            domainsDocuments.createDocuments(1,function(error,domainID){
                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                var body=JSON.stringify({domains: [domainID]});
                request.post({
                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + webUiToken
                    },
                    body: body
                }, function (error, response, body) {

                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                    else {
                        response.statusCode.should.be.equal(200);
                        var results = JSON.parse(body);
                        results.length.should.be.equal(1);
                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));
                    }

                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                        else{
                            data.should.have.property("deviceType_domains");
                            data.deviceType_domains.length.should.be.equal(1);
                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainID));

                            // twice
                            domainsDocuments.createDocuments(1,function(error,domainIDBis){
                                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                                var body=JSON.stringify({domains: [domainIDBis]});
                                request.post({
                                    url: APIURL + '/' + deviceTypeId +'/actions/addDomains',
                                    headers: {
                                        'content-type': 'application/json',
                                        'Authorization': "Bearer " + webUiToken
                                    },
                                    body: body
                                }, function (error, response, body) {

                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                                    else {
                                        response.statusCode.should.be.equal(200);
                                        var results = JSON.parse(body);
                                        results.length.should.be.equal(1);
                                        DeviceTypes.ObjectId(results[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                        DeviceTypes.ObjectId(results[0].domainId).should.be.eql(DeviceTypes.ObjectId(domainIDBis));
                                    }

                                    DeviceTypeDomainDriver.findAll({deviceTypeId:deviceTypeId},null,null,function(error,data){
                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                                        else{
                                            data.should.have.property("deviceType_domains");
                                            data.deviceType_domains.length.should.be.equal(2);
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].deviceTypeId).should.be.eql(DeviceTypes.ObjectId(deviceTypeId));
                                            DeviceTypes.ObjectId(data.deviceType_domains[0].domainId).should.be.oneOf(DeviceTypes.ObjectId(domainID), DeviceTypes.ObjectId(domainIDBis));

                                            request.post({
                                                url: APIURL + '/' + deviceTypeId +'/actions/getDomains',
                                                headers: {
                                                    'content-type': 'application/json',
                                                    'Authorization': "Bearer " + webUiToken
                                                }
                                            }, function (error, response, body) {
                                                response.statusCode.should.be.equal(200);
                                                var resultsGetDomains = JSON.parse(body);
                                                resultsGetDomains.length.should.be.equal(2);
                                                DeviceTypes.ObjectId(resultsGetDomains[0]._id).should.be.oneOf(domainID,domainIDBis);
                                                DeviceTypes.ObjectId(resultsGetDomains[1]._id).should.be.oneOf(domainID,domainIDBis);
                                                DomainDriver.deleteMany({},null,function(error){
                                                    if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
                                                    DeviceTypeDomainDriver.deleteMany({},null,function(error){
                                                        if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/addDomains: 'must test API action getDomains'  -->" + error.message);
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



    describe('POST /deviceTypes/:id/actions/getDomains', function () {

        it('must test API action getDomains [204 NoContent]', function (done) {

            var bodyRequest=JSON.stringify({domains: [DeviceTypes.ObjectId()]});

            request.post({
                url: APIURL + '/' +deviceTypeId +'/actions/getDomains',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': "Bearer " + webUiToken
                },
                body: bodyRequest
            }, function (error, response, body) {

                if (error) consoleLogError.printErrorLog("POST /deviceTypes/:id/actions/getDomains: 'must test API action getDomains [204 NoContent]'  -->" + error.message);
                else {
                    console.log(body);
                    response.statusCode.should.be.equal(204);
                }
                done();
            });
        });

    });



});
