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


var domainDriver = require('../../DBEngineHandler/drivers/domainDriver');
var deviceType_domainDriver = require('../../DBEngineHandler/drivers/deviceType_domainDriver');


module.exports.postCreateDomain = function (req, res, next) {
    domainDriver.create(req.body.domain, function (err, results) {
        res.httpResponse(err,null,results);
    });
};


module.exports.updateDomain = function (req, res, next) {
    domainDriver.findByIdAndUpdate(req.params.id, req.body.domain,function (err, results) {
        res.httpResponse(err,null,results);
    });
};


module.exports.getDomainById = function (req, res, next) {
    var id = req.params.id;
    domainDriver.findById(id, req.dbQueryFields, function (err, results) {
        res.httpResponse(err,null,results);
    })
};


module.exports.getDomains = function (req, res, next) {
    domainDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        res.httpResponse(err,req.statusCode,results);
    });
};

module.exports.deleteDomain = function (req, res, next) {
    var id = req.params.id;
    deviceType_domainDriver.findOne({domainId:id},function(err,deviceTypeDomain){
        if(err) return res.httpResponse(err,null,null);

        if(deviceTypeDomain){
            err=new Error("Cannot delete the domain due to associated deviceType(s)");
            err.name="ConflictError";
            res.httpResponse(err,null,null);
        }else{
            domainDriver.findByIdAndRemove(id,function(err,deletedDomain){
                res.httpResponse(err,null,deletedDomain);
            });
        }

    });

};