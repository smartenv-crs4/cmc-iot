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


/* GET units listing */
module.exports.findAll = function(conditions, fields, options, callback) {
    units.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}


/* Create Unit */
module.exports.create = function(unit, callback) {
    units.create(unit, function(err, createdUnit) {
        callback(err, createdUnit)
    })
}


/* delete Unit */
module.exports.deleteMany = function(conditions, options, callback) {
    units.deleteMany(conditions, options, function(err) {
        callback(err)
    })
}


/* findOne Unit */
module.exports.findOne = function(conditions, projection, options, callback) {
    units.findOne(conditions, projection, options, function(err, results) {
        callback(err, results)
    })
}


/* findOne Unit by ID */
module.exports.findById = function(id, projection, options, callback) {
    units.findById(id, projection, options, callback)
}


/* findOne Unit and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    units.findByIdAndUpdate(id, newFields, {new: true,runValidators: true}, callback)
}


/* findOne Unit by ID and remove it */
module.exports.findByIdAndRemove = function(id, callback) {
    units.findByIdAndRemove(id, callback)
}


/* GET/SET Unit ObjectId */
module.exports.ObjectId = function(ObjectId) {
    return (mongoose.Types.ObjectId(ObjectId))
}


/* Error handling */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}