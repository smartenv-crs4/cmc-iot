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


/* GET site listing */
module.exports.findAll = function(conditions, fields, options, callback) {
    sites.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}

/* GET site listing */
module.exports.find = function(conditions, fields, options, callback) {
    sites.find(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}

/* Create Site */
module.exports.create = function(site, callback) {
    sites.create(site, function(err, createdSite) {
        callback(err, createdSite)
    })
}


/* delete Sites */
module.exports.deleteMany = function(conditions, options, callback) {
    sites.deleteMany(conditions, options, function(err) {
        callback(err)
    })
}


/* findOne Site */
module.exports.findOne = function(conditions, projection, options, callback) {
    sites.findOne(conditions, projection, options, function(err, results) {
        callback(err, results)
    })
}


/* findOne Site by ID */
module.exports.findById = function(id, projection, options, callback) {
    sites.findById(id, projection, options, callback)
}


/* findOne Site and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    sites.findByIdAndUpdate(id, newFields, {new: true,runValidators: true}, callback)
}


/* findOne Site by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    sites.findByIdAndRemove(id, callback)
}


/* GET/SET Site ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (mongoose.Types.ObjectId(ObjectId))
}


/* Error handling */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}

module.exports.locationValidator= function(location,callback){
    sites.locationValidator(location,callback);
}
