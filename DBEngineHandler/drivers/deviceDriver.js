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


var devices=require('../models/devices').Device;
var observations=require('../models/observations').Observation;
var mongooseError=require('../../routes/utility/mongooseError');
var mongoose=require('mongoose');


/* delete DeviceType_Domains. */
module.exports.aggregate = function(pipeline,callback){
    devices.aggregate(pipeline,callback);
};

/* GET devices listing. */
module.exports.findAll = function(conditions, fields, options, callback){
    devices.findAll(conditions,fields,options,function(err,results){
        callback(err,results);
    });
};


/* Create Device. */
module.exports.create = function(device, callback){
    devices.create(device,callback);
};


/* delete Devices. */
module.exports.deleteMany = function(conditions,options,callback){
    devices.deleteMany(conditions,options,function(err){
        callback(err);
    });
};


/* findOne Device. */
module.exports.findOne = function(conditions,projection,options,callback){
    devices.findOne(conditions,projection,options,function(err,results){
        callback(err,results);
    });
};


/* findOne Device. */
module.exports.findById = function(id,projection,options,callback){
    devices.findById(id,projection,options,callback);
};




/* findOne Device. */
module.exports.findByIdAndUpdateStrict = function(id,newFields,fieldsNoUpdatable,fieldsToReturn,callback){
    var qOptions={new:true,runValidators: true};
    if(callback){
        if(fieldsToReturn) qOptions["select"]=fieldsToReturn;
    }else{
        callback=fieldsToReturn;
    }
    devices.findByIdAndUpdateStrict(id,newFields,fieldsNoUpdatable,qOptions,callback);
};



/* findOne Device. */
module.exports.findByIdAndUpdate = function(id,newFields,callback){
    devices.findByIdAndUpdate(id,newFields,{new:true,runValidators: true},callback);
};




/* findOne Device. */
module.exports.findByIdAndRemove = function(id,callback){
    devices.findByIdAndRemove(id,callback);
};





/* GET/SET Device ObjectId. */
module.exports.ObjectId = function(ObjectId){
    return(mongoose.Types.ObjectId(ObjectId));
};



/* Create Device. */
module.exports.errorResponse = function(res,err){
    mongooseError.handleError(res,err)
};