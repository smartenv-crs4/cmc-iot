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

var conf = require('propertiesmanager').conf;
var request=require('request');
var async=require("async");
var db = require("../../DBEngineHandler/models/mongooseConnection");
var server;
var app = require('../../app');
var roles=require('./testconfig');
var setupEnvironmentDefaults=require('../../bin/environmentDefaults/setupDefault');
var errorHandler=require('../Utility/errorLogs');



var authHost = conf.authUrl;


exports.setAuthMsMicroservice=function(doneCallback){

    async.series([
        function(callback){ // set configuration for test
            roles.customTestConfig(conf);
            callback();
        },
        function(callback){ // check if AuthMs is in dev mode
            request.get(authHost+"/env", function(error, response, body){
                if(error) {
                    throw error;
                }else{
                    var env=JSON.parse(body).env;
                    if(env=="dev"){

                        setupEnvironmentDefaults.setupDefaults(function(err,cmc_IotDismissedID) {
                            if (!err) {
                                console.log("cmc-IoT_ThingsOwneId " + cmc_IotDismissedID);
                                conf.cmcIoTThingsOwner._id = cmc_IotDismissedID;
                                db.connect(function (err) {
                                    if (err) console.log("!!! ERROR:--> Error in setAuthMsMicroservice function due to can't connect to database  " + err);

                                    app.set('port', process.env.PORT || conf.microserviceConf.port);

                                    server = app.listen(app.get('port'), function () {
                                        console.log('TEST Express server listening on port ' + server.address().port);
                                        callback(null,"one");
                                    });
                                });
                            }else{
                                errorHandler.printErrorLog("Test can not start due to " + err );
                                throw (err);
                            }
                        });
                    }else{
                        throw (new Error("authms isn't in dev mode"));
                    }
                }
            });
        },
        function(callback){ // create admins and users type tokens
            var users=conf.testConfig.adminTokens.concat(conf.testConfig.usertokens);
            var usersId=[];
            async.eachSeries(users,function(tokenT,clb){
                var rqparams={
                    url:authHost+"/usertypes",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token},
                    body:JSON.stringify({usertype:{name:tokenT}})
                };
                request.post(rqparams, function(error, response, body){
                    if(error) {
                        console.log("!!! ERROR:--> Error in setAuthMsMicroservice function due to can't create user token in cmc-auth  " + err);
                        throw error;
                    }else{
                        usersId.push(JSON.parse(body)._id);
                        clb();
                    }
                });

            },function(err){
                conf.testConfig.usersId=usersId;
                callback(null,"two");
            });

        },
        function(callback){ // create external application token type
            var apps=conf.testConfig.authApptokens;
            var appsId=[];
            async.eachSeries(apps,function(tokenT,clb){
                var rqparams={
                    url:authHost+"/apptypes",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token},
                    body:JSON.stringify({apptype:{name:tokenT}})
                };
                request.post(rqparams, function(error, response, body){

                    if(error) {
                        console.log("!!! ERROR:--> Error in setAuthMsMicroservice function due to can't create application token type in cmc-auth  " + err);
                        throw err;

                    }else{
                        appsId.push(JSON.parse(body)._id);
                        clb();
                    }
                });

            },function(err){
                conf.testConfig.appsId=appsId;
                callback(null,"three");
            });
        },
        function(callback){// make external application login
            var appBody = JSON.stringify({app:conf.testConfig.webUiAppTest});
            request.post({
                url: authHost + "/authapp/signup",
                body: appBody,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
            }, function (error, response,body) {
                if(error) {
                    console.log("!!! ERROR:--> Error in setAuthMsMicroservice function due to can't complete external application login in cmc-auth  " + err);
                    throw error;
                }else{
                    var results = JSON.parse(response.body);
                    if(!results.error) {
                        conf.testConfig.myWebUITokenToSignUP = results.apiKey.token;
                        conf.testConfig.webUiID=results.userId;
                    }
                    callback(null,"five");
                }
            });

        },
        function(callback){// make admin  login
            request.post({
                url: authHost + "/authuser/signin",
                body: JSON.stringify(conf.testConfig.adminLogin),
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
            }, function (error, response,body) {
                if(error) {
                    console.log("!!! ERROR:--> Error in setAuthMsMicroservice function due to can't complete admin login in cmc-auth  " + err);
                    throw error;
                }else{
                    var results = JSON.parse(response.body);
                    if(!results.error) {
                        conf.testConfig.adminToken = results.apiKey.token;
                        conf.testConfig.adminID=results.userId;
                    }
                    callback(null,"five");
                }
            });

        },
        function(callback){ // create Authorisation Roles
            var roles=conf.testConfig.AuthRoles;
            async.forEachOf(roles,function(value,key,clb){
                var rqparams={
                    url:authHost+"/authms/authendpoint",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token},
                    body:JSON.stringify({microservice:{name:conf.testConfig.msName,URI:value.URI, authToken:value.token, method:value.method}})
                };
                request.post(rqparams, function(error, response, body){

                    if(error) {
                        console.log("!!! ERROR:--> Error in setAuthMsMicroservice function due to can't create authorisation roles in cmc-auth  " + err);
                        throw err;
                    }else{
                        value.id=JSON.parse(body)._id;
                        clb();
                    }
                });

            },function(err){
                conf.testConfig.AuthRoles=roles;
                callback(null,"four");
            });

        }
    ],function(err,resp){
        if(err)
            doneCallback(err);
        else
            doneCallback();
    });
}

exports.resetAuthMsStatus = function(callback) {

    async.series([
        function(clb){
            request.del({   // delete application
                url: authHost + "/authapp/"+conf.testConfig.webUiID,
                headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
            }, function (error, response,body) {
                if(error) {
                    clb(error,"ONE");
                }else{
                    clb(null,"ONE");
                }
            });
        },
        function(clb){ //delete roles
            var roles=conf.testConfig.AuthRoles;
            async.forEachOf(roles,function(value,key,clbeach){
                var rqparams={
                    url: authHost+"/authms/authendpoint/"+ value.id,
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
                };

                request.delete(rqparams, function(error, response, body){
                    if(error) {
                        clbeach(error);
                    }else{
                        clbeach();
                    }
                });

            },function(err){
                if(err)
                    clb(err,"TWO");
                else
                    clb(null,"TWO");
            });
        },
        function(clb){  // delete applications token types
            var roles=conf.testConfig.appsId;
            async.forEachOf(roles,function(value,key,clbeach){
                var rqparams={
                    url: authHost+"/apptypes/"+ value,
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
                };

                request.delete(rqparams, function(error, response, body){
                    if(error) {
                        clbeach(error);
                    }else{
                        clbeach();
                    }
                });

            },function(err){
                if(err)
                    clb(err,"THREE");
                else
                    clb(null,"THREE");
            });
        },
        function(clb){ // delete user token type
            var roles=conf.testConfig.usersId;
            async.forEachOf(roles,function(value,key,clbeach){
                var rqparams={
                    url: authHost+"/usertypes/"+ value,
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.auth_token}
                };

                request.delete(rqparams, function(error, response, body){
                    if(error) {
                        clbeach(error);
                    }else{
                        clbeach();
                    }
                });

            },function(err){
                if(err)
                    clb(err,"FOUR");
                else
                    clb(null,"FOUR");
            });
        }
    ],function(err,respo){
        if(err)
            throw (err);
        else{
            server.close();
            db.disconnect(function (err, res) {
                if (err) console.log("!!! ERROR:--> Error in resetAuthMsStatus function due to can't clean test environment" + err);
                callback(null);
            });
        }


    });
};


