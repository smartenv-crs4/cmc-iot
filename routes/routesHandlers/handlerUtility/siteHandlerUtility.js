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

var deviceDriver = require('../../../DBEngineHandler/drivers/deviceDriver');
var observationsDriver = require('../../../DBEngineHandler/drivers/observationDriver');
var thingDriver = require('../../../DBEngineHandler/drivers/thingDriver');
var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var async = require('async');
var _ = require('underscore');
var geoLatLon=require('./geoLatLon');

const heartMeasure=6378137;


function getLinkedSites (siteIdsToCheck,linkedSitesList,fields,returnCallback) {

    if(!returnCallback){
        returnCallback=fields;
        fields=null;
    }

    if(siteIdsToCheck.length>0){
        var sitesIdsFound=[];

        siteDriver.find({locatedInSiteId:{ "$in": siteIdsToCheck }},null,null,function(err,siteInfo){

            if(siteInfo){
                for(var count=0; count< siteInfo.length;++count){
                    if(linkedSitesList.indexOf(siteInfo[count]._id.toString())==-1){
                        sitesIdsFound.push(siteInfo[count]._id.toString());
                    }
                }
            }
            linkedSitesList=linkedSitesList.concat(siteIdsToCheck);
            getLinkedSites(sitesIdsFound,linkedSitesList,fields,function(err,subList){
                returnCallback(err,subList);
            })
        });

    }else{
        if(fields){
            siteDriver.find({_id:{ "$in": linkedSitesList }},fields,null,function(err,siteInfo){

                returnCallback(null,siteInfo);
            });
        }else {
            returnCallback(null, linkedSitesList);
        }
    }
};

function calculateDistance(sites,centralPoint,maxDistance){
   var distanceCalculated={};
   var currentDistance;
   var currentCoordinates;
    for (r in sites) {
        currentCoordinates=sites[r].location.coordinates;
        if(currentCoordinates.length>0){
            var sitePoint = new geoLatLon(currentCoordinates[0],currentCoordinates[1]);
            currentDistance=centralPoint.rhumbDistanceTo(sitePoint);
            if(!(maxDistance && currentDistance>maxDistance)){
                distanceCalculated[sites[r]._id]=currentDistance
            }
        }
    }
    return(distanceCalculated);
}

function extractSites(sites,distanceOptions,centralPoint,distance,returnCallback){
    sites=_.map(sites, function(val){ return val._id; });
    getLinkedSites(sites,[],"_id location locatedInSiteId",function(err,linkedSites){
        if(err){
            return returnCallback(err);
        }else{
            var radius=(distanceOptions.mode>1);
            var distanceCalculated=null;
            if(radius || distanceOptions.returnDistance){
                distanceCalculated=calculateDistance(linkedSites,centralPoint,radius && distance);
            }

            // now we have all valid sites(valid coordinates or currrentDistance < maxdistance)
            var  currentDistance;
            var foundedSites=[];
            for (r in linkedSites) {
                if(distanceCalculated) {
                    currentDistance = distanceCalculated[linkedSites[r]._id] || distanceCalculated[linkedSites[r].locatedInSiteId] || null;
                    if (currentDistance) {
                        foundedSites.push({
                            siteId: linkedSites[r]._id,
                            distance: (distanceOptions.returnDistance || undefined) && currentDistance
                        });
                    }
                }else{
                    foundedSites.push({
                        siteId: linkedSites[r]._id
                    });
                }
            }
        returnCallback(null,{sites:foundedSites});
        }
    });
}


module.exports.getLinkedSites=function(siteIdsToCheck,linkedSitesList,fields,returnCallback){
    getLinkedSites (siteIdsToCheck,linkedSitesList,fields,returnCallback);
};

