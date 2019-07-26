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


var Vendors = require('../../../DBEngineHandler/drivers/vendorDriver')
var conf = require('propertiesmanager').conf
var request = require('request')
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort + "/vendors"
var commonFunctioTest = require("../../SetTestenv/testEnvironmentCreation")
var consoleLogError = require('../../Utility/errorLogs')
var vendorDocuments = require('../../SetTestenv/createVendorsDocuments')

var webUiToken
var vendorId


describe('Vendors API Test - [GENERAL TESTS]', function() {

    before(function(done) {
        this.timeout(0)
        commonFunctioTest.setAuthMsMicroservice(function(err) {
            if (err) throw (err)
            webUiToken = conf.testConfig.myWebUITokenToSignUP
            done()
        })
    })

    after(function(done) {
        this.timeout(0)
        Vendors.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor generalTesta.js - after - deleteMany ---> " + err)
            commonFunctioTest.resetAuthMsStatus(function(err) {
                if (err) consoleLogError.printErrorLog("Vendor generalTests.js - after - resetAuthMsStatus ---> " + err)
                done()
            })
        })
    })


    beforeEach(function(done) {
        vendorDocuments.createDocuments(100, function(err, newVendorId) {
            if (err) consoleLogError.printErrorLog("Vendor generalTests.js - beforeEach - Vendors.create ---> " + err)
            vendorId = newVendorId
            done()
        })
    })


    afterEach(function(done) {
        Vendors.deleteMany({}, function(err, elm) {
            if (err) consoleLogError.printErrorLog("Vendor generalTests.js - afterEach - deleteMany ---> " + err)
            done()
        })
    })


    describe('POST /vendor', function() {
        it('must test vendor creation [create Vendor]', function(done) {
            var bodyParam = JSON.stringify({vendor: {name: "name", description: "description"}})
            var requestParams = {
                url: APIURL,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.testConfig.adminToken},
                body: bodyParam
            }
            request.post(requestParams, function(error, response, body) {
                if (error) consoleLogError.printErrorLog("POST /vendor: 'must test vendor creation [create Vendor] -->" + error.message)
                else {
                    var results = JSON.parse(body)
                    response.statusCode.should.be.equal(201)
                    results.should.have.property('name')
                    results.should.have.property('description')
                }
                done()
            })
        })
    })


})