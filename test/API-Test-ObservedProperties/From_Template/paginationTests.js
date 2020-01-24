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

var _ = require('underscore')._
var ObservedProperties = require('../../../DBEngineHandler/drivers/observedPropertyDriver')
var conf = require('propertiesmanager').conf
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/observedProperties"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var observedPropertyDocuments = require('../../SetTestenv/createObservedPropertiesDocuments')

var webUiToken
var observedPropertyId


describe('ObservedProperties API Test - [PAGINATION TESTS]', function() {

    before(function(done) {
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        ObservedProperties.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("ObservedProperty paginationTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("ObservedProperty paginationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        observedPropertyDocuments.createDocuments(100, function(err, foreignKeys) {
            if (err) consoleLogError.printErrorLog("ObservedProperty paginationTests.js - beforeEach - ObservedProperties.create ---> " + err)
            observedPropertyId = foreignKeys.observedPropertyId;
            done()
        })
    })


    afterEach(function(done) {
        observedPropertyDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("ObservedProperty paginationTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL, "observedProperties", ["description", "name"])


    /*
    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /observedProperties', function(){
        it('must test ...', function(done){
           done();
        });
    });
     */


})
