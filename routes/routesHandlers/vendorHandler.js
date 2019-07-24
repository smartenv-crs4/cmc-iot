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


var vendorDriver=require('../../DBEngineHandler/drivers/vendorDriver');


/* Create vendor */
module.exports.postCreateVendor = function(req, res, next) {
    vendorDriver.create(req.body.vendor, function (err, results) {
        if(err) {
            return vendorDriver.errorResponse(res, err);
        } else {
            res.status(201).send(results || err);
        }
    });
};


/* GET vendors list */
module.exports.getVendors = function(req, res, next){
    vendorDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results){
        res.send(results || err);
    })
};

