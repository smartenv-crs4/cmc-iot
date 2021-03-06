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


var siteDriver = require('../../DBEngineHandler/drivers/siteDriver');
var thingDriver = require('../../DBEngineHandler/drivers/thingDriver');
var siteUtility= require('./handlerUtility/siteHandlerUtility');
var _=require("underscore");
var async=require("async");



//Begin macro
/**
 * @apiDefine SiteBodyParams
 * @apiParam (Body Parameter)   {Object}        site                            Site dictionary with all the fields
 * @apiParam (Body Parameter)   {String}        site.name                       Site name
 * @apiParam (Body Parameter)   {String}        site.description                Site description
 * @apiParam (Body Parameter)   {Object}        site.location                   Object for geographical coordinates
 * @apiParam (Body Parameter)   {Point}         site.location.coordinates       Site coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiParam (Body Parameter)   {ObjectId}      [site.locatedInSiteId]          Site Foreign Key to "parent" site (where this site is located) (e.g. a room inside a building)
 */
/**
 * @apiDefine SiteQueryParams
 * @apiParam (Query Parameter)  {String[]}      [sites]                         Search by site
 * @apiParam (Query Parameter)  {String[]}      [name]                          Filter by site name
 * @apiParam (Query Parameter)  {String[]}      [description]                   Filter by site description
 * @apiParam (Query Parameter)  {String[]}      [locatedInSiteId]               Filter by the "parent" site (where this site is located)
 */
/**
 * @apiDefine PostSiteResource
 * @apiSuccess (201 - CREATED)  {String}        name                            Created site name
 * @apiSuccess (201 - CREATED)  {String}        description                     Created site description
 * @apiSuccess (201 - CREATED)  {Object}        location                        Created site location object
 * @apiSuccess (201 - CREATED)  {Point}         location.coordinates            Created site coordinates
 * @apiSuccess (201 - CREATED)  {String}        locatedInSiteId                 Created site identifier of "parent" location (where this site is located)
 */
/**
 * @apiDefine PutSiteResource
 * @apiSuccess                  {String}        name                            Updated site name
 * @apiSuccess                  {String}        description                     Updated site description
 * @apiSuccess                  {Object}        location                        Updated site location object
 * @apiSuccess                  {Point}         location.coordinates            Updated site coordinates
 * @apiSuccess                  {String}        locatedInSiteId                 Updated site identifier of "parent" location (where this site is located)
 */
/**
 * @apiDefine GetAllSiteResource
 * @apiSuccess                  {Object[]}      sites                           A paginated array list of Site objects
 * @apiSuccess                  {String}        site._id                        Site identifier
 * @apiSuccess                  {String}        site.name                       Site name
 * @apiSuccess                  {String}        site.description                Site description
 * @apiSuccess                  {Object}        site.location                   Object for site location
 * @apiSuccess                  {Point}         site.location.coordinates       Location coordinates
 * @apiSuccess                  {String}        site.locatedInSiteId            Identifier of "parent" location (where this site is located)
 */
/**
 * @apiDefine GetSiteResource
 * @apiSuccess                  {String}        _id                             Site identifier
 * @apiSuccess                  {String}        name                            Site name
 * @apiSuccess                  {String}        description                     Site description
 * @apiSuccess                  {Object}        location                        Object for site location
 * @apiSuccess                  {Point}         location.coordinates            Location coordinates
 * @apiSuccess                  {String}        locatedInSiteId                 Identifier of "parent" location (where this site is located)
 */
/**
 * @apiDefine PostSiteResourceExample
 * @apiSuccessExample {json} Example: 201 CREATED
 *      HTTP/1.1 201 CREATED
 *      {
 *        "name": "My new site",
 *        "description": "This is my workplace",
 *        "location": "coordinates": [8.9291082,38.9979322],
 *        "locatedInSiteId": "5d4044fc346a8f0277643bf4"
 *      }
 */
/**
 * @apiDefine GetAllSiteResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "sites":[
 *                      {
 *                          "_id": "543fdd60579e1281b8f6da92",
 *                          "name": "My site",
 *                          "description": "My site description",
 *                          "location": "coordinates": [8.9291082,38.9979322],
 *                          "locatedInSiteId": "5d4044fc346a8f0277643bf4"
 *                      },
 *                      {
 *                          "_id": "543fdd60579e1281sdaf6da92",
 *                          "name": "My other site",
 *                          "description": "My other site description",
 *                          "location": "coordinates": [8.9291082,38.9979322],
 *                          "locatedInSiteId": "5d4044fc346a8f0277643bf4"
 *                     },
 *                    ...
 *                 ],
 *       "_metadata":{
 *                   "skip":10,
 *                   "limit":50,
 *                   "totalCount":100
 *                   }
 *     }
 */
