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

var _ = require('underscore')._
var async = require('async')
var ObservedProperty = require('../../DBEngineHandler/drivers/observedPropertyDriver')


module.exports.createDocuments = function(numbers, callback) {

    var range = _.range(numbers)
    var observedPropertyId
    async.each(range, function(e, cb) {
        ObservedProperty.create({
            name: "name" + e,
            description: "description" + e
        }, function(err, newObservedProperty) {
            if (err) throw err
            if (e === 0) observedPropertyId = newObservedProperty._id;
            cb()
        })
    }, function(err) {
        callback(err, {observedPropertyId:observedPropertyId});
    })

};


module.exports.deleteDocuments=function(callback){
    ObservedProperty.deleteMany({},function(err){
        callback(err);
    });
};



