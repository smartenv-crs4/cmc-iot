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


var apiActions=require('../models/apiActions').ApiAction;
var mongooseError=require('../../routes/utility/mongooseError');
var mongoose=require('mongoose');


/* GET apiActions listing. */
module.exports.findAll = function(conditions, fields, options, callback){
    apiActions.findAll(conditions,fields,options,function(err,results){
        callback(err,results);
    });
};


/* Create ApiAction. */
module.exports.create = function(apiAction, callback){
    apiActions.create(apiAction,callback);
};


/* delete ApiActions. */
module.exports.deleteMany = function(conditions,options,callback){
    apiActions.deleteMany(conditions,options,function(err){
        callback(err);
    });
};


/* findOne ApiAction. */
module.exports.findOne = function(conditions,projection,options,callback){
    apiActions.findOne(conditions,projection,options,function(err,results){
        callback(err,results);
    });
};


/* findOne ApiAction. */
module.exports.findById = function(id,projection,options,callback){
    apiActions.findById(id,projection,options,callback);
};




/* findOne ApiAction. */
module.exports.findByIdAndUpdateStrict = function(id,newFields,fieldsNoUpdatable,callback){
    apiActions.findByIdAndUpdateStrict(id,newFields,fieldsNoUpdatable,{new:true,runValidators: true},callback);
};



/* findOne ApiAction. */
module.exports.findByIdAndUpdate = function(id,newFields,callback){
    apiActions.findByIdAndUpdate(id,newFields,{new:true,runValidators: true},callback);
};




/* findOne ApiAction. */
module.exports.findByIdAndRemove = function(id,callback){
    apiActions.findByIdAndRemove(id,callback);
};



/* GET/SET ApiAction ObjectId. */
module.exports.ObjectId = function(ObjectId){
    return(mongoose.Types.ObjectId(ObjectId));
};



/* Create ApiAction. */
module.exports.errorResponse = function(res,err){
    mongooseError.handleError(res,err)
};