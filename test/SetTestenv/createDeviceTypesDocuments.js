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
var DeviceType = require('../../DBEngineHandler/drivers/deviceTypeDriver');
var observedPropertiesDocument = require('./createObservedPropertiesDocuments');


module.exports.createDocuments = function(numbers, callback) {


    observedPropertiesDocument.createDocuments(1,function(err,foreignKey){
        if(!err){
            var range = _.range(numbers)
            var deviceTypeId

            async.each(range, function(e, cb) {
                DeviceType.create({
                    name: "name" + e,
                    description: "description" + e,
                    observedPropertyId: foreignKey.observedPropertyId
                }, function(err, newDeviceType) {
                    if (err) throw err
                    if (e === 0) deviceTypeId = newDeviceType._id
                    cb()
                })
            }, function(err) {
                callback(err, {deviceTypeId:deviceTypeId,observedPropertyId:foreignKey.observedPropertyId});
            })
        }else{
            callback(err);
        }
    });
}



module.exports.deleteDocuments = function(callback) {

    DeviceType.deleteMany({},function(err){
        if(!err){
             observedPropertiesDocument.deleteDocuments(function(err){
                 callback(err);
             });
        }else {
            callback(err);
        }
    });
}


