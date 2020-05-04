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
var observationUtility = require('../../../routes/routesHandlers/handlerUtility/observationHandlerUtility');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/observations" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var observationDocuments=require('../../SetTestenv/createObservationsDocuments');

var webUiToken;
var observationId;


describe('Observations API Test - [SEARCH FILTERS]', function () {

    before(function (done) {
        this.timeout(0);
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        this.timeout(0);
        observationUtility.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        observationDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - beforreEach - Observations.create ---> " + err);
            observationId=ForeignKeys.observationId;
            done();
        });
    });


    afterEach(function (done) {
        observationDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Observation searchFilterTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    var testDescriptionMessage='GET /observations';
    var testMessage='must test API compliant to field selection: fields projection [value, location]';
    describe(testDescriptionMessage, function () {

        it(testMessage, function (done) {

            request.get({
                url: APIURL + '?fields=value,location',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('observations');
                    results._metadata.totalCount.should.be.equal(false);
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results.observations[0].should.have.property("value");
                    results.observations[0].should.have.property("location");
                    should(results.observations[0].timestamp).be.eql(undefined);
                    should(results.observations[0].deviceId).be.eql(undefined);
                    should(results.observations[0].unitId).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe(testDescriptionMessage, function () {
        testMessage='must test API compliant to field selection by ID: fields projection [value, location]';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var id=results.observations[0]._id;
                    request.get({
                        url: APIURL + "/" + id+"?fields=value,location",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            var results = JSON.parse(body);
                            results.should.have.property("value");
                            results.should.have.property("location");
                            id.should.be.eql(observationUtility.ObjectId(results._id));
                            should(results.deviceId).be.eql(undefined);
                            should(results.unitId).be.eql(undefined);
                            should(results.timestamp).be.eql(undefined);
                        }
                        done();
                    });
                }
            });
        });

    });


    describe(testDescriptionMessage, function () {
        testMessage='must test API compliant to field selection: fields projection must not include  unitId [-unitId]';
        it(testMessage, function (done) {

            request.get({
                url: APIURL + '?fields=-unitId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('observations');
                    results._metadata.totalCount.should.be.equal(false);
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results.observations[0].should.have.properties("value");
                    results.observations[0].should.have.properties("location");
                    should(results.observations[0].unitId).be.eql(undefined);
                    results.observations[0].should.have.properties("deviceId");
                    results.observations[0].should.have.properties("timestamp");
                }
                done();
            });

        });

    });


    describe(testDescriptionMessage, function () {
        testMessage='must test API compliant to field selection: fields projection must not include  deviceId and unitId [-unitId -deviceID]';
        it(testMessage, function (done) {

            request.get({
                url: APIURL + '?fields=-unitId,-deviceId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('observations');
                    results._metadata.totalCount.should.be.equal(false);
                    results.observations.length.should.be.equal(conf.pagination.limit);
                    results.observations[0].should.have.properties("value","location","timestamp");
                    should(results.observations[0].deviceId).be.eql(undefined);
                    should(results.observations[0].unitId).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe(testDescriptionMessage, function () {
        testMessage='must test API compliant to filter by observations as array ---> observations=[_id1,_id2]';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var observations=[results.observations[0]._id,results.observations[1]._id];
                    request.get({
                        url: APIURL + '?observations='+results.observations[0]._id+"&observations="+results.observations[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(2);
                            observations.should.containEql(observationUtility.ObjectId(results.observations[0]._id));
                            observations.should.containEql(observationUtility.ObjectId(results.observations[1]._id));
                        }
                        done();
                    });
                }
            });

        });

    });



    describe(testDescriptionMessage, function () {

        testMessage='must test API compliant to filter by observations as elements list comma separated  ---> observations="_id1, _id2"';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var observations=results.observations[0]._id + "," + results.observations[1]._id;


                    request.get({
                        url: APIURL + '?observations='+observations,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(2);
                            observations.should.containEql(results.observations[0]._id);
                            observations.should.containEql(results.observations[1]._id);
                            observations.indexOf(results.observations[0]._id).should.be.greaterThanOrEqual(0);
                            observations.indexOf(results.observations[1]._id).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });



    describe(testDescriptionMessage, function () {
        testMessage='must test API compliant to filter by single value  ---> observations="_id"';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var observations=results.observations[0]._id;


                    request.get({
                        url: APIURL + '?observations='+observations,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(1);
                            observationUtility.ObjectId(results.observations[0]._id).should.be.eql(observations);

                        }
                        done();
                    });
                }
            });

        });

    });

    describe(testDescriptionMessage, function () {
        testMessage='must test API compliant to filter by single value  ---> _id="_id"';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var observations=results.observations[0]._id;


                    request.get({
                        url: APIURL + '?_id='+observations,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(1);
                            observationUtility.ObjectId(results.observations[0]._id).should.be.eql(observations);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe(testDescriptionMessage, function () {

        testMessage='must test API compliant to filter by field as list comma separated ---> _id="_id1,_id2"';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.observations[0]._id + "," + results.observations[1]._id;


                    request.get({
                        url: APIURL + '?_id='+name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(2);
                            name.indexOf(results.observations[0]._id).should.be.greaterThanOrEqual(0);
                            name.indexOf(results.observations[1]._id).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe(testDescriptionMessage, function () {

        testMessage='must test API compliant to filter by multiple field as array or list comma separated ---> timestamp=["timestamp","timestamp"]&value="value1,value2]';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var _id=[results.observations[0]._id,results.observations[1]._id];
                    var value=results.observations[0].value + "," + results.observations[1].value;


                    request.get({
                        url: APIURL + '?_id=' + _id[0] + "&_id=" + _id[1] + "&value="+value,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(2);
                            results.observations[0]._id.should.be.equalOneOf([results.observations[0]._id , results.observations[1]._id ]);
                            results.observations[1]._id.should.be.equalOneOf([results.observations[0]._id , results.observations[1]._id ]);
                            value.indexOf(results.observations[0].value).should.be.greaterThanOrEqual(0);
                            value.indexOf(results.observations[1].value).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe(testDescriptionMessage, function () {

        testMessage='must test order results desc';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortDesc=value,timestamp',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(50);
                            results.observations[0].timestamp.should.be.greaterThanOrEqual(results.observations[1].timestamp);
                            results.observations[1].timestamp.should.be.greaterThanOrEqual(results.observations[2].timestamp);
                            results.observations[2].timestamp.should.be.greaterThanOrEqual(results.observations[3].timestamp);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe(testDescriptionMessage, function () {

        testMessage='must test order results asc';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortAsc=value,timestamp',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(50);
                            results.observations[3].timestamp.should.be.greaterThanOrEqual(results.observations[2].timestamp);
                            results.observations[2].timestamp.should.be.greaterThanOrEqual(results.observations[1].timestamp);
                            results.observations[1].timestamp.should.be.greaterThanOrEqual(results.observations[0].timestamp);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe(testDescriptionMessage, function () {
        testMessage='must test API compliance to field selection & projection  ---> fields="field1, field"';
        it(testMessage, function (done) {


            observationUtility.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var observations=results.observations[0]._id + "," + results.observations[1]._id;


                    request.get({
                        url: APIURL + '?observations='+observations+"&fields=value,timestamp",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog(testTypeMessage +": " + testMessage +" -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('observations');
                            results._metadata.totalCount.should.be.equal(false);
                            results.observations.length.should.be.equal(2);
                            observations.should.containEql(results.observations[0]._id);
                            observations.should.containEql(results.observations[1]._id);
                            observations.indexOf(results.observations[0]._id).should.be.greaterThanOrEqual(0);
                            observations.indexOf(results.observations[1]._id).should.be.greaterThanOrEqual(0);
                            results.observations[0].should.have.properties(["value","timestamp"]);
                            results.observations[0].should.not.have.property("deviceId");
                            results.observations[0].should.not.have.property("unitId");
                            results.observations[0].should.not.have.property("location");
                        }
                        done();
                    });
                }
            });

        });

    });


});
