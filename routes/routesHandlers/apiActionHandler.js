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


var apiActionDriver = require('../../DBEngineHandler/drivers/apiActionDriver');


module.exports.postCreateApiAction = function (req, res, next) {
    apiActionDriver.create(req.body.apiAction, function (err, results) {
        res.httpResponse(err,null,results);
    });
};


module.exports.updateApiAction = function (req, res, next) {
    apiActionDriver.findByIdAndUpdate(req.params.id, req.body.apiAction,function (err, results) {
        res.httpResponse(err,null,results);
    });
};


module.exports.getApiActionById = function (req, res, next) {
    var id = req.params.id;
    apiActionDriver.findById(id, req.dbQueryFields, function (err, results) {
        res.httpResponse(err,null,results);
    })
};


module.exports.getApiActions = function (req, res, next) {
    apiActionDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        res.httpResponse(err,req.statusCode,results);
    });
};

module.exports.deleteApiAction = function (req, res, next) {
    var id = req.params.id;
    apiActionDriver.findByIdAndRemove(id,function(err,deletedApiAction){
        res.httpResponse(err,null,deletedApiAction);
    });
};