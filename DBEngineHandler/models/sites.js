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
var conf = require('propertiesmanager').conf

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

    if (!(this.location) && !(this.locatedInSiteId)) {
        var err = new Error('One between location or locatedInSiteId field must be set');
        err.name = "ValidatorError";
        next(err);
    }
    else next();
});

// Static method to retrieve resource WITH metadata
siteSchema.statics.findAll = function(conditions, fields, options, callback) {
    return findAllFn(this, 'sites', conditions, fields, options, callback)
}


var Site = mongoose.model('site', siteSchema)


module.exports.SiteSchema = siteSchema
module.exports.Site = Site
