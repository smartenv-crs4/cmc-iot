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


var _ = require('underscore')._
var async = require('async')
var DeviceType_DomainType = require('../../DBEngineHandler/drivers/deviceType_domainDriver');
var domainDocuments = require('./createDomainsDocuments');
var deviceTypeDocuments = require('./createDeviceTypesDocuments');


module.exports.createDocuments = function(numbers, callback) {

    // Create Domain
    domainDocuments.createDocuments(1,function(err,domainId){
       if(!err){
           // Create DeviceType
           deviceTypeDocuments.createDocuments(1,function(err,deviceTypeId){
               if(!err){
                   var range = _.range(numbers)
                   var deviceType_domainTypeId

                   async.each(range, function(e, cb) {
                       DeviceType_DomainType.create({
                           deviceTypeId:DeviceType_DomainType.ObjectId(),
                           domainId: DeviceType_DomainType.ObjectId()
                       }, function(err, newDeviceType_DomainType) {
                           if (err) throw err
                           if (e === 0) deviceType_domainTypeId = newDeviceType_DomainType._id;
                           cb()
                       })
                   }, function(err) {
                       callback(err, deviceType_domainTypeId,domainId,deviceType_domainTypeId);
                   })

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


    DeviceType_DomainType.deleteMany({},function(err){
        if(!err){
            domainDocuments.deleteDocuments(function (err) {
                if(!err){
                    deviceTypeDocuments.deleteDocuments(function (err) {
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
