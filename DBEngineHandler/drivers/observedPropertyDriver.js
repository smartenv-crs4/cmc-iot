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


var observedProperties = require('../models/observedProperties').ObservedProperty
var mongooseError = require('../../routes/utility/mongooseError')
var mongoose = require('mongoose')
var mongooseCompat = require('./mongooseCompat')


/* GET observedProperties list */
module.exports.findAll = function(conditions, fields, options, callback) {
    observedProperties.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}


/* Create ObservedProperty */
module.exports.create = function(observedProperty, callback) {
    mongooseCompat.asCallback(observedProperties.create(observedProperty), callback)
}


/* Delete ObservedProperties */
module.exports.deleteMany = function(conditions, options, callback) {
    if(!callback) {
        callback = options
        options = {}
    }
    mongooseCompat.asCallback(observedProperties.deleteMany(conditions, options), callback)
}


/* findOne ObservedProperty */
module.exports.findOne = function(conditions, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(observedProperties.findOne(conditions, normalized.projection, normalized.options), normalized.callback)
}


/* findOne ObservedProperty by ID */
module.exports.findById = function(id, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(observedProperties.findById(id, normalized.projection, normalized.options), normalized.callback)
}


/* findOne ObservedProperty and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    mongooseCompat.execAsCallback(observedProperties.findByIdAndUpdate(id, newFields, {returnDocument: 'after',runValidators: true}), callback)
}


/* findOne ObservedProperty by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    mongooseCompat.execAsCallback(observedProperties.findByIdAndDelete(id), callback)
}


/* GET/SET ObservedProperty ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (new mongoose.Types.ObjectId(ObjectId))
}


/* Error Handler */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}