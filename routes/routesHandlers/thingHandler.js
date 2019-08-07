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


var thingDriver = require('../../DBEngineHandler/drivers/thingDriver');
var deviceDriver = require('../../DBEngineHandler/drivers/deviceDriver.js');
var deviceUtility = require('./handlerUtility/deviceUtility');
var async=require('async');
var config = require('propertiesmanager').conf;


var observationsDriver = require('../../DBEngineHandler/drivers/observationDriver');


/* Create thing. */
module.exports.postCreateThing = function (req, res, next) {
    thingDriver.create(req.body.thing, function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/* Update thing. */
// TODO notificare  tramite REDIS??
module.exports.updateThing = function (req, res, next) {
    thingDriver.findByIdAndUpdateStrict(req.params.id, req.body.thing,["dismissed"], function (err, results) {
        res.httpResponse(err,null,results);
    });
};


/* GET thing By Id. */
//todo direct url visibile solamente al proprietario usare la proprieta --di mongoose per toglierlo
module.exports.getThingById = function (req, res, next) {

    var id = req.params.id;

    thingDriver.findById(id, req.dbQueryFields, function (err, results) {
        res.httpResponse(err,null,results);
    })
};


/* GET things listing. */
// TODO descrivere che dismissed non è un prametro di ricerca di usare laction per cercare i dsmissed
module.exports.getThings = function (req, res, next) {
    thingDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
        res.httpResponse(err,req.statusCode,results);
    });
};

// /* GET things listing. */
// module.exports.getDissmissedThings = function (req, res, next) {
//     req.query.dismissed=true; // dismissed thing must be a query filter
//     thingDriver.findAll(req.query, req.dbQueryFields, req.options, function (err, results) {
//         res.httpResponse(err,201,results);
//     });
// };


function deleteThingById(id,res){
    thingDriver.findByIdAndRemove(id, function (err, deletedThing) {
        res.httpResponse(err,null,deletedThing);
    });
}

/* Delete things. */
//TODO descrivere che quando si elimina un thing, se non ha misurazioni vene eliminato atrimenti rimane nel sistema  viene messo in stato dismesso e l'owner diventa Cmc-Iot

module.exports.deleteThing = function (req, res, next) {


    var id = req.params.id;


    deviceDriver.findAll({thingId: id}, null, {totalCount: true}, function (err, results) {
        if (err) {
            return thingDriver.errorResponse(res, err);
        } else {
            if ((results._metadata.totalCount) > 0) { // there are associated device then set dismissed:true

                var dismiss=false;

                //  Remove all associated devices where:
                //     - if a device has observations then set it dismissed
                //     - if a device hasn't observations then delete it
                //
                //  Then remove thing where
                //     - if thing has a associated device in dismissed status then set it to dismissed and set owner to Cmc-Iot
                //     - if thing hasn't a associated device in dismissed status then delete it

                async.each(results.devices, function(device, callbackDevice) {

                    deviceUtility.deleteDevice(device._id,function(err,deletedDevice){
                        if(err){
                            return thingDriver.errorResponse(res, err);
                        }else{
                            if(deletedDevice && deletedDevice.dismissed ){
                                dismiss=true;
                            }
                            callbackDevice();
                        }
                    });
                }, function(err) {
                    if(dismiss){  // there are devices(dismissed) with observation then thing must be dismissed and owner change to cmc-IoT
                        thingDriver.findByIdAndUpdate(id, {dismissed: true,ownerId:config.cmcIoTThingsOwner._id}, function (err, dismissedThing) {
                            res.httpResponse(err,null,dismissedThing);
                        });
                    }else{ // there aren't devices(dismissed) with observation then thing must be deleted
                       deleteThingById(id,res);
                    }
                });
            } else { // there aren't associated device then delete
                deleteThingById(id,res);
            }
        }
    });

};

