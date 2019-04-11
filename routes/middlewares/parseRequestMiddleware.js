/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2019 CRS4                                 *
 *       This file is part of CRS4 Microservice Core - IoT (CMC-IoT).       *
 *                                                                            *
 *       CMC-IoT is free software: you can redistribute it and/or modify     *
 *     it under the terms of the GNU General Public License as published by   *
 *       the Free Software Foundation, either version 3 of the License, or    *
 *                    (at your option) any later version.                     *
 *                                                                            *
 *       CMC-IoT is distributed in the hope that it will be useful,          *
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        *
 *               GNU General Public License for more details.                 *
 *                                                                            *
 *       You should have received a copy of the GNU General Public License    *
 *       along with CMC-IoT.  If not, see <http://www.gnu.org/licenses/>.    *
 * ############################################################################
 */


var conf = require('propertiesmanager').conf;

//Middleware to parse DB query fields selection from request URI
//Adds dbQueryFields to request
exports.parseFields = function (req, res, next) {

    var fields = req.query.fields ? req.query.fields.split(",") : null;
    if (fields) {
        req.dbQueryFields = fields.join(' ');
    }
    else {
        req.dbQueryFields = null;
    }
    next();

};


//Middleware to parse pagination params from request URI
//Adds dbPagination to request
exports.parsePagination = function (req, res, next) {

    var skip = req.query.skip && !isNaN(parseInt(req.query.skip)) ? parseInt(req.query.skip) : conf.skip;
    var limit = req.query.limit && parseInt(req.query.limit) < conf.limit ? parseInt(req.query.limit) : conf.limit;


    if((skip==-1) || (limit==-1))
        req.dbPagination = {};
    else
        req.dbPagination = {"skip": skip, "limit": limit};

    next();

};


//Middleware to parse sort option from request
//Adds sort to request
exports.parseOptions = function (req, res, next) {

    var sortDescRaw = req.query.sortDesc ? req.query.sortDesc.split(",") : null;
    var sortAscRaw = req.query.sortAsc ? req.query.sortAsc.split(",") : null;

    if (sortAscRaw || sortDescRaw)
        req.sort = {asc: sortAscRaw, desc: sortDescRaw};
    else
        req.sort = null;

    next();

};






