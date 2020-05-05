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

//Begin macro
/**
 * @apiDefine LocationBodyParams
 * @apiParam (Body Parameter)   {Object}        [location]                        Geographical coordinates parent object
 * @apiParam (Body Parameter)   {Point}         [location.coordinates]            Site coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiParam (Body Parameter)   {Number}        [distance]                        Radius of the search area (mode "radius"), or half the side of the square bounding box (mode "bbox")
 * @apiParam (Body Parameter)   {Object}        [distanceOptions]                 Distance search options parent object
 * @apiParam (Body Parameter)   {String}        [distanceOptions.mode]            Distance search mode; accepted values are "radius" or "bbox". Default is "bbox"
 * @apiParam (Body Parameter)   {Boolean}       [distanceOptions.returnDistance]  Option for returning an array of distances of each returned site from the location
 */
/**
 * @apiDefine LocationCentreBodyParams
 * @apiParam (Body Parameter)   {Object}        [location]                                    Location parent object
 * @apiParam (Body Parameter)   {Object}        [location.centre]                             Location centre parent object
 * @apiParam (Body Parameter)   {Point}         [location.centre.coordinates]                 Coordinates point object in the format: [lon,lat] (e.g. [93.4,23.6])
 * @apiParam (Body Parameter)   {Number}        [location.distance]                           Radius of the search area (mode "radius"), or half the side of the square bounding box (mode "bbox")
 * @apiParam (Body Parameter)   {Object}        [location.distanceOptions]                    Distance search options parent object
 * @apiParam (Body Parameter)   {String}        [location.distanceOptions.mode]               Distance search mode; accepted values are "radius" or "bbox". Default is "bbox"
 * @apiParam (Body Parameter)   {Boolean}       [location.distanceOptions.returnDistance]     Option for returning an array of distances of each returned site from the location
 */
//End macro


var siteDriver = require('../../../DBEngineHandler/drivers/siteDriver');
var _ = require('underscore');
var geoLatLon=require('./geoLatLon');

const heartMeasure=6378137;

// function calculateDistance(items,centralPoint,maxDistance){
//    var distanceCalculated={};
//    var currentDistance;
//    var currentCoordinates;
//     for (r in items) {
//         currentCoordinates=items[r].location.coordinates;
//         if(currentCoordinates.length>0){
//             var sitePoint = new geoLatLon(currentCoordinates[0],currentCoordinates[1]);
//             currentDistance=centralPoint.rhumbDistanceTo(sitePoint);
//             if(!(maxDistance && currentDistance>maxDistance)){
//                 distanceCalculated[items[r]._id]=currentDistance
//             }
//         }
//     }
//     return(distanceCalculated);
// }

function calculateDistance(items,centralPoint,maxDistance){
   var distanceCalculated={};
   var currentDistance;
   var currentCoordinates;

   for (r in items) {
        currentCoordinates=items[r].location.coordinates;
        if(currentCoordinates.length>0){
            var sitePoint = new geoLatLon(currentCoordinates[0],currentCoordinates[1]);
            currentDistance=centralPoint.rhumbDistanceTo(sitePoint);
            if(!(maxDistance && currentDistance>maxDistance)){
                distanceCalculated[items[r]._id]=currentDistance
            }
        }
    }
    return(distanceCalculated);
}


module.exports.filterByOptions = function (items,distanceOptions,centralPoint,distance,keys,label,returnOnlyObservationsId,callbackFunction){

    // distanceOptions.mode
    // 0--> error sue to no mose set
    // 1--> filter by bbbox
    // 2--> filter by radius

    if(!callbackFunction){
        callbackFunction=returnOnlyObservationsId;
        returnOnlyObservationsId=true;
    }

    var mode= distanceOptions.mode;
    var distanceCalculated=null;
    var filterByRadiusDistance=(mode=="2") ? distance : null;
    var  currentDistanceKey;
    var foundedItems=[];
    var foundedItemsdistances=[];

    if(filterByRadiusDistance || distanceOptions.returnDistance){
        distanceCalculated=calculateDistance(items,centralPoint,filterByRadiusDistance);
        // now we have all valid sites(valid coordinates or currrentDistance < maxdistance)
        for (r in items) {
            currentDistanceKey = _.find(keys, function (val) {
                    return (distanceCalculated[items[r][val]]);
            });
            if(currentDistanceKey){
                foundedItemsdistances.push(distanceCalculated[items[r][currentDistanceKey]]);
                foundedItems.push(items[r]);
            }
        }
    }else{
        foundedItems=items;
    }


    if(returnOnlyObservationsId){
        foundedItems=_.map(foundedItems,function(item){
            return(item._id);
        })
    }

    var resultsFounded={};
    resultsFounded[label +"s"]=foundedItems;
    if (distanceOptions.returnDistance) {
        resultsFounded["distances"]=foundedItemsdistances;
    }

    callbackFunction(null,resultsFounded);
};

