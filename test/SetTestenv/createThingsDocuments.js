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

var _ = require('underscore')._;
var async = require('async');
var Thing = require('../../DBEngineHandler/drivers/thingDriver');
var vendorDocuments=require("./createVendorsDocuments");
var siteDocuments=require("./createSitesDocuments");



module.exports.createDocuments=function(numbers,callback){

    vendorDocuments.createDocuments(1,function(err,vendorId){
       if(!err){
           siteDocuments.createDocuments(1,function(err,siteId){
               if(!err){
                   var range = _.range(numbers);
                   var thingId;
                   try {
                       async.each(range, function (e, cb) {

                           Thing.create({
                               name: "thingName" + e,
                               description: "thingDescription" + e,
                               ownerId: Thing.ObjectId(),
                               vendorId: vendorId,
                               siteId: siteId,
                               api: {url: "http://APIURL.it:" + e, access_token: "TOKEN" + e},
                               direct: {url: "http://APIURL.it:" + e, access_token: "TOKEN" + e, username: ""}
                           }, function (err, newThing) {
                               if (err) throw err;
                               if (e === 0) thingId = newThing._id;
                               cb();
                           });

                       }, function (err) {
                           callback(err, thingId,vendorId,siteId);
                       });
                   }catch (e) {
                       callback(e);
                   }
               } else{
                   callback(err,null);
               }
           });
       } else{
        callback(err,null);
       }
    });



};


module.exports.deleteDocuments=function(callback){
    Thing.deleteMany({},function(err){
        callback(err);
    });
};
