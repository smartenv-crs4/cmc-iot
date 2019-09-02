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


var things=require('../models/things').Thing;
var mongooseError=require('../../routes/utility/mongooseError');
var mongoose=require('mongoose');


/* Thing listing. */
module.exports.findAll = function(conditions, fields, options, callback){
    things.findAll(conditions,fields,options,function(err,results){
        callback(err,results);
    });
};


/* Create Thing. */
module.exports.create = function(device, callback){
    things.create(device,callback);
};


/* delete Thing by query. */
module.exports.deleteMany = function(conditions,options,callback){
    things.deleteMany(conditions,options,callback);
};


/* findOne One Thing. */
module.exports.findOne = function(conditions,projection,options,callback){
    things.findOne(conditions,projection,options,callback);
};


/* findOne one Thing by Id. */
module.exports.findById = function(id,projection,options,callback){
    things.findById(id,projection,options,callback);
};


/* findOne Device. */
module.exports.findByIdAndUpdateStrict = function(id,newFields,fieldsNoUpdatable,callback){
    things.findByIdAndUpdateStrict(id,newFields,fieldsNoUpdatable,{new:true,runValidators: true},callback);
};


/* Update Thing by Id. */
module.exports.findByIdAndUpdate = function(id,newFields,callback){
    things.findByIdAndUpdate(id,newFields,{new:true,runValidators: true},callback);
};



/* Remove Thing by Id */
module.exports.findByIdAndRemove = function(id,callback){
    things.findByIdAndRemove(id,callback);
};


/* GET/SET Thing ObjectId. */
module.exports.ObjectId = function(ObjectId){
    return(mongoose.Types.ObjectId(ObjectId));
};



/* Thing Error Handler */
module.exports.errorResponse = function(res,err){
    mongooseError.handleError(res,err)
};