/**
 * @apiDefine GetSiteResourceExample
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *        "id": "543fdd60579e1281b8f6da92",
 *        "name": "Crs4Site",
 *        "description": "Crs4 main site",
 *        "location": "coordinates": [8.9291082,38.9979322],
 *        "locatedInSiteId": "5d4044fc346a8f0277643bf4"
 *     }
 */
//End macro


/**
 * @api {post} /sites Create a new Site
 * @apiVersion 1.0.0
 * @apiName PostSite
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Creates a new Site object and returns the newly created resource, or an error Object
 *
 * @apiUse SiteBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /sites
 *  Body:{ "name": "customSite" , "description": "CRS4 main site", "location": {"lon": 8.9291082, "lat": 38.9979322}, "locatedInSiteId":"5d4044fc346a8f0277643bf4"}
 *
 * @apiUse PostSiteResource
 * @apiUse PostSiteResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiSampleRequest off
 */
module.exports.postCreateSite = function(req, res, next) {
    async.series([
            function(callback) {
                if (req.body.site && req.body.site.locatedInSiteId) {
                    siteDriver.findById(req.body.site.locatedInSiteId, "_id", function(err, result) {
                        callback(null, result)
                    })
                } else callback(null, true)
            }
        ],
        function(err, isValid) {
            if (err) {
                res.httpResponse(err)
            } else {
                if (isValid[0]) {
                    siteDriver.create(req.body.site, function(err, results) {
                        return res.httpResponse(err, null, results)
                    })
                } else {
                    return res.httpResponse(null, 422, "locatedInSiteId " + req.body.site.locatedInSiteId + " doesn't exist or isn't a valid site identifier")
                }
            }
        })
}
/**
 * @api {post} /actions/getLinkedSites Get all linked Sites
 * @apiVersion 1.0.0
 * @apiName GetLinkedSites
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all linked Sites
 *
 * @apiParam (Body Parameter)   {Object}        sites           Array of all Site ids which we want to get the linked sites from
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /sites/actions/getLinkedSites
 * Body:{ "sites": ["543fdd60579e1281b8f6da64", "543fdd60579e1281b8f6db31"] }
 *
 * @apiSuccess                  {String[]}      linkedSites     An array of Site ids
 *
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "linkedSites":[
 *                      "543fdd60579e1281b8f6da92",
 *                      "543fdd60579e1281saf6dc32"
 *                     ]
 *     }
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getLinkedSites = function(req, res, next) {
    var sites = req.body.sites

    if (_.isArray(sites)) {
        siteUtility.getLinkedSites(_.uniq(sites), [], function(err, linkedSites) {
            res.httpResponse(err, req.statusCode, {linkedSites: linkedSites})
        })
    } else {
        res.httpResponse(null, 400, "sites body field must be an array list of sites id")
    }
}

/**
 * @api {post} /actions/searchSitesByLocation Search Sites by location
 * @apiVersion 1.0.0
 * @apiName SearchSitesByLocation
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Sites located around a particular location
 *
 * @apiUse LocationBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 POST /sites/actions/searchSitesByLocation
 * Body:{"location": {"coordinates":[83.4,78.3]}, "distance": "100", "distanceOptions": {"mode":"bbox"}}
 *
 * @apiSuccess  {String[]}      linkedSites     A paginated array list of Site ids
 * @apiSuccess  {String[]}      distances       A paginated array list of the distances of each returned Site from the search coordinates (if returnDistance is true)
 *
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {
 *       "sites": [
 *                 "543fdd60579e1281b8f6da92",
 *                 "543fdd60579e1281saf6dc32",
 *                 ...
 *                ],
 *       "distancies": [
 *                      "25",
 *                      "33",
 *                      ...
 *                     ],
 *       "_metadata": {
 *                     "skip":10,
 *                     "limit":50,
 *                     "totalCount":100
 *                    }
 *     }
 *
 * @apiUse Metadata
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
*/
module.exports.searchSitesByLocation = function(req, res, next) {
    siteUtility.searchSitesByLocation(req.body.location, req.body.distance, req.body.distanceOptions, function (err, results) {
        res.httpResponse(err, req.statusCode, results);
    });
};

