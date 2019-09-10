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


var deviceTypeDriver = require('../../DBEngineHandler/drivers/deviceTypeDriver');
var apiActionsDriver = require('../../DBEngineHandler/drivers/apiActionDriver');
var deviceTypeDomainDriver = require('../../DBEngineHandler/drivers/deviceType_domainDriver');
var async=require("async");




function addDomainHandler(id,req,res,next){
    var results=[];
    async.each(req.body.domains, function(domainId, callback) {

        deviceTypeDomainDriver.create({deviceTypeId:id,domainId:domainId},function(err,deviceTypeDomainItem){
            results.push(deviceTypeDomainItem);
            callback(err);
        });

    }, function(err) {
        res.httpResponse(err, 200, results);
    });
};

module.exports.addDomains = function (req, res, next) {
    var id = req.params.id;
    addDomainHandler(id,req,res,next);
};


module.exports.removeDomains = function (req, res, next) {
    var id = req.params.id;
    var results=[];
    async.each(req.body.domains, function(domainId, callback) {

        deviceTypeDomainDriver.findOneAndRemove({deviceTypeId:id,domainId:domainId},function(err,deviceTypeDomainItem){
            if(deviceTypeDomainItem) results.push(deviceTypeDomainItem);
            callback(err);
        });

    }, function(err) {
        results=results.length===0 ? null : results;
        res.httpResponse(err, 200, results);
    });
};



module.exports.setDomains = function (req, res, next) {
    var id = req.params.id;
    deviceTypeDomainDriver.deleteMany({deviceTypeId:id},function (err) {
       if(!err){
           addDomainHandler(id,req,res,next);
       } else{
           res.httpResponse(err,null,null);
       }
    });
};


module.exports.getDomains = function (req, res, next) {
    var id = req.params.id;


    deviceTypeDomainDriver.aggregate([
        {
            $match: {deviceTypeId:deviceTypeDriver.ObjectId(id)}
        },
        {
            $lookup:{
                from: 'domains',
                localField: 'domainId',
                foreignField: '_id',
                as: 'domain'
            }

        },
        { $unwind : "$domain" }

    ],function (err, results) {
        var domanins=[];
        results.forEach(function (value){
            domanins.push(value.domain);
        });
        domanins=domanins.length===0 ? null : domanins;
        res.httpResponse(err,200,domanins);
    });
};


/* Create deviceType */
module.exports.postCreateDeviceType = function(req, res, next) {
    deviceTypeDriver.create(req.body.deviceType, function(err, results) {
        if(err) return(res.httpResponse(err, null, null));
        else {
            var domains=req.body.domains;
            async.each(domains, function(domainId, callback) {

                deviceTypeDomainDriver.create({deviceTypeId:results._id,domainId:domainId},function(err,deviceTypeDomainItem){
                    callback(err);
                });

            }, function(err) {
                res.httpResponse(err, null, results);
            });

        }
    });
}


/* GET deviceTypes list */
module.exports.getDeviceTypes = function(req, res, next) {
    deviceTypeDriver.findAll(req.query, req.dbQueryFields, req.options, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* GET deviceType By Id */
module.exports.getDeviceTypeById = function(req, res, next) {
    var id = req.params.id
    deviceTypeDriver.findById(id, req.dbQueryFields, function(err, results) {
        res.httpResponse(err, null, results)
    })
}


/* Update deviceType */
module.exports.updateDeviceType = function(req, res, next) {
    deviceTypeDriver.findByIdAndUpdate(req.params.id, req.body.deviceType, function(err, results) {
        res.httpResponse(err, null, results)
    })
}



/* Delete deviceTypes */
module.exports.deleteDeviceType = function(req, res, next) {
    var id = req.params.id;

    //delete associated apiActions
    apiActionsDriver.deleteMany({deviceTypeId:id},function(err){
        if(!err){
            //delete associated apiActions
            deviceTypeDomainDriver.deleteMany({deviceTypeId:id},function(err){
                if(!err){
                    deviceTypeDriver.findByIdAndRemove(id, function(err, deletedDeviceType) {
                        res.httpResponse(err, null, deletedDeviceType)
                    })
                }else{
                    res.httpResponse(err, null, null);
                }
            });
        }else{
            res.httpResponse(err, null, null);
        }
    });


};
