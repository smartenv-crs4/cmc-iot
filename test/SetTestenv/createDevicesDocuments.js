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
var Device = require('../../DBEngineHandler/drivers/deviceDriver');
var thingDocuments=require('./createThingsDocuments');
var deviceTypeDocuments=require('./createDeviceTypesDocuments');


module.exports.createDocuments=function(numbers,callback){


    thingDocuments.createDocuments(1,function(err,foreignKey){
       if(!err){
           deviceTypeDocuments.createDocuments(1,function(err,foreignKeyDT){
               if(!err){
                   var range = _.range(numbers);
                   var deviceId;
                   async.each(range, function(e,cb){

                       Device.create({
                           name:"name" + e,
                           description:"description" +e,
                           thingId:foreignKey.thingId,
                           typeId:foreignKeyDT.deviceTypeId
                       },function(err,newDevice){
                           if (err) throw err;
                           if(e===0) deviceId=newDevice._id;
                           cb();
                       });

                   }, function(err){
                       callback(err,{
                           deviceId:deviceId,
                           deviceTypeId:foreignKeyDT.deviceTypeId,
                           observedPropertyId:foreignKeyDT.observedPropertyId,
                           thingId:foreignKey.thingId,
                           vendorId:foreignKey.vendorId,
                           siteId:foreignKey.siteId
                       });
                   });
               } else{
                   callback(err);
               }
           });
       } else{
           callback(err);
       }
    });



};



module.exports.deleteDocuments=function(callback){
    Device.deleteMany({},function(err){
        if(!err){
         deviceTypeDocuments.deleteDocuments(function(err){
            if(!err){
                thingDocuments.deleteDocuments(function(err){
                    callback(err);
                });
            } else{
                callback(err);
            }
         });
        }else {
            callback(err);
        }
    });
};



