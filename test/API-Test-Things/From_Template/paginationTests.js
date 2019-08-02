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
var Things = require('../../../DBEngineHandler/drivers/thingDriver');
var conf = require('propertiesmanager').conf;
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/things" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var thingDocuments=require('../../SetTestenv/createThingsDocuments');

var webUiToken;
var thingId;


describe('Things API Test - [PAGINATION TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        Things.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("Thing paginationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("Thing paginationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        thingDocuments.createDocuments(100,function(err,newThingId){
            if (err) consoleLogError.printErrorLog("Thing paginationTests.js - beforeEach - Things.create ---> " + err);
            thingId=newThingId;
            done();
        });
    });


    afterEach(function (done) {
        Things.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("Thing paginationTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL,"things",["description","name","ownerId","siteId","mobile","disabled","dismissed","vendorId"]);




    /*

    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /Things', function(){

        it('must test ...', function(done){
           done();

        });
    });

     */



});
