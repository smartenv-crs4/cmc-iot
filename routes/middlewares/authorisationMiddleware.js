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
var request = require('request');
var _=require("underscore");
var errorLog=require('../utility/error');
let errorHeader="Error in authorisationMiddleware in function";



exports.validateIfOptionIsActive= function(optionValue){

    // Only for test waiting for ACL microservice

    return (function(req,res,next){

        if(conf.cmcIoTOptions[optionValue]){
            next();
        }else{
            return res.boom.unauthorized("This resource is not accessible due to cmcIot Administrator disable it in microservice configuration.");
        }
    });


};


exports.checkToken = function(req, res, next) {

    if(req.fastForward===conf.fastForwardPsw) {
      next();
    }else{
        try {
            var token = (req.body && req.body.access_token) || (req.query && req.query.access_token); // || req.headers['x-access-token'];
            if (req.headers['authorization']) {
                var value = req.headers['authorization'];
                header = value.split(" ");
                if (header.length == 2)
                    if (header[0] == "Bearer") {
                        token = header[1];
                    }
            }

            if (token) {
                var path = (_.isEmpty(req.route)) ? req.path : req.route.path;
                var URI = (_.isEmpty(req.baseUrl)) ? path : (req.baseUrl + path);
                URI = URI.endsWith("/") ? URI : URI + "/";

                var rqparams = {
                    url: conf.authUrl + '/tokenactions/checkiftokenisauth',
                    headers: {'Authorization': "Bearer " + conf.auth_token, 'content-type': 'application/json'},
                    body: JSON.stringify({decode_token: token, URI: URI, method: req.method})
                };


                var decoded = null;

                request.post(rqparams, function (error, response, body) {
                    try {
                        if (error) {
                            errorLog.printErrorLog(errorHeader + " checkToken(response from cmc-auth) due to " + error);
                            return res.boom.badImplementation(error);
                        } else {

                            decoded = JSON.parse(body);

                            if (_.isUndefined(decoded.valid)) {
                                errorLog.printErrorLog(errorHeader + " checkToken(token validity check) due to " + decoded.error_message);
                                return res.boom.badImplementation(decoded.error_message);
                            } else {
                                if (decoded.valid == true) {
                                    req.decodedToken = decoded.token;
                                    next();
                                } else {
                                    return res.boom.unauthorized(decoded.error_message);
                                }
                            }
                        }
                    } catch (ex) {
                        errorLog.printErrorLog(errorHeader + " checkToken( exception from cmc-auth request) due to " + ex);
                        return res.boom.badImplementation(ex);
                    }
                });

            } else {
                return res.boom.badRequest("Unauthorized: Access token required, you are not allowed to use the resource");
            }
        } catch (ex) {
            errorLog.printErrorLog(errorHeader + " checkToken(method exception) due to " + ex);
            return res.boom.badImplementation(ex);
        }
    }

};


// Todo: when available must be sync with ACL Microservice. It check if user Can Read and get All other Authorization verb (Write, Update etc etc) for this resource
exports.ensureCanGetResourceAndReturnAllOtherPermissions = function(req,res,next){

    // Only for test waiting for ACL microservice
    if(req.query.disableAdmin)
        req.acl=["read"];
    else
        req.acl=["read","admin"];

    next();
};


// exports.ensureUserIsAdminOrSelf = function(req,res,next){
//
//     if(req.fastForward===conf.fastForwardPsw) {
//         next();
//     }else {
//         var id = (req.params.id).toString();
//
//         if (!req.decodedToken)
//             return res.status(500).send({
//                 error: "InternalError",
//                 error_message: 'decoded token not found in request'
//             });
//
//
//         if (req.decodedToken.mode === "user") { // ckeck only if is user token
//
//
//             if (!(((conf.adminUser.indexOf(req.decodedToken.type) >= 0)) || (req.decodedToken._id == id))) // se il token è di un utente non Admin e non è l'utent stesso
//                 return res.status(401).send({
//                     error: "Forbidden",
//                     error_message: 'only ' + conf.adminUser + ' or self user are authorized to access the resource. your Token Id:' + req.decodedToken._id + " searchId:" + id
//                 });
//             else
//                 next();
//         } else {
//             next();
//         }
//     }
//
// };


