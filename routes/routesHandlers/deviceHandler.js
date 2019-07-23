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


var deviceDriver=require('../../DBEngineHandler/drivers/deviceDriver');
var observations=require('../../DBEngineHandler/drivers/observationDriver');




/* Create device. */
module.exports.postCreateDevice = function(req, res, next) {
    deviceDriver.create(req.body.device,function (err, results) {
        if(err){
            return deviceDriver.errorResponse(res,err);
        }else{
            res.status(201).send(results || err);
        }

    });
};

/* GET devices listing. */
module.exports.getDevices = function(req,res,next){
    deviceDriver.findAll(req.query,req.dbQueryFields,req.options,function(err,results){
        if(err){
            return deviceDriver.errorResponse(res,err);
        }else{
            res.send(results || err);
        }

    })
};

/* Delete devices. */
//TODO descrivere che quando si elimina un device, se non ha misurazioni vene eliminato atrimenti rimane nel sistema ma viene messo in stato dismesso

module.exports.deleteDevice = function(req,res,next){


    var id=req.params.id;
    observations.findAll({deviceId:id},null,{totalCount:true},function(err,results){
        if(err){
            return deviceDriver.errorResponse(res,err);
        } else{
            if((results._metadata.totalCount)>0){ // there are observations then set dismissed:true
                devices.findByIdAndUpdate(id,{dismissed:true},function(err,dismissedDevice){
                    if(err){
                        return deviceDriver.errorResponse(res,err);
                    } else{
                        res.status(200).send(dismissedDevice);
                    }
                });
            }else{  // there aren't observations then delete
                devices.findByIdAndRemove(id,function(err,deletedDevice){
                    if(err){
                        return deviceDriver.errorResponse(res,err);
                    } else{
                        res.status(200).send(deletedDevice);
                    }
                });
            }
        }

    });

};

