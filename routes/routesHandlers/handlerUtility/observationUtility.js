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
var typeDriver = require('../../../DBEngineHandler/drivers/deviceTypeDriver');
var _=require('underscore');


function checkValidity(err,authorisation, unitId, observationValue, callback){
    if(!err) {

        // //TODO: Remove
        // console.log("CHECK:");
        // console.log(authorisation);
        // console.log(unitId);

        if(authorisation) {
            var auth = {
                authorized: false,
                authInfo: {}
            };

            auth.authorized = (!authorisation.disabled) && (!authorisation.dismissed);
            if (auth.authorized) {
                var valid = false;
                var interval = false;


                authorisation.units.forEach(function (unit) {                  ;

                    if (unit._id.toString() === unitId.toString()) {
                        valid = true;
                        if ((observationValue >= unit.minValue) && (observationValue <= unit.maxValue))
                            interval = true;
                    }
                });
                if (valid) {
                    if (interval) { // it pass all verification tests
                        auth.authorized = true;
                        auth.authInfo = authorisation;
                        callback(null, auth);
                    } else { // observation out of range
                        var Err = new Error("The observation value is out of range.");
                        Err.name = "outOfRangeError";
                        callback(Err, null);
                    }

                } else { // not valid unitId for this device Type
                    var Err = new Error("Not a valid unitId for this device type.");
                    Err.name = "DeviceTypeError";
                    callback(Err, null);
                }

            } else {
                var Err;
                if (authorisation.dismissed) {
                    Err = new Error("The device/thing was removed from available devices/things.");
                    Err.name = "DismissedError";
                } else {
                    Err = new Error("The device/thing was disable. It must be enabled to set observations.");
                    Err.name = "DisabledError";
                }
                callback(Err, null);
            }
        }else{
            Err = new Error("The device/thing not exist.");
            Err.name = "NotExistError";
            callback(Err,null);
        }

    }else{
        callback(err,null);
    }
}


/* Delete devices. */
module.exports.checkIfValid = function (id,unitId,observationValue,callback) {


    //TODO:c
    // - controlla se su Redis c'è un mem cache che verifica se il device può fare una scrittura [disabled,dismissed]
    // e se è l'unitadi misura è compattibile col suo device Type
    // - se non c'è su memm cache allora controlla sul database
    // - Salva su mem cache Redis le autorizzazioni del device [dismissed, disabled, validUnits[unit1,unit2,.....]

    var redis=false; //TODO: change with redis check

    if(redis){
        checkValidity(null,null,unitId,observationValue,callback);
    }else{
        // check device info and valid units into database
        deviceDriver.aggregate([
            {
                $match: {_id:deviceDriver.ObjectId(id)}
            },
            {
                $lookup:{
                    from: 'devicetypes',
                    localField: 'typeId',
                    foreignField: '_id',
                    as: 'deviceType'
                }

            },
            { $unwind : "$deviceType" },
            {
                $lookup:{
                    from: 'observedproperties',
                    localField: 'deviceType.observedPropertyId',
                    foreignField: '_id',
                    as: 'observedProperty'
                }

            },
            { $unwind : "$observedProperty" },
            {
                $lookup: {
                    from: 'units',
                    localField: 'observedProperty._id',
                    foreignField: 'observedPropertyId',
                    as: 'units'
                }

            },
            {
                $project: {
                    dismissed:1,
                    disabled:1,
                    "units._id":1,
                    "units.minValue":1,
                    "units.maxValue":1
                    // name: 0,
                    // description: 0,
                    // thingId: 0,
                    // typeId: 0,
                    // deviceType: 0,
                    // observedProperty:0
                }
            }
        ],function (err, results) {
            checkValidity(err, results[0] || null, unitId, observationValue, callback);
        });
    }
};