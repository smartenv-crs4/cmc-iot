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

var _ = require('underscore')._;
var async = require('async');
var ApiActions = require('../../../DBEngineHandler/drivers/apiActionDriver');
var conf = require('propertiesmanager').conf;
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port +"/apiActions" ;
var commonFunctioTest=require("../../SetTestenv/testEnvironmentCreation");
var apiActionDocuments=require('../../SetTestenv/createApiActionsDocuments');

var webUiToken;
var apiActionId;


describe('ApiActions API Test - [PAGINATION TESTS]', function () {

    before(function (done) {
        commonFunctioTest.setAuthMsMicroservice(function(err){
            if(err) throw (err);
            webUiToken=conf.testConfig.myWebUITokenToSignUP;
            done();
        });
    });

    after(function (done) {
        ApiActions.deleteMany({}, function (err,elm) {
            if (err) consoleLogError.printErrorLog("ApiAction paginationTests.js - after - deleteMany ---> " + err);
            commonFunctioTest.resetAuthMsStatus(function(err){
                if (err) consoleLogError.printErrorLog("ApiAction paginationTests.js - after - resetAuthMsStatus ---> " + err);
                done();
            });
        });
    });



    beforeEach(function (done) {

        apiActionDocuments.createDocuments(100,function(err,newApiActionId){
            if (err) consoleLogError.printErrorLog("ApiAction paginationTests.js - beforeEach - ApiActions.create ---> " + err);
            apiActionId=newApiActionId;
            done();
        });
    });


    afterEach(function (done) {
        ApiActions.deleteMany({}, function (err, elm) {
            if (err) consoleLogError.printErrorLog("ApiAction paginationTests.js - afterEach - deleteMany ---> " + err);
            done();
        });
    });



    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL,"apiActions",["actionName","deviceTypeId","method","header","bodyPrototype"]);




    /*

    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /ApiActions', function(){

        it('must test ...', function(done){
           done();

        });
    });

     */



});
