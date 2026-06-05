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


var deviceTypes = require('../models/deviceTypes').DeviceType
var mongooseError = require('../../routes/utility/mongooseError')
var mongoose = require('mongoose')
var mongooseCompat = require('./mongooseCompat')



/* delete DeviceType_Domains. */
module.exports.aggregate = function(pipeline,callback){
    mongooseCompat.execAsCallback(deviceTypes.aggregate(pipeline), callback);
};


/* GET deviceTypes listing */
module.exports.findAll = function(conditions, fields, options, callback) {
    deviceTypes.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}


/* Create DeviceType */
module.exports.create = function(deviceType, callback) {
    mongooseCompat.asCallback(deviceTypes.create(deviceType), callback)
}


/* delete DeviceTypes */
module.exports.deleteMany = function(conditions, options, callback) {
    if(!callback) {
        callback = options
        options = {}
    }
    mongooseCompat.asCallback(deviceTypes.deleteMany(conditions, options), callback)
}


/* findOne DeviceType */
module.exports.findOne = function(conditions, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(deviceTypes.findOne(conditions, normalized.projection, normalized.options), normalized.callback)
}


/* findOne DeviceType by ID */
module.exports.findById = function(id, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(deviceTypes.findById(id, normalized.projection, normalized.options), normalized.callback)
}


/* findOne DeviceType and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    mongooseCompat.execAsCallback(deviceTypes.findByIdAndUpdate(id, newFields, {returnDocument: 'after',runValidators: true}), callback)
}


/* findOne DeviceType by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    mongooseCompat.execAsCallback(deviceTypes.findByIdAndDelete(id), callback)
}


/* GET/SET DeviceType ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (new mongoose.Types.ObjectId(ObjectId))
}


/* Error handling */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}