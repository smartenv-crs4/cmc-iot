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


var vendors = require('../models/vendors').Vendor
var mongooseError = require('../../routes/utility/mongooseError')
var mongoose = require('mongoose')
var mongooseCompat = require('./mongooseCompat')


/* GET vendors list */
module.exports.findAll = function(conditions, fields, options, callback) {
    vendors.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}


/* Create Vendor */
module.exports.create = function(vendor, callback) {
    mongooseCompat.asCallback(vendors.create(vendor), callback)
}


/* Delete Vendors */
module.exports.deleteMany = function(conditions, options, callback) {
    if(!callback) {
        callback = options
        options = {}
    }
    mongooseCompat.asCallback(vendors.deleteMany(conditions, options), callback)
}


/* findOne Vendor */
module.exports.findOne = function(conditions, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(vendors.findOne(conditions, normalized.projection, normalized.options), normalized.callback)
}


/* findOne Vendor by ID */
module.exports.findById = function(id, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(vendors.findById(id, normalized.projection, normalized.options), normalized.callback)
}


/* findOne Vendor and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    mongooseCompat.execAsCallback(vendors.findByIdAndUpdate(id, newFields, {returnDocument: 'after',runValidators: true}), callback)
}


/* findOne Vendor by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    mongooseCompat.execAsCallback(vendors.findByIdAndDelete(id), callback)
}


/* GET/SET Vendor ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (new mongoose.Types.ObjectId(ObjectId))
}


/* Error Handler */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}