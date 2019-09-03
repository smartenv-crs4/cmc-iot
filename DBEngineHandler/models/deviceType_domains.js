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
var extendedFunction = require('./metadata');
var Schema = mongoose.Schema;
var conf = require('propertiesmanager').conf;

var deviceType_domains= conf.customSchema.deviceType_domainSchema || {
    domainId:{type:mongoose.ObjectId, index: true,required:true},
    deviceTypeId:{type:mongoose.ObjectId, index: true,required:true},
};


var deviceType_domainSchema = new Schema(deviceType_domains, {strict: "throw"});

// Static method to retrieve resource WITH metadata
deviceType_domainSchema.statics.findAll = function (conditions, fields, options, callback) {
    return extendedFunction.findAll(this, 'deviceType_domains', conditions, fields, options, callback);
};


// Static method to retrieve resource WITH metadata
deviceType_domainSchema.statics.findByIdAndUpdateStrict = function (id, newfields,fieldsNoUpdatable, options, callback) {
    return extendedFunction.findByIdAndUpdateStrictMode(this, id, newfields, fieldsNoUpdatable, options, callback);

};

var DeviceType_domains = mongoose.model('deviceType_domain', deviceType_domainSchema);

module.exports.DeviceType_DomainSchema = deviceType_domainSchema;
module.exports.DeviceType_Domain = DeviceType_domains;
