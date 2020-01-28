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
var _=require('underscore')






//Middleware to parse sort option from request
//Adds sort to request
exports.validateOwnerId = function (mustBeSet) {

    return(
        function (req,res,next){
            if(req.body.thing.ownerId){ //if ownerIs is Set
                if(conf.whoCanHandleThingsAndDevicesOwner.indexOf(req.decodedToken.type)>=0){ // this token type can handle device owner
                    next();
                }else{
                    return res.boom.badRequest("Thing ownerId field must be set only by '" + conf.whoCanHandleThingsAndDevicesOwner + "' token types");
                }
            }else{
                if(mustBeSet){
                    req.body.thing.ownerId=req.decodedToken._id;
                }
                next();
            }
        }
    );
};





