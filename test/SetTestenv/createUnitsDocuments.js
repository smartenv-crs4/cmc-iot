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
var Unit = require('../../DBEngineHandler/drivers/unitDriver')


module.exports.createDocuments = function(numbers, callback) {

    var range = _.range(numbers)
    var unitId

    try {
        async.each(range, function(e, cb) {
            Unit.create({
                name: "name" + e,
                symbol: "symbol" + e,
                minValue: 0 + e,
                maxValue: 0 + e,
                observedPropertyId: Unit.ObjectId()
            }, function(err, newUnit) {
                if (err) throw err
                if (e === 1) unitId = newUnit._id
                cb()
            })
        }, function(err) {
            callback(err, unitId)
        })
    }
    catch (e) {
        callback (e)
    }


}