module.exports.searchSitesByLocation=function (location,distance,distanceOptions,pagination,returnCallback) {

    siteDriver.locationValidator(location,function(err){
       if(err){
           returnCallback(err);
       } else{
           if(_.isNumber(distance)) {
                var meters = parseInt(distance);
                var lat = parseFloat(location.coordinates[1]);
                var lng = parseFloat(location.coordinates[0]);
                // var near = [ lng, lat ]; // near must be an array of [lng, lat]

                var diag = meters * Math.sqrt(2);
                var start = new geoLatLon(lng,lat);
                var top_r = start.destinationPoint(diag,45,heartMeasure);
                var bot_l = start.destinationPoint(diag,225,heartMeasure);


                var min_lat = Math.min(top_r.lat, bot_l.lat);
                var max_lat = Math.max(top_r.lat, bot_l.lat);
                var min_lon = Math.min(top_r.lon, bot_l.lon);
                var max_lon = Math.max(top_r.lon, bot_l.lon);

                siteDriver.find({ "location.coordinates.1" : {$gt :min_lat , $lt : max_lat}, "location.coordinates.0" : {$gt:min_lon, $lt:max_lon} },"_id",{lean:true},function(err,results){
                    //    Parking.geoNear({type:"Point", coordinates : near}, searchOptions, function(err,results){
                    if(err){
                        returnCallback(err);
                    }else {


                       extractSites(results,distanceOptions,start,distance,function(err,validsites){
                           returnCallback(err,validsites);
                       })
                    }
                });

           }else{
               var err = new Error('Invalid distance format. Must be a number');
               err.name = "ValidatorError";
               return returnCallback(err);
           }
       }
    });
};




// module.exports.searchSitesByLocation=function (location,distance,distanceOptions,pagination,returnCallback) {
//
//     siteDriver.locationValidator(location,function(err){
//        if(err){
//            returnCallback(err);
//        } else{
//            if(_.isNumber(distance)) {
//                 var meters = parseInt(distance);
//                 var lat = parseFloat(location.coordinates[1]);
//                 var lng = parseFloat(location.coordinates[0]);
//                 // var near = [ lng, lat ]; // near must be an array of [lng, lat]
//
//                 var diag = meters * Math.sqrt(2);
//                 var start = new geoLatLon(lng,lat);
//                 var top_r = start.destinationPoint(diag,45,heartMeasure);
//                 var bot_l = start.destinationPoint(diag,225,heartMeasure);
//
//
//                 var min_lat = Math.min(top_r.lat, bot_l.lat);
//                 var max_lat = Math.max(top_r.lat, bot_l.lat);
//                 var min_lon = Math.min(top_r.lon, bot_l.lon);
//                 var max_lon = Math.max(top_r.lon, bot_l.lon);
//
//                var radius=distanceOptions.mode.toUpperCase()=="RADIUS";
//                if(radius && pagination && pagination.limit) // to extract more results.. some should be sliced
//                    pagination.limit=pagination.limit*2;
//
//                 siteDriver.findAll({ "location.coordinates.1" : {$gt :min_lat , $lt : max_lat}, "location.coordinates.0" : {$gt:min_lon, $lt:max_lon} },null,_.extend(pagination,{lean:true}),function(err,results){
//                     //    Parking.geoNear({type:"Point", coordinates : near}, searchOptions, function(err,results){
//                     if(err){
//                         returnCallback(err);
//                     }else {
//
//
//                         if(distanceOptions.returnDistance || radius){
//                             var sitesRes=results.sites;
//                             results.sites=[];
//                             var distances=[];
//                             var currebtDist;
//                             for (var r=0;r<sitesRes.length;++ r) {
//                                 var point = new geoLatLon(sitesRes[r].location.coordinates[0],sitesRes[r].location.coordinates[1]);
//                                 currebtDist=start.rhumbDistanceTo(point);
//                                 if(radius && currebtDist<=meters){
//                                     results.sites.push(sitesRes[r]);
//                                     distances.push(currebtDist);
//                                     if(pagination && pagination.limit && distances.length>= (pagination.limit))
//                                         r=sitesRes.length+1;
//                                 }else if(distanceOptions.returnDistance){
//                                     distances.push(currebtDist);
//                                 }
//                             }
//                         }
//                         results["distances"]=distances;
//                         if(radius){
//                             results._metadata.
//                         }
//                         returnCallback(null,results);
//                     }
//                 });
//
//            }else{
//                var err = new Error('Invalid distance format. Must be a number');
//                err.name = "ValidatorError";
//                return returnCallback(err);
//            }
//        }
//     });
// };





