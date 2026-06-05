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


var units = require('../models/units').Unit
var mongooseError = require('../../routes/utility/mongooseError')
var mongoose = require('mongoose')
var mongooseCompat = require('./mongooseCompat')


/* GET units listing */
module.exports.findAll = function(conditions, fields, options, callback) {
    units.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}


/* Create Unit */
module.exports.create = function(unit, callback) {
    mongooseCompat.asCallback(units.create(unit), callback)
}


/* delete Unit */
module.exports.deleteMany = function(conditions, options, callback) {
    if(!callback) {
        callback = options
        options = {}
    }
    mongooseCompat.asCallback(units.deleteMany(conditions, options), callback)
}


/* findOne Unit */
module.exports.findOne = function(conditions, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(units.findOne(conditions, normalized.projection, normalized.options), normalized.callback)
}


/* findOne Unit by ID */
module.exports.findById = function(id, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(units.findById(id, normalized.projection, normalized.options), normalized.callback)
}


/* findOne Unit and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    mongooseCompat.execAsCallback(units.findByIdAndUpdate(id, newFields, {returnDocument: 'after',runValidators: true}), callback)
}


/* findOne Unit by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    mongooseCompat.execAsCallback(units.findByIdAndDelete(id), callback)
}


/* GET/SET Unit ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (new mongoose.Types.ObjectId(ObjectId))
}


/* Error handling */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}