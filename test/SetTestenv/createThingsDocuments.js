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

var _ = require('underscore')._;
var async = require('async');
var Thing = require('../../DBEngineHandler/drivers/thingDriver');









ownerId:{type:mongoose.ObjectId, index: true,required:true},
api:{
    url:String,
        access_token:String
},
direct:{
    url:String,
        access_token:String,
        username:String,
        password:String
},
vendorId:{type:mongoose.ObjectId, required:true},
siteId:{type:mongoose.ObjectId, required:true}



module.exports.createDocuments=function(numbers,callback){

    var range = _.range(numbers);
    var deviceId;
    async.each(range, function(e,cb){

        Thing.create({
            name:"thingName" + e,
            description:"thingDescription" +e,
            ownerId:Thing.ObjectId(),
            vendorId:Thing.ObjectId(),
            siteId:Thing.ObjectId(),
            api:{url:"http://APIURL:"+e,access_token:"TOKEN" +e},
            direct:{url:"http://APIURL:"+e,access_token:"TOKEN" +e, username:""}
        },function(err,newDevice){
            if (err) throw err;
            if(e===1) deviceId=newDevice._id;
            cb();
        });

    }, function(err){
        callback(err,deviceId);
    });

};


