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
var mongooseError=require('../../routes/utility/mongooseError');
var mongoose=require('mongoose');
var mongooseCompat = require('./mongooseCompat');


/* GET domains listing. */
module.exports.findAll = function(conditions, fields, options, callback){
    domains.findAll(conditions,fields,options,function(err,results){
        callback(err,results);
    });
};


/* Create Domain. */
module.exports.create = function(domain, callback){
    mongooseCompat.asCallback(domains.create(domain), callback);
};


/* delete Domains. */
module.exports.deleteMany = function(conditions,options,callback){
    if(!callback){
        callback=options;
        options={};
    }
    mongooseCompat.asCallback(domains.deleteMany(conditions,options), callback);
};


/* findOne Domain. */
module.exports.findOne = function(conditions,projection,options,callback){
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback);
    mongooseCompat.execAsCallback(domains.findOne(conditions, normalized.projection, normalized.options), normalized.callback);
};


/* findOne Domain. */
module.exports.findById = function(id,projection,options,callback){
    var normalized = mongooseCompat.normalizeProjectionOptionsCallback(projection, options, callback);
    mongooseCompat.execAsCallback(domains.findById(id, normalized.projection, normalized.options), normalized.callback);
};




/* findOne Domain. */
module.exports.findByIdAndUpdateStrict = function(id,newFields,fieldsNoUpdatable,callback){
    domains.findByIdAndUpdateStrict(id,newFields,fieldsNoUpdatable,{returnDocument: 'after',runValidators: true},callback);
};



/* findOne Domain. */
module.exports.findByIdAndUpdate = function(id,newFields,callback){
    mongooseCompat.execAsCallback(domains.findByIdAndUpdate(id,newFields,{returnDocument: 'after',runValidators: true}), callback);
};




/* findOne Domain. */
module.exports.findByIdAndRemove = function(id,callback){
    mongooseCompat.execAsCallback(domains.findByIdAndDelete(id), callback);
};





/* GET/SET Domain ObjectId. */
module.exports.ObjectId = function(ObjectId){
    return(new mongoose.Types.ObjectId(ObjectId));
};



/* Create Domain. */
module.exports.errorResponse = function(res,err){
    mongooseError.handleError(res,err)
};