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

var mongoose = require('mongoose');
var findAllFn = require('./metadata').findAll;
var Schema = mongoose.Schema;
var conf = require('propertiesmanager').conf;

var device= conf.customSchema.deviceSchema || {
    name:{type:String,required:true},
    description:{type:String,required:true},
    thingId:{type:mongoose.ObjectId, index: true,required:true},
    typeId:{type:mongoose.ObjectId, index: true,required:true},
    dismissed:{type:Boolean,required:true, default:false},
    disabled:{type:Boolean,required:true, default:false},
};


var deviceSchema = new Schema(device, {strict: "throw"});

// Static method to retrieve resource WITH metadata
deviceSchema.statics.findAll = function (conditions, fields, options, callback) {
    return findAllFn(this, 'devices', conditions, fields, options, callback);
};

var Device = mongoose.model('device', deviceSchema);

module.exports.DeviceSchema = deviceSchema;
module.exports.Device = Device;
