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


var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver');
var observationsDriver = require('../../DBEngineHandler/drivers/observationDriver');
var deviceUtility=require('./handlerUtility/deviceUtility');


/* Create device. */
module.exports.postCreateDevice = function (req, res, next) {
    deviceDriver.create(req.body.device, function (err, results) {
        if (err) {
            return deviceDriver.errorResponse(res, err);
        } else {
            res.status(201).send(results || err);
        }

    });
};


/* Update device. */
// TODO notificare tramite redis???
module.exports.updateDevice = function (req, res, next) {
    deviceDriver.findByIdAndUpdateStrict(req.params.id, req.body.device,["dismissed"] ,function (err, results) {
        if (err) {
            return deviceDriver.errorResponse(res, err);
        } else {
            if (results)
                res.send(results);
            else
                res.status(204).send();
        }
    });
};


/* GET device By Id. */
module.exports.getDeviceById = function (req, res, next) {

    var id = req.params.id;

    deviceDriver.findById(id, req.dbQueryFields, function (err, results) {
        if (err) {
            return deviceDriver.errorResponse(res, err);
        } else {
            if (results)
                res.send(results);
            else
                res.status(204).send();
        }
    })
};


/* GET devices listing. */
module.exports.getDevices = function (req, res, next) {
    deviceDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        if (err) {
            return deviceDriver.errorResponse(res, err);
        } else {
            res.send(results || err);
        }

    });
};

/* Delete devices. */
//TODO descrivere che quando si elimina un device, se non ha misurazioni vene eliminato atrimenti rimane nel sistema ma viene messo in stato dismesso

module.exports.deleteDevice = function (req, res, next) {

    var id = req.params.id;

    deviceUtility.deleteDevice(id,function(err,deletedDevice){
        if (err) {
            return deviceDriver.errorResponse(res, err);
        } else {
            if(deletedDevice){
                res.status(200).send(deletedDevice);
            }else{ // NO CONTENT due to no device found
                res.status(204).send();
            }
        }
    });
};

