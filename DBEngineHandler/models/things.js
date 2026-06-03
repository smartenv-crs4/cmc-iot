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



/*
 * Thing schema definition.
 * Custom schema can be injected through configuration; fallback below is default.
 */
var thing= conf.customSchema.thingSchema || {
    name:{type:String,required:true},
    description:{type:String,required:true},
    dismissed:{type:Boolean,required:true, default:false},
    disabled:{type:Boolean,required:true, default:false},
    mobile:{type:Boolean,required:true, default:false},
    ownerId:{type:mongoose.ObjectId, index: true,required:true},
    api:{
        url:String,
        access_token:String
    },
    direct:{
        url:String,
        access_token:String,
        username:String,
        password:String,
        private:{type:Boolean, default:true}
    },
    vendorId:{type:mongoose.ObjectId, required:true},
    siteId:{type:mongoose.ObjectId, required:true}
};


var thingSchema = new Schema(thing, {strict: "throw"});

/* Retrieve Thing collections with metadata envelope support. */
thingSchema.statics.findAll = function (conditions, fields, options, callback) {
    return extendedFunction.findAll(this, 'things', conditions, fields, options, callback);
};

/* Strict update utility that blocks updates to protected fields. */
thingSchema.statics.findByIdAndUpdateStrict = function (id, newfields,fieldsNoUpdatable, options, callback) {
    return extendedFunction.findByIdAndUpdateStrictMode(this, id, newfields, fieldsNoUpdatable, options, callback);
};


/* Validate optional URL fields before persistence. */
thingSchema.pre('validate', function(next) {

    var espressione = new RegExp('^https?:\\/\\/(((www\\.)?(\\w+|-+)+(\\.\\w+)*\\.\\D{2})|(localhost)|(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}))((:\\d+)?((\\/\\w*)+)?)?(\\?{0,1}\\w+)?$','i');


    if(this.api && this.api.url) {
        if (!espressione.test(this.api.url)) {
         const err = new Error("thing validation failed 'api.url'. " +this.api.url + " is not a valid url (eg: http://......)");
         err.name="ValidatorError";
         return next(err);
        }
    }

    if(this.direct && this.direct.url) {
        if (!espressione.test(this.direct.url)) {
            const err = new Error("thing validation failed 'direct.url'. " +this.direct.url + " is not a valid url (eg: http://......)");
            err.name="ValidatorError";
            return next(err);
        }
    }

    return next();
});






var Thing = mongoose.model('thing', thingSchema);

module.exports.ThingSchema = thingSchema;
module.exports.Thing = Thing;
