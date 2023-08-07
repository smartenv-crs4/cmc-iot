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


var observationModel = require('../models/observations').Observation;
var mongooseError = require('../../routes/utility/mongooseError');
var mongoose = require('mongoose');
var async=require('async');
var conf=require('propertiesmanager').conf;


/* GET Observations list */
module.exports.findAll = function(conditions, fields, options, callback) {
    observationModel.findAll(conditions, fields, options, callback);
};


/* Create Observations. */
module.exports.create = function(observation, callback) {
    if(conf.cmcIoTOptions.uniqueObservationForDeviceIdAtSameTimestamp){
        observationModel.find({deviceId:observation.deviceId, timestamp:observation.timestamp},"_id",function(err,obs){
            if(err){
                callback(err,null);
            }else{
                if(obs.length>0) {
                    var Err = new Error("An observation for device " + observation.deviceId + " already exists at timestamp " + observation.timestamp);
                    Err.name = "DuplicatedObservation";
                    Err.duplicated=true;
                    callback(Err);
                } else
                    observationModel.create(observation, callback);
            }
        });
    } else {
        observationModel.create(observation, callback);
    }
    //observationModel.create(observation, callback);
};

// /* Create Observations. */
// module.exports.insertMany = function(observationsArray, callback) {
//     try {
//         observationModel.insertMany(observationsArray,{ordered:false},function (err, createdObservation) {
//             callback(err, createdObservation)
//         });
//     }catch (exception) {
//         callback(exception,null);
//     }
// };


/* delete Observations. */
module.exports.deleteMany = function(conditions, options, callback) {
    if(!callback){
        if(options) {
            callback = options;
            options = null;
        }
    }
    observationModel.find(conditions,"_id",function(err,obs){
        if(err){
            callback(err,null);
        }else{
            var deleted={};
            async.each(obs, function(observation, clb) {
                observationModel.findByIdAndRemove(observation._id,options,function(err,deletedObs){
                    if(deletedObs){
                        deleted[deletedObs.deviceId]=deleted[deletedObs.deviceId] || [];
                        deleted[deletedObs.deviceId].push(deletedObs);
                    }
                    clb(err);
                })
            }, function(err) {
                callback(err,deleted);
            });
        }
    });
};


/* findOne Observation */
module.exports.findOne = function(conditions, projection, options, callback) {
    observationModel.findOne(conditions, projection, options, callback);
};


/* findOne Observation by ID */
module.exports.findById = function(id, projection, options, callback) {
    observationModel.findById(id, projection, options, callback);
};


/* findOne Observation and update it */
module.exports.findByIdAndUpdate = function(id, newFields, callback) {
    observationModel.findByIdAndUpdate(id, newFields, {new: true,runValidators: true}, callback);
};


/* findOne Observation by ID and remove it */
module.exports.findByIdAndRemove = function(id, options, callback) {
    observationModel.findByIdAndRemove(id, options, callback);
};

/* GET Observations list */
module.exports.find = function(conditions, fields, options, callback) {
    observationModel.find(conditions, fields, options, callback);
};

/* GET/SET Observations ObjectId. */
module.exports.ObjectId = function(ObjectId) {
    return (mongoose.Types.ObjectId(ObjectId));
};


/* Create Observations. */
module.exports.errorResponse = function(res, err) {
    mongooseError.handleError(res, err)
};

// module.exports.getModel = function() {
//     return (observationModel);
// }
