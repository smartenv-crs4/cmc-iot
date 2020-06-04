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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var conf = require('propertiesmanager').conf;
var extendedFunction = require('./metadata');


var apiAction= conf.customSchema.apiActionSchema || {
    actionName:{type:String,required:true},
    method:{type:String,required:true, enum: ["GET","POST","PUT","DELETE"],default:"GET"},
    header:{type:Object,required:true, default:{"Content-Type": "application/json" , "Accept":"application/json"}},
    bodyPrototype:{type:Object, default:null},
    queryPrototype:{type:Object, default:null},
    responsePrototype:{type:Object, default:null},
    deviceTypeId:{type:mongoose.ObjectId, required:true}
};


var apiActionSchema = new Schema(apiAction, {strict: "throw"});

apiActionSchema.index({ actionName: 1, deviceTypeId: 1 }, { unique: true });

// Static method to retrieve resource WITH metadata
apiActionSchema.statics.findAll = function (conditions, fields, options, callback) {
    return extendedFunction.findAll(this, 'apiActions', conditions, fields, options, callback);
};

// Static method to retrieve resource WITH metadata
apiActionSchema.statics.findByIdAndUpdateStrict = function (id, newfields,fieldsNoUpdatable, options, callback) {
    return extendedFunction.findByIdAndUpdateStrictMode(this, id, newfields, fieldsNoUpdatable, options, callback);
};

var ApiAction = mongoose.model('apiAction', apiActionSchema);

module.exports.ApiActionSchema = apiActionSchema;
module.exports.ApiAction = ApiAction;
