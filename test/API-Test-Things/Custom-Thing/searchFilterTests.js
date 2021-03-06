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
var Things = require('../../../DBEngineHandler/drivers/thingDriver');
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/things" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
// var Thing = require('../../../DBEngineHandler/models/things').Thing;
var thingDocuments=require('../../SetTestenv/createThingsDocuments');

var webUiToken;
var thingId;


describe('Things API Test - [SEARCH FILTERS]', function () {

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
        Things.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("Thing searchFilterTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Thing searchFilterTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        thingDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("Thing searchFilterTests.js - beforreEach - Things.create ---> " + err);
            thingId=ForeignKeys.thingId;
            done();
        });
    });


    afterEach(function (done) {
        thingDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Thing searchFilterTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });




    describe('GET /things', function () {

        it('must test API compliant to field selection: fields projection [name, description]', function (done) {

            request.get({
                url: APIURL + '?fields=name,description',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to field selection: fields projection [name, description]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('things');
                    results._metadata.totalCount.should.be.equal(false);
                    results.things.length.should.be.equal(conf.pagination.limit);
                    results.things[0].should.have.properties("name");
                    results.things[0].should.have.properties("description");
                    should(results.things[0].siteId).be.eql(undefined);
                    should(results.things[0].ownerId).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe('GET /things', function () {

        it('must test API compliant to field selection by ID: fields projection [name, description]', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var id=results.things[0]._id;
                    request.get({
                        url: APIURL + "/" + id+"?fields=name,description",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to field selection by ID: fields projection [name, description]' -->" + error.message);
                        else {
                            var results = JSON.parse(body);
                            results.should.have.properties("name");
                            results.should.have.properties("description");
                            id.should.be.eql(Things.ObjectId(results._id));
                            should(results.siteId).be.eql(undefined);
                            should(results.ownerId).be.eql(undefined);
                        }
                        done();
                    });
                }
            });
        });

    });


    describe('GET /things', function () {

        it('must test API compliant to field selection: fields projection must not include  ownerId [-ownerId]', function (done) {

            request.get({
                url: APIURL + '?fields=-ownerId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to field selection: fields projection must not include  ownerId [-ownerId]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('things');
                    results._metadata.totalCount.should.be.equal(false);
                    results.things.length.should.be.equal(conf.pagination.limit);
                    results.things[0].should.have.properties("name");
                    results.things[0].should.have.properties("description");
                    should(results.things[0].ownerId).be.eql(undefined);
                    results.things[0].should.have.properties("siteId");
                }
                done();
            });

        });

    });


    describe('GET /things', function () {

        it('must test API compliant to field selection: fields projection must not include  ownerId and name [-ownerId -name]', function (done) {

            request.get({
                url: APIURL + '?fields=-ownerId,-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to field selection: fields projection must not include  ownerId and name [-ownerId -name]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('things');
                    results._metadata.totalCount.should.be.equal(false);
                    results.things.length.should.be.equal(conf.pagination.limit);
                    should(results.things[0].name).be.eql(undefined);
                    results.things[0].should.have.properties("description");
                    should(results.things[0].ownerId).be.eql(undefined);
                    results.things[0].should.have.properties("siteId");
                }
                done();
            });

        });

    });


    describe('GET /things', function () {

        it('must test API compliant to filter by things as array ---> things=[_id1,_id2]', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var things=[results.things[0]._id,results.things[1]._id];
                    request.get({
                        url: APIURL + '?things='+results.things[0]._id+"&things="+results.things[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to filter by things as array things=[_id1,_id2]' -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(2);
                            things.should.containEql(Things.ObjectId(results.things[0]._id));
                            things.should.containEql(Things.ObjectId(results.things[1]._id));

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /things', function () {

        it('must test API compliant to filter by things as elements list comma separated  ---> things="_id1, _id2"', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var things=results.things[0]._id + "," + results.things[1]._id;


                    request.get({
                        url: APIURL + '?things='+things,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to filter by things as elements list comma separated things='_id1, _id2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(2);
                            things.should.containEql(results.things[0]._id);
                            things.should.containEql(results.things[1]._id);
                            things.indexOf(results.things[0]._id).should.be.greaterThanOrEqual(0);
                            things.indexOf(results.things[1]._id).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /things', function () {

        it('must test API compliant to filter by single value  ---> things="_id"', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var things=results.things[0]._id;


                    request.get({
                        url: APIURL + '?things='+things,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to filter by single value  ---> things='_id'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(1);
                            Things.ObjectId(results.things[0]._id).should.be.eql(things);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /things', function () {

        it('must test API compliant to filter by field as list comma separated ---> name="name1,name2"', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.things[0].name + "," + results.things[1].name;


                    request.get({
                        url: APIURL + '?name='+name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to filter by field as list comma separated -- name='name1,name2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(2);
                            name.indexOf(results.things[0].name).should.be.greaterThanOrEqual(0);
                            name.indexOf(results.things[1].name).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /things', function () {

        it('must test API compliant to filter by multiple field as array or list comma separated ---> name=["name1","name2"]description="desc1,desc2]', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.things[0].name,results.things[1].name];
                    var description=results.things[0].description + "," + results.things[1].description;


                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description="+description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to filter by multiple field as array or list comma separated --- name=['name1','name2'] description='desc1,desc2]'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(2);
                            results.things[0].name.should.be.equalOneOf([results.things[0].name , results.things[1].name ]);
                            results.things[1].name.should.be.equalOneOf([results.things[0].name , results.things[1].name ]);
                            description.indexOf(results.things[0].description).should.be.greaterThanOrEqual(0);
                            description.indexOf(results.things[1].description).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /things', function () {

        it('must test order results desc', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test order results desc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(50);
                            results.things[0].name.should.be.greaterThan(results.things[1].name);
                            results.things[1].name.should.be.greaterThan(results.things[2].name);
                            results.things[2].name.should.be.greaterThan(results.things[3].name);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /things', function () {

        it('must test order results asc', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test order results asc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(50);
                            results.things[3].name.should.be.greaterThan(results.things[2].name);
                            results.things[2].name.should.be.greaterThan(results.things[1].name);
                            results.things[1].name.should.be.greaterThan(results.things[0].name);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /things', function () {

        it('must test API compliance to field selection & projection  ---> fields="field1, field"', function (done) {


            Things.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var things=results.things[0]._id + "," + results.things[1]._id;


                    request.get({
                        url: APIURL + '?things='+things+"&fields=name,ownerId",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /things: 'must test API compliant to field selection  ---> fields=\"field1, field\"'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('things');
                            results._metadata.totalCount.should.be.equal(false);
                            results.things.length.should.be.equal(2);
                            things.should.containEql(results.things[0]._id);
                            things.should.containEql(results.things[1]._id);
                            things.indexOf(results.things[0]._id).should.be.greaterThanOrEqual(0);
                            things.indexOf(results.things[1]._id).should.be.greaterThanOrEqual(0);
                            results.things[0].should.have.properties(["name","ownerId"]);
                            results.things[0].should.not.have.property("siteId");
                            results.things[0].should.not.have.property("description");
                        }
                        done();
                    });
                }
            });

        });

    });



});