/*

module.exports.filterByOptions = function (items,distanceOptions,centralPoint,distance,keys,label,callbackFunction){

    // distanceOptions.mode
    // 0--> error sue to no mose set
    // 1--> filter by bbbox
    // 2--> filter by radius


    var mode= distanceOptions.mode;
    var distanceCalculated=null;
    var filterByRadiusDistance=(mode=="2") ? distance : null;
    var  currentDistanceKey;
    var foundedItems=[];
    var foundedItemsdistances=[];

    if(filterByRadiusDistance || distanceOptions.returnDistance){
        distanceCalculated=calculateDistance(items,centralPoint,filterByRadiusDistance);
        // now we have all valid sites(valid coordinates or currrentDistance < maxdistance)
        for (r in items) {
            currentDistanceKey = _.find(keys, function (val) {
                    return (distanceCalculated[items[r][val]]);
            });
            if(currentDistanceKey){
                foundedItemsdistances.push(distanceCalculated[items[r][currentDistanceKey]]);
                foundedItems.push(items[r]._id);
            }
        }
    }else{
        foundedItems=_.map(items,function(item){
            return(item._id);
        })
    }

    var resultsFounded={};
    resultsFounded[label +"s"]=foundedItems;
    if (distanceOptions.returnDistance) {
        resultsFounded["distances"]=foundedItemsdistances;
    }

    callbackFunction(null,resultsFounded);
};
*/

// module.exports.filterByOptions = function (items,distanceOptions,centralPoint,distance,keys,label,callbackFunction){
//
//     // distanceOptions.mode
//     // 0--> error sue to no mose set
//     // 1--> filter by bbbox
//     // 2--> filter by radius
//
//
//     var mode= distanceOptions.mode;
//     var distanceCalculated=null;
//     var filterByRadiusDistance=(mode=="2") ? distance : null;
//     if(filterByRadiusDistance || distanceOptions.returnDistance){
//         distanceCalculated=calculateDistance(items,centralPoint,filterByRadiusDistance);
//     }
//     // now we have all valid sites(valid coordinates or currrentDistance < maxdistance)
//     var  currentDistanceKey;
//     var foundedItems=[];
//     var currentItem;
//     for (r in items) {
//         currentItem = {};
//         if(distanceCalculated){
//             currentDistanceKey = _.find(keys, function (val) {
//                 return (distanceCalculated[items[r][val]]);
//             });
//             if(currentDistanceKey){
//                 currentItem[label + "Id"] = items[r]._id;
//                 if (distanceOptions.returnDistance) {
//                     currentItem["distance"] = distanceCalculated[items[r][currentDistanceKey]];
//                 }
//                 foundedItems.push(currentItem);
//             }
//         }else{
//             currentItem[label + "Id"] = items[r]._id;
//             foundedItems.push(currentItem);
//         }
//
//     }
//     var resultsFounded={};
//     resultsFounded[label +"s"]=foundedItems;
//     callbackFunction(null,resultsFounded);
// };


module.exports.getSearchByLocationQuery=function (location,distance,distanceOptions,resultsCallback) {
    siteDriver.locationValidator(location,function(err){
       if(err){
           resultsCallback(err);
       } else{
           distance=Number(distance) || distance;
           if(_.isNumber(distance)) {

               var mode= distanceOptions.mode ? distanceOptions.mode.match(/^BBOX$/i) ? 1 : distanceOptions.mode.match(/^RADIUS$/i) ? 2 : 0 :  0;
               if(mode) {
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

                   resultsCallback(null,{
                       query: {
                           "location.coordinates.1": {$gt: min_lat, $lt: max_lat},
                           "location.coordinates.0": {$gt: min_lon, $lt: max_lon}
                       },
                       centre:{
                           lat:lat,
                           lon:lng,
                           point:start
                       },
                       mode:mode
                   });

               }else{
                   var Err = new Error("distanceOptions must be as {mode:'BBOX || RADIUS', returndistance:'boolean'}. mode field must be set to BBOX or RADIUS");
                   Err.name = "BadRequestError";
                   return resultsCallback(Err);
               }
           }else{
               var err = new Error('Invalid distance format. Must be a number');
               err.name = "ValidatorError";
               return resultsCallback(err);
           }
       }
    });
};







