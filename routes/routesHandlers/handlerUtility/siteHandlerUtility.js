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


module.exports.getLinkedSites=function getLinkedSites(siteIdsToCheck,linkedSitesList,returnCallback) {

    if(siteIdsToCheck.length>0){
        var sitesIdsFound=[];

        siteDriver.find({locatedInSiteId:{ "$in": siteIdsToCheck }},"_id",null,function(err,siteInfo){

            if(siteInfo){
                for(var count=0; count< siteInfo.length;++count){
                    if(linkedSitesList.indexOf(siteInfo[count]._id.toString())==-1){
                        sitesIdsFound.push(siteInfo[count]._id);
                    }
                }
            }
            linkedSitesList=linkedSitesList.concat(siteIdsToCheck);
            getLinkedSites(sitesIdsFound,linkedSitesList,function(err,subList){
                returnCallback(err,subList);
            })
        });

    }else{
        returnCallback(null,linkedSitesList);
    }
};


