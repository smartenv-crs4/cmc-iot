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
var observationUtility = require('../../routes/routesHandlers/handlerUtility/observationUtility');
var deviceCreateDocuments=require('./createDevicesDocuments');
var unitCreateDocuments=require('./createUnitsDocuments');


module.exports.createDocuments=function(numbers,callback){

    var range = _.range(numbers);
    var observationId;

    deviceCreateDocuments.createDocuments(1,function(err,deviceForeignKey){
       if(!err){
           unitCreateDocuments.createDocuments(1,deviceForeignKey.observedPropertyId,function(err,unitForeignKey){
               if(!err){
                   async.each(range, function(e,cb){

                       observationUtility.create({
                           timestamp:new Date().getTime(),
                           value:e,
                           deviceId:deviceForeignKey.deviceId,
                           unitId:unitForeignKey.unitId,
                           location: { coordinates: [0,0] }
                       },function(err,newObservation){
                           if (err) throw err;
                           if(e===0) observationId=newObservation._id;
                           cb();
                       });

                   }, function(err){
                       callback(err,{
                           observationId:observationId,
                           deviceId:deviceForeignKey.deviceId,
                           unitId:unitForeignKey.unitId,
                           thingId:deviceForeignKey.thingId,
                           deviceTypeId:deviceForeignKey.deviceTypeId,
                           vendorId:deviceForeignKey.vendorId,
                           siteId:deviceForeignKey.siteId,
                           observedPropertyId:deviceForeignKey.observedPropertyId
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

    observationUtility.deleteMany({},function(err){
        if(!err){
            deviceCreateDocuments.deleteDocuments(function(err){
                if(!err){
                    unitCreateDocuments.deleteDocuments(function(err){
                        callback(err);
                    });
                }else{
                    callback(err);
                }
            });
        }else{
            callback(err);
        }

    });
};



