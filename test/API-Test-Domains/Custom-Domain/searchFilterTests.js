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
var conf = require('propertiesmanager').conf;
var request = require('request');
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/domains" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var consoleLogError=require('../../Utility/errorLogs');
var Domain = require('../../../DBEngineHandler/models/domains').Domain;
var domainDocuments=require('../../SetTestenv/createDomainsDocuments');

var webUiToken;
var domainId;


describe('Domains API Test - [SEARCH FILTERS]', function () {

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
        domainDocuments.deleteDocuments(function (err,elm) {
            if (err) consoleLogError.printErrorLog("Domain searchFilterTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Domain searchFilterTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        domainDocuments.createDocuments(100,function(err,ForeignKeys){
            if (err) consoleLogError.printErrorLog("Domain searchFilterTests.js - beforreEach - Domains.create ---> " + err);
            domainId=ForeignKeys.domainId;
            done();
        });
    });


    afterEach(function (done) {
        domainDocuments.deleteDocuments(function (err, elm) {
            if (err) consoleLogError.printErrorLog("Domain searchFilterTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });




    describe('GET /domains', function () {

        it('must test API compliant to field selection: fields projection [name]', function (done) {

            request.get({
                url: APIURL + '?fields=name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to field selection: fields projection [name]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('domains');
                    results._metadata.totalCount.should.be.equal(false);
                    results.domains.length.should.be.equal(conf.pagination.limit);
                    results.domains[0].should.have.properties("name");
                    should(results.domains[0].description).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe('GET /domains', function () {

        it('must test API compliant to field selection by ID: fields projection [name]', function (done) {


            Domains.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var id=results.domains[0]._id;
                    request.get({
                        url: APIURL + "/" + id+"?fields=name",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to field selection by ID: fields projection [name]' -->" + error.message);
                        else {
                            var results = JSON.parse(body);
                            results.should.have.properties("name");
                            id.should.be.eql(Domains.ObjectId(results._id));
                            should(results.description).be.eql(undefined);
                        }
                        done();
                    });
                }
            });
        });

    });


    describe('GET /domains', function () {

        it('must test API compliant to field selection: fields projection must not include  name [-name]', function (done) {

            request.get({
                url: APIURL + '?fields=-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to field selection: fields projection must not include  name [-name]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('domains');
                    results._metadata.totalCount.should.be.equal(false);
                    results.domains.length.should.be.equal(conf.pagination.limit);
                    results.domains[0].should.have.properties("description");
                    should(results.domains[0].name).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe('GET /domains', function () {

        it('must test API compliant to field selection: fields projection must not include  description and name [-description -name]', function (done) {

            request.get({
                url: APIURL + '?fields=-description,-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to field selection: fields projection must not include  description and name [-description -name]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('domains');
                    results._metadata.totalCount.should.be.equal(false);
                    results.domains.length.should.be.equal(conf.pagination.limit);
                    should(results.domains[0].name).be.eql(undefined);
                    results.domains[0].should.have.properties("_id");
                    should(results.domains[0].description).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe('GET /domains', function () {

        it('must test API compliant to filter by domains as array ---> domains=[_id1,_id2]', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var domains=[results.domains[0]._id,results.domains[1]._id];
                    request.get({
                        url: APIURL + '?domains='+results.domains[0]._id+"&domains="+results.domains[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to filter by domains as array domains=[_id1,_id2]' -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(2);
                            domains.should.containEql(Domains.ObjectId(results.domains[0]._id));
                            domains.should.containEql(Domains.ObjectId(results.domains[1]._id));

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /domains', function () {

        it('must test API compliant to filter by domains as elements list comma separated  ---> domains="_id1, _id2"', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var domains=results.domains[0]._id + "," + results.domains[1]._id;


                    request.get({
                        url: APIURL + '?domains='+domains,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to filter by domains as elements list comma separated domains='_id1, _id2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(2);
                            domains.should.containEql(results.domains[0]._id);
                            domains.should.containEql(results.domains[1]._id);
                            domains.indexOf(results.domains[0]._id).should.be.greaterThanOrEqual(0);
                            domains.indexOf(results.domains[1]._id).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /domains', function () {

        it('must test API compliant to filter by single value  ---> domains="_id"', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var domains=results.domains[0]._id;


                    request.get({
                        url: APIURL + '?domains='+domains,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to filter by single value  ---> domains='_id'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(1);
                            Domains.ObjectId(results.domains[0]._id).should.be.eql(domains);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /domains', function () {

        it('must test API compliant to filter by field as list comma separated ---> name="name1,name2"', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.domains[0].name + "," + results.domains[1].name;


                    request.get({
                        url: APIURL + '?name='+name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to filter by field as list comma separated -- name='name1,name2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(2);
                            name.indexOf(results.domains[0].name).should.be.greaterThanOrEqual(0);
                            name.indexOf(results.domains[1].name).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /domains', function () {

        it('must test API compliant to filter by multiple field as array or list comma separated ---> name=["name1","name2"] description="desc1,desc2]', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.domains[0].name,results.domains[1].name];
                    var description=results.domains[0].description + "," + results.domains[1].description;


                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description="+description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to filter by multiple field as array or list comma separated --- name=['name1','name2'] description='desc1,desc2]'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(2);
                            results.domains[0].name.should.be.equalOneOf([results.domains[0].name , results.domains[1].name ]);
                            results.domains[1].name.should.be.equalOneOf([results.domains[0].name , results.domains[1].name ]);
                            description.indexOf(results.domains[0].description).should.be.greaterThanOrEqual(0);
                            description.indexOf(results.domains[1].description).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /domains', function () {

        it('must test order results desc', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test order results desc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(50);
                            results.domains[0].name.should.be.greaterThan(results.domains[1].name);
                            results.domains[1].name.should.be.greaterThan(results.domains[2].name);
                            results.domains[2].name.should.be.greaterThan(results.domains[3].name);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /domains', function () {

        it('must test order results asc', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test order results asc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(50);
                            results.domains[3].name.should.be.greaterThan(results.domains[2].name);
                            results.domains[2].name.should.be.greaterThan(results.domains[1].name);
                            results.domains[1].name.should.be.greaterThan(results.domains[0].name);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /domains', function () {

        it('must test API compliant to field selection & projection  ---> fields="field1, field"', function (done) {


            Domain.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var domains=results.domains[0]._id + "," + results.domains[1]._id;


                    request.get({
                        url: APIURL + '?domains='+domains+"&fields=name",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /domains: 'must test API compliant to field selection  ---> fields=\"field1, field\"'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('domains');
                            results._metadata.totalCount.should.be.equal(false);
                            results.domains.length.should.be.equal(2);
                            domains.should.containEql(results.domains[0]._id);
                            domains.should.containEql(results.domains[1]._id);
                            domains.indexOf(results.domains[0]._id).should.be.greaterThanOrEqual(0);
                            domains.indexOf(results.domains[1]._id).should.be.greaterThanOrEqual(0);
                            results.domains[0].should.have.properties(["name"]);
                            results.domains[0].should.not.have.property("description");
                        }
                        done();
                    });
                }
            });
        });
    });

});