// module.exports.searchSitesByLocation = function(req, res, next) {
//     var mode= req.body.distanceOptions.mode ? req.body.distanceOptions.mode.match(/^BBOX$/i) ? 1 :req.body.distanceOptions.mode.match(/^RADIUS$/i) ? 2 : 0 :  0;
//     if(mode) {
//         req.body.distanceOptions.mode=mode;
//         siteUtility.searchSitesByLocation(req.body.location, req.body.distance, req.body.distanceOptions, req.dbPagination, function (err, results) {
//             res.httpResponse(err, req.statusCode, results);
//         });
//     }else{
//         res.httpResponse(null, 400, "distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS");
//     }
// };


/**
 * @api {get} /sites Get all Sites
 * @apiVersion 1.0.0
 * @apiName GetSite
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Returns a paginated list of all Sites
 *
 * @apiUse SiteQueryParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /sites?name=site1_Crs4,site2_Crs4&field=name,description&access_token=yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU4YTMwNTcxM
 *
 * @apiUse GetAllSiteResource
 * @apiUse GetAllSiteResourceExample
 *
 * @apiUse Metadata
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getSites = function(req, res, next) {
    siteDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
};


/**
 * @api {get} /sites/:id Get Site by id
 * @apiVersion 1.0.0
 * @apiName GetSiteById
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Returns a Site object
 *
 * @apiParam (URL Parameter) {String}  id  The Site identifier
 * @apiUse Projection
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 GET /sites/543fdd60579e1281b8f6da92
 *
 * @apiUse GetSiteResource
 * @apiUse GetSiteResourceExample
 *
 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
module.exports.getSiteById = function(req, res, next) {
    var id = req.params.id
    siteDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/**
 * @api {put} /sites Update a Site
 * @apiVersion 1.0.0
 * @apiName PutSite
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Updates a Site object and returns the newly updated resource, or an error Object
 *
 * @apiUse SiteBodyParams
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 PUT /sites/543fdd60579e1281b8f6da92
 *  Body:{ "name": "updatedCustomName" , "description": "a more detailed description"}
 *
 * @apiUse PutSiteResource
 * @apiUse GetSiteResourceExample
 * @apiUse Unauthorized
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NotFound
 * @apiUse NoContent
 * @apiSampleRequest off
 */
module.exports.updateSite = function(req, res, next) {

    async.series([
            function(callback) {
                if(siteDriver.ObjectIdIsValid(req.params.id)){
                    if(req.body.site.locatedInSiteId){
                        if(siteDriver.ObjectIdIsValid(req.params.id)){
                            if(siteDriver.ObjectIdIsValid(req.body.site.locatedInSiteId)){

                                siteUtility.getLinkedSites([req.params.id],[],function(err,linkedSited){
                                    if(err){
                                        callback(err);
                                    }else{
                                        if(linkedSited.indexOf(req.body.site.locatedInSiteId)>=0){
                                            callback(null,false);
                                        }else {
                                            callback(null,true);
                                        }
                                    }
                                });
                            }else{
                                var Err = new Error("locatedInSiteId: " + req.body.site.locatedInSiteId + " is a not valid ObjectId");
                                Err.name = "BadDataError";
                                callback(Err);
                            }
                        }else{
                            var Err = new Error(req.params.id + " is a not valid ObjectId");
                            Err.name = "BadDataError";
                            callback(Err);
                        }
                    }else{
                        callback(null,true);
                    }
                }else{
                    var Err = new Error(req.params.id + " is a not valid ObjectId");
                    Err.name = "BadDataError";
                    callback(Err);
                }

            }
        ],
        function(err, isValid) {
            if(err){
                res.httpResponse(err);
            }else {
                if (isValid[0]) {
                    siteDriver.findByIdAndUpdate(req.params.id, req.body.site, function(err, results) {
                        res.httpResponse(err, null, results)
                    });
                } else {
                    return res.httpResponse(null, 422, "A site cannot be located inside a children site. Set a valid locatedInSiteId");
                }
            }
        });




}


/**
 * @api {delete} /sites/:id Delete Site
 * @apiVersion 1.0.0
 * @apiName DeleteSiteById
 * @apiGroup Sites
 * @apiPermission Access Token
 *
 * @apiDescription Deletes a given Site by its identifier and returns the deleted resource. <br>
 *     If there are Sites which are located in this Site, it can't be deleted to preserve data integrity.
 *
 * @apiParam (URL Parameter) {String}  id The Site identifier
 *
 * @apiParamExample {json} Request-Example:
 * HTTP/1.1 DELETE /sites/543fdd60579e1281b8f6da92
 *
 * @apiUse GetSiteResource
 * @apiUse GetSiteResourceExample

 * @apiUse Unauthorized
 * @apiUse NotFound
 * @apiUse BadRequest
 * @apiUse InternalServerError
 * @apiUse NoContent
 */
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
