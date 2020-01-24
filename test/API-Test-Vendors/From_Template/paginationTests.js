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
var Vendors = require('../../../DBEngineHandler/drivers/vendorDriver')
var conf = require('propertiesmanager').conf
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/vendors"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var vendorDocuments = require('../../SetTestenv/createVendorsDocuments')

var webUiToken
var vendorId


describe('Vendors API Test - [PAGINATION TESTS]', function() {

    before(function(done) {
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        vendorDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor paginationTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Vendor paginationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        vendorDocuments.createDocuments(100, function(err, foreignKey) {
            if (err) consoleLogError.printErrorLog("Vendor paginationTests.js - beforeEach - Vendors.create ---> " + err)
            vendorId = foreignKey.vendorId
            done()
        })
    })


    afterEach(function(done) {
        vendorDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor paginationTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL, "vendors", ["description", "name"])


    /*
    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /vendors', function(){
        it('must test ...', function(done){
           done();
        });
    });
     */


})