// exports.ensureFieldAuthorisedForSomeUsers = function(usersListFunction,fieldsToCkeck,reqFieldsFunction){
//
//
//     return (function(req,res,next){
//
//         if(req.fastForward===conf.fastForwardPsw) {
//             next();
//         }else {
//
//
//             if (!req.decodedToken)
//                 return res.status(500).send({
//                     error: "InternalError",
//                     error_message: 'decoded token not found in request'
//                 });
//
//
//             if (req.decodedToken.mode === "user") { // ckeck only if is user token
//
//                 usersList = usersListFunction();
//                 fields = reqFieldsFunction(req);
//
//                 var filteredFields = _.filter(fieldsToCkeck, function (value) {
//                     return _.has(fields, value);
//                 });
//
//                 if (!(usersList.indexOf(req.decodedToken.type) >= 0) && filteredFields.length > 0) {
//                     return res.status(401).send({
//                         error: "Forbidden",
//                         error_message: 'only ' + usersList + ' users can set ' + filteredFields
//                     });
//                 } else
//                     next();
//             }else{
//                 next();
//             }
//         }
//     });
// };



//
//
// exports.ensureUserIsAdmin = function(req,res,next){
//
//     if (! req.decodedToken )
//         return res.status(401).send({ error: "Forbidden", error_message:'you are not authorized to access the resource (no user in the request)'});
//     if(!(conf.adminUser.indexOf(req.decodedToken.type)>=0)) // se il token è di un utente non Admin
//         return res.status(401).send({ error: "Forbidden",error_message:'only ' +conf.adminUser+' are authorized to access the resource'});
//     else
//         next();
// };
//
//
// exports.ensureUserIsAuthAppOrAdmin = function(req,res,next){
//
//
//     if (!req.decodedToken )
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignUpAuthorizedAppAndMS.indexOf(req.decodedToken.type)>=0) || (conf.adminUser.indexOf(req.decodedToken.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignUpAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };
//
//
//
// exports.ensureUserIsAdminOrSelfOrResetToken = function(req,res,next){
//
//     var id = req.param('id').toString();
//
//     if(req.body.reset_token) next();
//     else {
//         if (!req.decodedToken)
//             return res.status(401).send({
//                 error: "Forbidden",
//                 error_message: 'you are not authorized to access the resource (no user in the request)'
//             });
//         if (!(((conf.adminUser.indexOf(req.decodedToken.type) >= 0)) || (req.decodedToken._id == id))) // se il token è di un utente non Admin e non è l'utent stesso
//             return res.status(401).send({
//                 error: "Forbidden",
//                 error_message: 'only ' + conf.adminUser + ' or self user are authorized to access the resource'
//             });
//         else
//             next();
//     }
// };
//
// exports.ensureUserIsAuthApp = function(req,res,next){
//
//
//     if (!req.decodedToken )  // shoul not be necessary becaus decode tken check if APikey exist
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignUpAuthorizedAppAndMS.indexOf(req.decodedToken.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignUpAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };
//
//
// exports.ensureUserIsAuthAppSignIn = function(req,res,next){
//
//
//     if (!req.decodedToken )
//         return res.status(401).send({error: "Forbidden",error_message:'you are not authorized to access the resource (no API KEY in the request)'});
//     if(!(conf.SignInAuthorizedAppAndMS.indexOf(req.decodedToken.type)>=0)) // se il token è di un app non autorizzata
//         return res.status(401).send({error: "Forbidden",error_message:'only ' + conf.SignInAuthorizedAppAndMS + ' are authorized to access the resource'});
//     else
//         next();
// };


// exports.ensureIsMicroservice = function(req, res, next) {
//
//     var token = (req.body && req.body.access_token) || (req.query && req.query.access_token); // || req.headers['x-access-token'];
//
//
//
//     if (req.headers['authorization']) {
//         var value = req.headers['authorization'];
//         header = value.split(" ");
//         if (header.length == 2)
//             if (header[0] == "Bearer") {
//                 token = header[1];
//             }
//     }
//
//     if (token) {
//
//         if (token!=mytoken.MyMicroserviceToken) {
//             return res.status(401)
//                 .send({error: "invalid_token", error_message: "Unauthorized: The access token is not valid"});
//         }
//         //debug(decoded);
//         next();
//
//     } else {
//         res.status(401)
//             .send({
//                 error: "invalid_request",
//                 error_message: "Unauthorized: Access token required, you are not allowed to use the resource"
//             });
//     }
// };