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


var mongoose = require('mongoose')
var findAllFn = require('./metadata').findAll
var Schema = mongoose.Schema
var conf = require('propertiesmanager').conf;


var site = conf.customSchema.siteSchema || {
    name: {type: String, required: true},
    description: {type: String, required: true},
    location: {
        type: {type: String, enum: ['Point']},
        coordinates: {type: [Number]}
    },
    locatedInSiteId: {type: mongoose.ObjectId, index: true}
}


var siteSchema = new Schema(site, {strict: "throw"})

siteSchema.pre('validate', function(next) {

    var retErr=null;
    if(!this.location.coordinates.length>0 &&  !this.location.type) {  // this because coordinates are array and is set by default to []
        if ((!this.locatedInSiteId)) {
            var retErr = new Error('One between location or locatedInSiteId field must be set');
            retErr.name = "ValidatorError";
            return next(retErr);
        }
    }

    if(this.location) {
        if (this.location.coordinates) {

            if (this.location.coordinates.length>0 && this.location.type ) {
                // if (this.location.coordinates[0] > 180 || this.location.coordinates[0] < -180) {
                //     var err = new Error('Invalid location coordinates: longitude must be in range [-180,180]');
                //     err.name = "ValidatorError";
                //     return next(err);
                // }
                //
                // if (this.location.coordinates[1] > 90 || this.location.coordinates[1] < -90) {
                //     var err = new Error('Invalid location coordinates: latitude must be in range [-90,90]');
                //     err.name = "ValidatorError";
                //     return next(err);
                // }
                validateLocation(this.location,function(err){
                    retErr=err;
                });

            }else{
                var retErr = new Error('Invalid location field values: coordinates:[longitude,latitude] and type:"Point" must be set');
                retErr.name = "ValidatorError";
                return next(retErr);
            }
        }
    }
    next(retErr);
});

// Static method to retrieve resource WITH metadata
siteSchema.statics.findAll = function(conditions, fields, options, callback) {
    return findAllFn(this, 'sites', conditions, fields, options, callback)
}


// Static method to retrieve resource WITH metadata
siteSchema.statics.locationValidator = function(location, callback) {
    return validateLocation(location,callback);
}


var validateLocation = function(location,callback) {

    if (location.coordinates[0] > 180 || location.coordinates[0] < -180) {
        var err = new Error('Invalid location coordinates: longitude must be in range [-180,180]');
        err.name = "ValidatorError";
        callback(err);
    }else {
        if (location.coordinates[1] > 90 || location.coordinates[1] < -90) {
            var err = new Error('Invalid location coordinates: latitude must be in range [-90,90]');
            err.name = "ValidatorError";
            return callback(err);
        }else{
            callback(null);
        }
    }

};

var Site = mongoose.model('site', siteSchema)


module.exports.SiteSchema = siteSchema;
module.exports.Site = Site;
