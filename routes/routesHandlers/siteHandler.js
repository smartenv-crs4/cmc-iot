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
var thingDriver = require('../../DBEngineHandler/drivers/thingDriver')


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


/* Delete sites */
module.exports.deleteSite = function(req, res, next) {
    var id = req.params.id
    thingDriver.findAll({siteId: id}, null, {totalCount: true}, function(err, results) {
        if (err)
            return next(err)
        else {
            if ((results._metadata.totalCount) > 0) { // there are Things associated with that Site, so you cannot delete the Site
                res.httpResponse(err, 409, "Cannot delete the Site due to associated Thing(s)")
            } else { //Deleting that Site could be safe since there aren't associated Things. What about associated Sites?
                siteDriver.findAll({locatedInSiteId: id}, null, {totalCount: true}, function(err, results) {
                    if (err)
                        return res.httpResponse(err,null,null);
                    else {
                        if ((results._metadata.totalCount) > 0) { // there are Sites associated with that Site, so you cannot delete the Site
                            res.httpResponse(err, 409, "Cannot delete the Site due to associated Site(s)")
                        } else { //Deleting that Site is safe since there aren't associated Sites
                            siteDriver.findByIdAndRemove(id, function(err, deletedSite) {
                                res.httpResponse(err, null, deletedSite)
                            })
                        }
                    }
                })
            }
        }
    })
}
