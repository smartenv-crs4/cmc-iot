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


var domains=require('../models/domains').Domain;
var observations=require('../models/observations').Observation;
var mongooseError=require('../../routes/utility/mongooseError');
var mongoose=require('mongoose');


/* GET domains listing. */
module.exports.findAll = function(conditions, fields, options, callback){
    domains.findAll(conditions,fields,options,function(err,results){
        callback(err,results);
    });
};


/* Create Domain. */
module.exports.create = function(domain, callback){
    domains.create(domain,callback);
};


/* delete Domains. */
module.exports.deleteMany = function(conditions,options,callback){
    domains.deleteMany(conditions,options,function(err){
        callback(err);
    });
};


/* findOne Domain. */
module.exports.findOne = function(conditions,projection,options,callback){
    domains.findOne(conditions,projection,options,function(err,results){
        callback(err,results);
    });
};


/* findOne Domain. */
module.exports.findById = function(id,projection,options,callback){
    domains.findById(id,projection,options,callback);
};




/* findOne Domain. */
module.exports.findByIdAndUpdateStrict = function(id,newFields,fieldsNoUpdatable,callback){
    domains.findByIdAndUpdateStrict(id,newFields,fieldsNoUpdatable,{new:true,runValidators: true},callback);
};



/* findOne Domain. */
module.exports.findByIdAndUpdate = function(id,newFields,callback){
    domains.findByIdAndUpdate(id,newFields,{new:true,runValidators: true},callback);
};




/* findOne Domain. */
module.exports.findByIdAndRemove = function(id,callback){
    domains.findByIdAndRemove(id,callback);
};





/* GET/SET Domain ObjectId. */
module.exports.ObjectId = function(ObjectId){
    return(mongoose.Types.ObjectId(ObjectId));
};



/* Create Domain. */
module.exports.errorResponse = function(res,err){
    mongooseError.handleError(res,err)
};