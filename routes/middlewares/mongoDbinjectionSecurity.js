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


//Middleware to parse sort option from request
//Adds sort to request
exports.parseForOperators = function (req, res, next) {
    if(req.query) {
        if (JSON.stringify(req.query).match(/\$\w+"?\\?"?:/igm))
            return res.boom.badRequest('mongoDb operator "$..." are not allowed in query filter');
    }
    if(req.body) {
        if (JSON.stringify(req.body).match(/\$\w+"?\\?"?:/igm))
            return res.boom.badRequest('mongoDb operator "$..." are not allowed in query filter');
    }
    next();
};

