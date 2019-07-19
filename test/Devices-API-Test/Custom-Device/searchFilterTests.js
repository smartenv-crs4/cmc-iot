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
var consoleLogError=require('../../Utility/errorLogs');
var Device = require('../../../DBEngineHandler/models/devices').Device;

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




    describe('GET /devices', function () {

        it('must test API compliant to field selection: fields projection [name, description]', function (done) {

            request.get({
                url: APIURL + '?fields=name,description',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to field selection: fields projection [name, description]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('devices');
                    results._metadata.totalCount.should.be.equal(false);
                    results.devices.length.should.be.equal(conf.pagination.limit);
                    results.devices[0].should.have.properties("name");
                    results.devices[0].should.have.properties("description");
                    should(results.devices[0].thingId).be.eql(undefined);
                    should(results.devices[0].typeId).be.eql(undefined);
                }
                done();
            });

        });

    });


    describe('GET /devices', function () {

        it('must test API compliant to field selection: fields projection must not include  thingId [-thingId]', function (done) {

            request.get({
                url: APIURL + '?fields=-thingId',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to field selection: fields projection must not include  thingId [-thingId]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('devices');
                    results._metadata.totalCount.should.be.equal(false);
                    results.devices.length.should.be.equal(conf.pagination.limit);
                    results.devices[0].should.have.properties("name");
                    results.devices[0].should.have.properties("description");
                    should(results.devices[0].thingId).be.eql(undefined);
                    results.devices[0].should.have.properties("typeId");
                }
                done();
            });

        });

    });


    describe('GET /devices', function () {

        it('must test API compliant to field selection: fields projection must not include  thingId and name [-thingId -name]', function (done) {

            request.get({
                url: APIURL + '?fields=-thingId,-name',
                headers: {'Authorization': "Bearer " + webUiToken}
            }, function (error, response, body) {

                if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to field selection: fields projection must not include  thingId and name [-thingId -name]' -->" + error.message);
                else {
                    response.statusCode.should.be.equal(200);
                    var results = JSON.parse(body);

                    results.should.have.property('_metadata');
                    results.should.have.property('devices');
                    results._metadata.totalCount.should.be.equal(false);
                    results.devices.length.should.be.equal(conf.pagination.limit);
                    should(results.devices[0].name).be.eql(undefined);
                    results.devices[0].should.have.properties("description");
                    should(results.devices[0].thingId).be.eql(undefined);
                    results.devices[0].should.have.properties("typeId");
                }
                done();
            });

        });

    });


    describe('GET /devices', function () {

        it('must test API compliant to filter by devices as array ---> devices=[_id1,_id2]', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var devices=[results.devices[0]._id,results.devices[1]._id];
                    request.get({
                        url: APIURL + '?devices='+results.devices[0]._id+"&devices="+results.devices[1]._id,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to filter by devices as array devices=[_id1,_id2]' -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(2);
                            devices.should.containEql(Devices.ObjectId(results.devices[0]._id));
                            devices.should.containEql(Devices.ObjectId(results.devices[1]._id));

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /devices', function () {

        it('must test API compliant to filter by devices as elements list comma separated  ---> devices="_id1, _id2"', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var devices=results.devices[0]._id + "," + results.devices[1]._id;


                    request.get({
                        url: APIURL + '?devices='+devices,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to filter by devices as elements list comma separated devices='_id1, _id2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(2);
                            devices.should.containEql(results.devices[0]._id);
                            devices.should.containEql(results.devices[1]._id);
                            devices.indexOf(results.devices[0]._id).should.be.greaterThanOrEqual(0);
                            devices.indexOf(results.devices[1]._id).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });



    describe('GET /devices', function () {

        it('must test API compliant to filter by single value  ---> devices="_id"', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var devices=results.devices[0]._id;


                    request.get({
                        url: APIURL + '?devices='+devices,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to filter by single value  ---> devices='_id'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(1);
                            Devices.ObjectId(results.devices[0]._id).should.be.eql(devices);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /devices', function () {

        it('must test API compliant to filter by field as list comma separated ---> name="name1,name2"', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.devices[0].name + "," + results.devices[1].name;;


                    request.get({
                        url: APIURL + '?name='+name,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to filter by field as list comma separated -- name='name1,name2'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(2);
                            name.indexOf(results.devices[0].name).should.be.greaterThanOrEqual(0);
                            name.indexOf(results.devices[1].name).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /devices', function () {

        it('must test API compliant to filter by multiple field as array or list comma separated ---> name=["name1","name2"]description="desc1,desc2]', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.devices[0].name,results.devices[1].name];
                    var description=results.devices[0].description + "," + results.devices[1].description;


                    request.get({
                        url: APIURL + '?name=' + name[0] + "&name=" + name[1] + "&description="+description,
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to filter by multiple field as array or list comma separated --- name=['name1','name2'] description='desc1,desc2]'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(2);
                            results.devices[0].name.should.be.equalOneOf([results.devices[0].name , results.devices[1].name ]);
                            results.devices[1].name.should.be.equalOneOf([results.devices[0].name , results.devices[1].name ]);
                            description.indexOf(results.devices[0].description).should.be.greaterThanOrEqual(0);
                            description.indexOf(results.devices[1].description).should.be.greaterThanOrEqual(0);

                        }
                        done();
                    });
                }
            });

        });

    });


    describe('GET /devices', function () {

        it('must test order results desc', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortDesc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test order results desc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(50);
                            results.devices[0].name.should.be.greaterThan(results.devices[1].name);
                            results.devices[1].name.should.be.greaterThan(results.devices[2].name);
                            results.devices[2].name.should.be.greaterThan(results.devices[3].name);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /devices', function () {

        it('must test order results asc', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{

                    request.get({
                        url: APIURL + '?sortAsc=name,description',
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test order results asc'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(50);
                            results.devices[3].name.should.be.greaterThan(results.devices[2].name);
                            results.devices[2].name.should.be.greaterThan(results.devices[1].name);
                            results.devices[1].name.should.be.greaterThan(results.devices[0].name);
                        }
                        done();
                    });
                }
            });
        });

    });



    describe('GET /devices', function () {

        it('must test API compliant to field selection  ---> fields="field1, field"', function (done) {


            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var devices=results.devices[0]._id + "," + results.devices[1]._id;


                    request.get({
                        url: APIURL + '?devices='+devices+"&fields=name,thingId",
                        headers: {'Authorization': "Bearer " + webUiToken}
                    }, function (error, response, body) {

                        if(error) consoleLogError.printErrorLog("GET /devices: 'must test API compliant to field selection  ---> fields=\"field1, field\"'  -->" + error.message);
                        else {
                            response.statusCode.should.be.equal(200);
                            var results = JSON.parse(body);
                            results.should.have.property('_metadata');
                            results.should.have.property('devices');
                            results._metadata.totalCount.should.be.equal(false);
                            results.devices.length.should.be.equal(2);
                            devices.should.containEql(results.devices[0]._id);
                            devices.should.containEql(results.devices[1]._id);
                            devices.indexOf(results.devices[0]._id).should.be.greaterThanOrEqual(0);
                            devices.indexOf(results.devices[1]._id).should.be.greaterThanOrEqual(0);
                            results.devices[0].should.have.properties(["name","thingId"]);
                            results.devices[0].should.not.have.properties(["description","typeId"]);


                        }
                        done();
                    });
                }
            });

        });

    });



});
