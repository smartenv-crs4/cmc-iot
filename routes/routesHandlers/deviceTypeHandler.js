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


var deviceTypeDriver = require('../../DBEngineHandler/drivers/deviceTypeDriver')


/* Create deviceType */
module.exports.postCreateDeviceType = function(req, res, next) {
    deviceTypeDriver.create(req.body.deviceType, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* GET deviceTypes list */
module.exports.getDeviceTypes = function(req, res, next) {
    deviceTypeDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* GET deviceType By Id */
module.exports.getDeviceTypeById = function(req, res, next) {
    var id = req.params.id
    deviceTypeDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


/* Update deviceType */
module.exports.updateDeviceType = function(req, res, next) {
    deviceTypeDriver.findByIdAndUpdate(req.params.id, req.body.deviceType, function(err, results) {
        res.httpResponse(err,null,results);
    })
}


//TODO Gestire la cancellazione in presenza di Api Actions collegate
/* Delete deviceTypes */
module.exports.deleteDeviceType = function(req, res, next) {
    var id = req.params.id
    deviceTypeDriver.findByIdAndRemove(id, function(err, deletedDeviceType) {
        res.httpResponse(err,null,deletedDeviceType);
    })
}
