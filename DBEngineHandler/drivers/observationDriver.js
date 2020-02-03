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


var observations = require('../models/observations').Observation
var mongooseError = require('../../routes/utility/mongooseError')
var mongoose = require('mongoose')


/* GET Observations list */
module.exports.findAll = function(conditions, fields, options, callback) {
    observations.findAll(conditions, fields, options, function(err, results) {
        callback(err, results)
    })
}


/* Create Observations. */
module.exports.create = function(observation, callback) {
    observations.create(observation, function(err, createdObservation) {
        callback(err, createdObservation)
    })
}

/* Create Observations. */
module.exports.insertMany = function(observationsArray, callback) {
    try {
        observations.insertMany(observationsArray,{ordered:false},function (err, createdObservation) {
            callback(err, createdObservation)
        });
    }catch (exception) {
        callback(exception,null);
    }
};


/* delete Observations. */
module.exports.deleteMany = function(conditions, options, callback) {
    observations.deleteMany(conditions, options, function(err) {
        callback(err)
    })
}


/* findOne Observation */
module.exports.findOne = function(conditions, projection, options, callback) {
    observations.findOne(conditions, projection, options, function(err, results) {
        callback(err, results)
    })
}


/* findOne Observation by ID */
module.exports.findById = function(id, projection, options, callback) {
    observations.findById(id, projection, options, callback)
}


/* findOne Observation and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    observations.findByIdAndUpdate(id, newFields, {new: true,runValidators: true}, callback)
}


/* findOne Observation by ID and remove it */
module.exports.findByIdAndRemove = function(id, options, callback) {
    observations.findByIdAndRemove(id, options, callback)
}


/* GET/SET Observations ObjectId. */
module.exports.ObjectId = function(ObjectId) {
    return (mongoose.Types.ObjectId(ObjectId))
}


/* Create Observations. */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
}