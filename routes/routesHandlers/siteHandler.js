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


var siteDriver = require('../../DBEngineHandler/drivers/siteDriver')


/* Create site */
module.exports.postCreateSite = function(req, res, next) {
    siteDriver.create(req.body.site, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* GET sites list */
module.exports.getSites = function(req, res, next) {
    siteDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* GET sites By Id */
module.exports.getSiteById = function(req, res, next) {
    var id = req.params.id
    siteDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* Update site */
module.exports.updateSite = function(req, res, next) {
    siteDriver.findByIdAndUpdate(req.params.id, req.body.site, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


//TODO Gestire la cancellazione in presenza di Things collegati
/* Delete sites */
module.exports.deleteSite = function(req, res, next) {
    var id = req.params.id
    siteDriver.findByIdAndRemove(id, function(err, deletedSite) {
        res.httpResponse(err, null, deletedSite)
    })
}
