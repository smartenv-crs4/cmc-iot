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
var ApiActions = require('../../../DBEngineHandler/drivers/apiActionDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/apiActions" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var ApiAction = require('../../../DBEngineHandler/models/apiActions').ApiAction;
var apiActionDocuments=require('../../SetTestenv/createApiActionsDocuments');

var webUiToken;
var apiActionId;


describe('ApiActions API Test - [SEARCH FILTERS]', function () {

    before(function (done) {
        this.timeout(5000);
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        this.timeout(5000);
        apiActionDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("ApiAction searchFilterTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("ApiAction searchFilterTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        apiActionDocuments.createDocuments(100,function(err,foreignKey){
            if (err) consoleLogError.printErrorLog("ApiAction searchFilterTests.js - beforreEach - ApiActions.create ---> " + err);
            apiActionId=foreignKey.apiActionId;
            done();
        });
    });


    afterEach(function (done) {
        apiActionDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("ApiAction searchFilterTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });




    describe('GET /apiActions', function () {

        it('must test API compliant to field selection: fields projection [actionName, method]', function (done) {

            request.get({
                url: APIURL + '?fields=actionName,method',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to field selection: fields projection [actionName, method]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('apiActions');
                    results._metadata.totalCount.should.be.equal(false);
                    results.apiActions.length.should.be.equal(conf.pagination.limit);
                    results.apiActions[0].should.have.properties("actionName");
                    results.apiActions[0].should.have.properties("method");
                    should(results.apiActions[0].thingId).be.eql(undefined);
                    should(results.apiActions[0].deviceTypeId).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe('GET /apiActions', function () {

        it('must test API compliant to field selection by ID: fields projection [actionName, method]', function (done) {


            ApiActions.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var id=results.apiActions[0]._id;
                    request.get({
                        url: APIURL + "/" + id+"?fields=actionName,method",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to field selection by ID: fields projection [actionName, method]' -->" + error.message);
                        else {
                            var results = JSON.parse(body);
                            results.should.have.properties("actionName");
                            results.should.have.properties("method");
                            id.should.be.eql(ApiActions.ObjectId(results._id));
                            should(results.thingId).be.eql(undefined);
                            should(results.deviceTypeId).be.eql(undefined);
                        }
                        done();
                    });
                }
            });
        });

    });


    describe('GET /apiActions', function () {

        it('must test API compliant to field selection: fields projection must not include  thingId [-thingId]', function (done) {

            request.get({
                url: APIURL + '?fields=-thingId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to field selection: fields projection must not include  thingId [-thingId]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('apiActions');
                    results._metadata.totalCount.should.be.equal(false);
                    results.apiActions.length.should.be.equal(conf.pagination.limit);
                    results.apiActions[0].should.have.properties("actionName");
                    results.apiActions[0].should.have.properties("method");
                    should(results.apiActions[0].thingId).be.eql(undefined);
                    results.apiActions[0].should.have.properties("deviceTypeId");
                }
                done();
            });

        });

    });


    describe('GET /apiActions', function () {

        it('must test API compliant to field selection: fields projection must not include  thingId and actionName [-thingId -actionName]', function (done) {

            request.get({
                url: APIURL + '?fields=-thingId,-actionName',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to field selection: fields projection must not include  thingId and actionName [-thingId -actionName]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('apiActions');
                    results._metadata.totalCount.should.be.equal(false);
                    results.apiActions.length.should.be.equal(conf.pagination.limit);
                    should(results.apiActions[0].actionName).be.eql(undefined);
                    results.apiActions[0].should.have.properties("method");
                    should(results.apiActions[0].thingId).be.eql(undefined);
                    results.apiActions[0].should.have.properties("deviceTypeId");
                }
                done();
            });

        });

    });


    describe('GET /apiActions', function () {

        it('must test API compliant to filter by apiActions as array ---> apiActions=[_id1,_id2]', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var apiActions=[results.apiActions[0]._id,results.apiActions[1]._id];
                    request.get({
                        url: APIURL + '?apiActions='+results.apiActions[0]._id+"&apiActions="+results.apiActions[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to filter by apiActions as array apiActions=[_id1,_id2]' -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(2);
                            apiActions.should.containEql(ApiActions.ObjectId(results.apiActions[0]._id));
                            apiActions.should.containEql(ApiActions.ObjectId(results.apiActions[1]._id));

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /apiActions', function () {

        it('must test API compliant to filter by apiActions as elements list comma separated  ---> apiActions="_id1, _id2"', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var apiActions=results.apiActions[0]._id + "," + results.apiActions[1]._id;


                    request.get({
                        url: APIURL + '?apiActions='+apiActions,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to filter by apiActions as elements list comma separated apiActions='_id1, _id2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(2);
                            apiActions.should.containEql(results.apiActions[0]._id);
                            apiActions.should.containEql(results.apiActions[1]._id);
                            apiActions.indexOf(results.apiActions[0]._id).should.be.greaterThanOrEqual(0);
                            apiActions.indexOf(results.apiActions[1]._id).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /apiActions', function () {

        it('must test API compliant to filter by single value  ---> apiActions="_id"', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var apiActions=results.apiActions[0]._id;


                    request.get({
                        url: APIURL + '?apiActions='+apiActions,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to filter by single value  ---> apiActions='_id'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(1);
                            ApiActions.ObjectId(results.apiActions[0]._id).should.be.eql(apiActions);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /apiActions', function () {

        it('must test API compliant to filter by field as list comma separated ---> actionName="actionName1,actionName2"', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var actionName=results.apiActions[0].actionName + "," + results.apiActions[1].actionName;


                    request.get({
                        url: APIURL + '?actionName='+actionName,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to filter by field as list comma separated -- actionName='actionName1,actionName2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(2);
                            actionName.indexOf(results.apiActions[0].actionName).should.be.greaterThanOrEqual(0);
                            actionName.indexOf(results.apiActions[1].actionName).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /apiActions', function () {

        it('must test API compliant to filter by multiple field as array or list comma separated ---> actionName=["actionName1","actionName2"]method="desc1,desc2]', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var actionName=[results.apiActions[0].actionName,results.apiActions[1].actionName];
                    var method=results.apiActions[0].method + "," + results.apiActions[1].method;


                    request.get({
                        url: APIURL + '?actionName=' + actionName[0] + "&actionName=" + actionName[1] + "&method="+method,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to filter by multiple field as array or list comma separated --- actionName=['actionName1','actionName2'] method='desc1,desc2]'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(2);
                            results.apiActions[0].actionName.should.be.equalOneOf([results.apiActions[0].actionName , results.apiActions[1].actionName ]);
                            results.apiActions[1].actionName.should.be.equalOneOf([results.apiActions[0].actionName , results.apiActions[1].actionName ]);
                            method.indexOf(results.apiActions[0].method).should.be.greaterThanOrEqual(0);
                            method.indexOf(results.apiActions[1].method).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /apiActions', function () {

        it('must test order results desc', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortDesc=actionName,method',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test order results desc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(50);
                            results.apiActions[0].actionName.should.be.greaterThan(results.apiActions[1].actionName);
                            results.apiActions[1].actionName.should.be.greaterThan(results.apiActions[2].actionName);
                            results.apiActions[2].actionName.should.be.greaterThan(results.apiActions[3].actionName);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /apiActions', function () {

        it('must test order results asc', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortAsc=actionName,method',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test order results asc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(50);
                            results.apiActions[3].actionName.should.be.greaterThan(results.apiActions[2].actionName);
                            results.apiActions[2].actionName.should.be.greaterThan(results.apiActions[1].actionName);
                            results.apiActions[1].actionName.should.be.greaterThan(results.apiActions[0].actionName);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /apiActions', function () {

        it('must test API compliant to field selection & projection  ---> fields="field1, field"', function (done) {


            ApiAction.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var apiActions=results.apiActions[0]._id + "," + results.apiActions[1]._id;


                    request.get({
                        url: APIURL + '?apiActions='+apiActions+"&fields=actionName,method",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /apiActions: 'must test API compliant to field selection  ---> fields=\"field1, field\"'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('apiActions');
                            results._metadata.totalCount.should.be.equal(false);
                            results.apiActions.length.should.be.equal(2);
                            apiActions.should.containEql(results.apiActions[0]._id);
                            apiActions.should.containEql(results.apiActions[1]._id);
                            apiActions.indexOf(results.apiActions[0]._id).should.be.greaterThanOrEqual(0);
                            apiActions.indexOf(results.apiActions[1]._id).should.be.greaterThanOrEqual(0);
                            results.apiActions[0].should.have.properties(["actionName","method"]);
                            results.apiActions[0].should.not.have.property("bodyPrototype");
                            results.apiActions[0].should.not.have.property("deviceTypeId");

                        }
                        done();
                    });
                }
            });

        });

    });



});
