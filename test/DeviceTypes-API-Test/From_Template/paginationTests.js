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
var DeviceTypes = require('../../../DBEngineHandler/drivers/deviceTypeDriver')
var conf = require('propertiesmanager').conf
var APIURL = conf.testConfig.testUrl + ":" + conf.microserviceConf.port + "/deviceTypes"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var deviceTypeDocuments = require('../../SetTestenv/createDeviceTypesDocuments')

var webUiToken
var deviceTypeId


describe('DeviceTypes API Test - [PAGINATION TESTS]', function() {

    before(function(done) {
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType paginationTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("DeviceType paginationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        deviceTypeDocuments.createDocuments(100, function(err, newDeviceTypeId) {
            if (err) consoleLogError.printErrorLog("DeviceType paginationTests.js - beforeEach - DeviceTypes.create ---> " + err)
            deviceTypeId = newDeviceTypeId
            done()
        })
    })


    afterEach(function(done) {
        DeviceTypes.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("DeviceType paginationTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL, "deviceTypes", ["description", "name", "observedPropertyId"])


    /*

    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /DeviceTypes', function(){

        it('must test ...', function(done){
           done();

        });
    });

     */

})
