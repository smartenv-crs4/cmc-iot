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


var sites = require('../models/sites').Site;
var mongooseError = require('../../routes/utility/mongooseError');
var mongoose = require('mongoose');
var mongooseCompat = require('./mongooseCompat');


/* GET site listing */
module.exports.findAll = function(conditions, fields, options, callback) {
    sites.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}

/* GET site listing */
module.exports.find = function(conditions, fields, options, callback) {
    var normalized = mongooseCompat.normalizeFieldsOptionsCallback(fields, options, callback)
    mongooseCompat.execAsCallback(sites.find(conditions, normalized.fields, normalized.options), normalized.callback)
}

/* Create Site */
module.exports.create = function(site, callback) {
    mongooseCompat.asCallback(sites.create(site), callback)
}


/* delete Sites */
module.exports.deleteMany = function(conditions, options, callback) {
    if(!callback) {
        callback = options
        options = {}
    }
    mongooseCompat.asCallback(sites.deleteMany(conditions, options), callback)
}


/* findOne Site */
module.exports.findOne = function(conditions, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(sites.findOne(conditions, normalized.projection, normalized.options), normalized.callback)
}


/* findOne Site by ID */
module.exports.findById = function(id, projection, options, callback) {
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback)
    mongooseCompat.execAsCallback(sites.findById(id, normalized.projection, normalized.options), normalized.callback)
}


/* findOne Site and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    mongooseCompat.execAsCallback(sites.findByIdAndUpdate(id, newFields, {returnDocument: 'after',runValidators: true}), callback)
}


/* findOne Site by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    mongooseCompat.execAsCallback(sites.findByIdAndDelete(id), callback)
}


/* GET/SET Site ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (new mongoose.Types.ObjectId(ObjectId))
}

module.exports.ObjectIdIsValid = function(ObjectId) {
    return(mongoose.Types.ObjectId.isValid(ObjectId));
}

/* Error handling */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}

module.exports.locationValidator= function(location,callback){
    sites.locationValidator(location,callback);
}
