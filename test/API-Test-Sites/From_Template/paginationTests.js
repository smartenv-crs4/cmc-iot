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
var Sites = require('../../../DBEngineHandler/drivers/siteDriver')
var conf = require('propertiesmanager').conf
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/sites"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var siteDocuments = require('../../SetTestenv/createSitesDocuments')

var webUiToken
var siteId


describe('Sites API Test - [PAGINATION TESTS]', function() {

    before(function(done) {
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        Sites.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Site paginationTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Site paginationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        siteDocuments.createDocuments(100, function(err, foreignKeys) {
            if (err) consoleLogError.printErrorLog("Site paginationTests.js - beforeEach - Sites.create ---> " + err)
            siteId = foreignKeys.siteId;
            done()
        })
    })


    afterEach(function(done) {
        siteDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("Site paginationTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL, "sites", ["name", "description", "location", "locatedInSiteId"])


    /*

    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /sites', function(){

        it('must test ...', function(done){
           done();

        });
    });

     */

})
