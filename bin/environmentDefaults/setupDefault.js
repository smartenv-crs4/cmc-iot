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


var async = require('async');
var request = require('request');
var config = require('propertiesmanager').conf;


module.exports.setupDefaults = function (callbackResponse) {

    async.series([
            function (callback) {  // create cmc-IoT External APP(To mange dismissed Things) Token Type

                var rqparams = {
                    url: config.authUrl + "/apptypes",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + config.auth_token}
                };

                request.get(rqparams, function (err, response, body) { //check if type token exist
                    if (err) callback("Default cmc-IoT External APP type creation(check if dismissed thing APP token type exist) :" + err, null);

                    var responseBody;

                    if(response.statusCode==200)
                        responseBody = JSON.parse(body);
                    else responseBody = {_metadata:{totalCount:0}};

                        for (var index = 0; index < responseBody._metadata.totalCount; ++index) {
                            if (config.cmcIoTThingsOwner.tokenType.indexOf(responseBody.userandapptypes[index].name) >= 0)
                                index = responseBody._metadata.totalCount + 1;
                        }

                    if (index == responseBody._metadata.totalCount) { // if not exist create it
                        //create tokentype
                        rqparams.body = JSON.stringify({apptype: {name: config.cmcIoTThingsOwner.tokenType}});

                        request.post(rqparams, function (err, response, body) {
                            if (err) callback("Default cmc-IoT External APP type creation(dismissed thing App token type creation[REQ Error]) :" + err, null);
                            if (response.statusCode == 201) {
                                callback(null, "done")
                            } else {
                                responseBody = JSON.parse(body);
                                callback("Default cmc-IoT External APP type creation (dismissed thing App token type creation[Resp Error]) :" + responseBody.error_message, null);
                            }
                        });

                    } else { // token type already exixts
                        callback(null, "done");
                    }
                });
            },
            function (callback) { // create cmc-IoT External APP(To mange dismissed Things)



                var rqparams = {
                    url: config.cmcAppUrl + "/apps/actions/search",
                    headers: {'content-type': 'application/json', 'Authorization': "Bearer " + config.auth_token},
                    body: JSON.stringify({searchterm: {email: config.cmcIoTThingsOwner.email, type: ["all"]}})
                };


                request.post(rqparams, function (err, response, body) { //check if default app exist
                    if (err) callback("Default cmc-IoT External APP type creation(check if app already exist[REQ]) :" + err, null);

                    var responseBody = JSON.parse(body);


                    if (response.statusCode == 200) {
                        if (responseBody._metadata.totalCount == 0) { // if not exist create it

                            rqparams.body = JSON.stringify({
                                application: {
                                    "email": config.cmcIoTThingsOwner.email,
                                    "password": config.cmcIoTThingsOwner.password,
                                    "type": config.cmcIoTThingsOwner.tokenType,
                                    "name": config.cmcIoTThingsOwner.name
                                }
                            });
                            rqparams.url = config.cmcAppUrl + "/apps/signup";
                            request.post(rqparams, function (err, response, body) {
                                if (err) callback("Default cmc-IoT External APP type creation(dismissed thing App creation[REQ]) :" + err, null);
                                if (response.statusCode == 201) {
                                    callback(null, JSON.parse(body).created_resource._id);
                                } else {
                                    responseBody = JSON.parse(body);
                                    callback("Default cmc-IoT External APP type creation((dismissed thing App creation[RES]) :" + responseBody.error_message);
                                }
                            });

                        } else {
                            if (config.cmcIoTThingsOwner.tokenType.indexOf(responseBody.apps[0].type) >= 0) {
                                // make a login and get _id
                                rqparams.body = JSON.stringify({
                                    "username": config.cmcIoTThingsOwner.email,
                                    "password": config.cmcIoTThingsOwner.password
                                });
                                rqparams.url = config.cmcAppUrl + "/apps/signin/";
                                request.post(rqparams, function (err, response, body) {
                                    if (err) callback("Default cmc-IoT External APP type creation (dismissed thing App login[REQ]) :" + err, null);

                                    if (response.statusCode == 200) {
                                        callback(null, (JSON.parse(body)).access_credentials.userId);
                                    } else {
                                        responseBody = JSON.parse(body);
                                        callback("Default cmc-IoT External APP type creation (dismissed thing App login[RES]) :" + responseBody.error_message);
                                    }
                                });
                            } else
                                callback("Default cmc-IoT External APP type creation. Default cmcIot dismissed Thing owner  already exists but user type is:" + responseBody.users[0].type, null);
                        }
                    } else {
                        callback("Default cmc-IoT External APP type creation(check if app already exist[RES]) :" + responseBody.error_message, null);
                    }
                });
            }
        ],
// optional callback
        function (err, results) {
            callbackResponse(err, results[1]);
        });


}