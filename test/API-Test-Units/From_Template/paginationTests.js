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
var Units = require('../../../DBEngineHandler/drivers/unitDriver')
var conf = require('propertiesmanager').conf
var APIURL = conf.testConfig.testUrl + ":" +  conf.microserviceConf.port + "/units"
var commonFunctionTest = require("../../SetTestenv/testEnvironmentCreation")
var unitDocuments = require('../../SetTestenv/createUnitsDocuments')

var webUiToken
var unitId


describe('Units API Test - [PAGINATION TESTS]', function() {

    before(function(done) {
        commonFunctionTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })


    after(function(done) {
        unitDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("Unit paginationTests.js - after - deleteMany ---> " + err)
            commonFunctionTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Unit paginationTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        unitDocuments.createDocuments(100, function(err, foreignKey) {
            if (err) consoleLogError.printErrorLog("Unit paginationTests.js - beforeEach - Units.create ---> " + err)
            unitId = foreignKey.unitId;
            done()
        })
    })


    afterEach(function(done) {
        unitDocuments.deleteDocuments(function(err, elm) {
            if (err) consoleLogError.printErrorLog("Unit paginationTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    require('../../API_Compliant-Templates/pagination').paginationTests(APIURL, "units", ["name", "symbol", "minValue", "maxValue", "observedPropertyId"])


    /*

    UNCOMMENT to define other CUSTOM tests

    describe('test Type : eg. POST /Units', function(){

        it('must test ...', function(done){
           done();

        });
    });

     */

})
