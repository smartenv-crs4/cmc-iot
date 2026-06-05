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


var disabledDevices =require('../models/disabledDevices').DisabledDevices;
var mongooseCompat = require('./mongooseCompat');

/* GET disabled device listing. */
module.exports.findAll = function(conditions, fields, options, callback){
    disabledDevices .findAll(conditions,fields,options,function(err,results){
        callback(err,results);
    });
};


/* Create disabled device. */
module.exports.create = function(observation, callback){
    mongooseCompat.asCallback(disabledDevices.create(observation), callback);
};


/* findById and remove disabled device. */
module.exports.findOneAndRemove = function(id,options,callback){
    mongooseCompat.execAsCallback(disabledDevices.findOneAndDelete(id,options), callback);
};




/* delete DisabledDevices . */
module.exports.deleteMany = function(conditions,options,callback){
    if(!callback){
        callback=options;
        options={};
    }
    mongooseCompat.asCallback(disabledDevices.deleteMany(conditions,options), callback);
};


//
//
// /* findOne DisabledDevices . */
// module.exports.findOne = function(conditions,projection,options,callback){
//     DisabledDevices .findOne(conditions,projection,options,function(err,results){
//         callback(err,results);
//     });
// };
//
//
//
// /* GET/SET DisabledDevices  ObjectId. */
// module.exports.ObjectId = function(ObjectId){
//     return(mongoose.Types.ObjectId(ObjectId));
// };
//
//
//
// /* Create DisabledDevices . */
// module.exports.errorResponse = function(res,err){
//     mongooseError.handleError(res,err)
// };