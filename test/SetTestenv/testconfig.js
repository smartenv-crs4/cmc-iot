/*
 ############################################################################
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


function customTestConfig(config){


    var testConfig=config.testConfig;


    var adminUserToken=testConfig.adminTokens.concat(testConfig.usertokens);
    var adminAuthAppToken=testConfig.adminTokens.concat(testConfig.authApptokens);
    var adminUserAuthAppToken=testConfig.adminTokens.concat(testConfig.authApptokens).concat(testConfig.usertokens);



    testConfig.myWebUITokenToSignUP=config.auth_token;
    testConfig.userTypeTest.type= testConfig.usertokens[0];
    testConfig.webUiAppTest.type= testConfig.authApptokens[0];


    testConfig.AuthRoles=[
                {URI:"/configuration", token:testConfig.adminTokens, method:"GET"},
                {URI:"/devices", token:testConfig.authApptokens, method:"GET"},
                {URI:"/devices",token:testConfig.adminTokens, method:"POST"},
    ];
    testConfig.webUiID="";

}

// {URI:"/devices/:id",token:adminUserToken, method:"GET"},
// {URI:"/devices/:id",token:adminUserToken, method:"PUT"},
// {URI:"/devices/:id",token:testConfig.adminTokens, method:"DELETE"},
// {URI:"/devices/signup",token:testConfig.authApptokens, method:"POST"},
// {URI:"/devices/signin",token:testConfig.authApptokens, method:"POST"},
// {URI:"/devices/:id/actions/resetpassword",token:adminAuthAppToken, method:"POST"},
// {URI:"/devices/:id/actions/setpassword",token:adminUserAuthAppToken, method:"POST"},
// {URI:"/devices/:id/actions/changeuserid",token:testConfig.adminTokens, method:"POST"},
// {URI:"/devices/:id/actions/enable",token:testConfig.adminTokens, method:"POST"},
// {URI:"/devices/:id/actions/disable",token:testConfig.adminTokens, method:"POST"},
// {URI:"/devices/actions/email/find/:term",token:testConfig.adminTokens, method:"GET"},
// {URI:"/devices/actions/search",token:testConfig.adminTokens, method:"post"},
// {URI:"/devices/:id/actions/changeusername",token:testConfig.adminTokens, method:"post"}

module.exports.customTestConfig = customTestConfig;

