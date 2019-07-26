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


var conf = require('propertiesmanager').conf
var APIURL = conf.testConfig.testUrl + ":" + conf.testConfig.testPort + "/deviceTypes"


require('../../API_Compliant-Templates/sqlInjectionSecurity').sqlInjectionSecurity(APIURL, "deviceTypes", "name")


/*

UNCOMMENT to define other CUSTOM tests


describe('Test Title eg. DeviceTypes API Tests', function () {

    before(function (done) {
       done();
    });

    after(function (done) {
        done();
    });



    beforeEach(function (done) {
      done();
    });


    afterEach(function (done) {
       done();
    });


    describe('test Type : eg. POST /DeviceTypes', function(){

        it('must test ...', function(done){
           done();

        });
    });

});
 */
