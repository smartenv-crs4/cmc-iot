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


var deviceDriver = require('../../../DBEngineHandler/drivers/deviceDriver');
var observationsDriver = require('../../../DBEngineHandler/drivers/observationDriver');


/* Delete devices. */
module.exports.deleteDevice = function (id,callback) {

    observationsDriver.findAll({deviceId: id}, null, {totalCount: true}, function (err, results) {
        if (err) {
            return callback(err);
        } else {
            if ((results._metadata.totalCount) > 0) { // there are observations then set dismissed:true
                deviceDriver.findByIdAndUpdate(id, {dismissed: true}, function (err, dismissedDevice) {
                    if (err) {
                        return callback(err);
                    } else {
                        callback(null,dismissedDevice);
                    }
                });
            } else {  // there aren't observations then delete
                deviceDriver.findByIdAndRemove(id, function (err, deletedDevice) {
                    if (err) {
                        return callback(err);
                    } else {
                        callback(null,deletedDevice);
                    }
                });
            }
        }
    });

};

