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


var _ = require('underscore')._
var async = require('async')
var Site = require('../../DBEngineHandler/drivers/siteDriver')


module.exports.createDocuments = function(numbers,locatedInSiteId, callback) {

    if(!callback){
        callback=locatedInSiteId;
        locatedInSiteId=null;
    }



    var range = _.range(numbers)
    var siteId;
    var location= locatedInSiteId ? null : {type: "Point", coordinates: [0, 0]};
    var currentSite;



    async.each(range, function(e, cb) {
        currentSite={
            name: "name" + e,
            description: "description" + e,
            locatedInSiteId: locatedInSiteId || Site.ObjectId()
        };
        if(location) currentSite["location"]=location;

        Site.create(currentSite, function(err, newSite) {
            if (err) throw err
            if (e === 0) siteId = newSite._id;
            cb()
        })
    }, function(err) {
        callback(err, {siteId:siteId})
    })

}


module.exports.deleteDocuments=function(callback){
    Site.deleteMany({},function(err){
        callback(err);
    });
};
