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

var errorLog=require("./error");

function serverError(res,err,message){
    message=err.message || message|| "an unexpected condition was encountered and no more specific message is suitable";
    errorLog.printErrorLog("mongooseError.js " + message);
    res.boom.badImplementation(message);
}

function badRequestError(res,err,message,printError){
    message=err.message || message || "The server cannot or will not process the request due to an apparent client error";
    if(printError) errorLog.printErrorLog("mongooseError.js " + message);
    res.boom.badRequest(message);
}

function badDataError(res,err,message,printError){
    message=err.message || message || "The server cannot or will not process the request due to an apparent client error";
    if(printError) errorLog.printErrorLog("mongooseError.js " + message);
    res.boom.badData(message);
}

function unprocessableError(res,err,message,printError){
    message=err.message || message || "The server cannot or will not process the request due to semantic errors";
    if(printError) errorLog.printErrorLog("mongooseError.js " + message);
    res.boom.badData(message);
}


function conflictError(res,err,message){
    message=err.message || message || "The request could not be processed because of conflict in the current state of the resource";
    errorLog.printErrorLog("mongooseError.js " + message);
    res.boom.conflict(message);
}


function handleOtherErrors(res,err){
    if(err.message.indexOf("Projection cannot have a mix of inclusion and exclusion")>=0)
        badRequestError(res,err);
    else
        serverError(res,err);
}

exports.handleError= function(res,err){

    switch(err.name) {
        case "MongooseError":
            serverError(res,err,"General Mongoose error");
            break;
        case "DisconnectedError":
            serverError(res,err,"This connection timed out in trying to reconnect to MongoDB and will not successfully reconnect to MongoDB unless you explicitly reconnect.");
            break;
        case "DivergentArrayError":
            serverError(res,err,"You attempted to save() an array that was modified after you loaded it with a $elemMatch or similar projection");
            break;
        case "MissingSchemaError":
            serverError(res,err,"You tried to access a model with mongoose.model() that was not defined");
            break;
        case "DocumentNotFoundError":
            serverError(res,err,"The document you tried to save() was not found");
            break;
        case "OverwriteModelError":
            serverError(res,err,"Thrown when you call mongoose.model() to re-define a model that was already defined.");
            break;
         case "ParallelSaveError":
            serverError(res,err,"Thrown when you call save() on a document when the same document instance is already saving.");
            break;
        case "VersionError":
            serverError(res,err,"Thrown when the document is out of sync");
            break;
        case "CastError":
            badRequestError(res,err,"Mongoose could not convert a value to the type defined in the schema path");
            break;
        case "ValidatorError":
            badRequestError(res,err,"Error from an individual schema path's validator");
            break;
        case "ValidationError":
            badRequestError(res,err,"Error returned from validate() or validateSync()");
            break;
        case "ObjectExpectedError":
            badRequestError(res,err,"Thrown when you set a nested path to a non-object value with strict mode set");
            break;
        case "ObjectParameterError":
            badRequestError(res,err," Thrown when you pass a non-object value to a function which expects an object as a paramter");
            break;
        case "StrictModeError":
            badRequestError(res,err," Thrown when you pass a field not in schema and strict mode is set to throw");
            break;
        case "BadRequestError":
            badRequestError(res,err," The server cannot or will not process the request due to an apparent client error");
            break;
        case "BadDataError":
            badDataError(res,err," The server cannot or will not process the request due to an apparent client error");
            break;
        case "ConflictError":
            conflictError(res,err," Thrown The request could not be processed because of conflict in the current state of the resource");
            break;
        case "outOfRangeError":
            unprocessableError(res,err,"Value Out of Range",false);
            break;
        case "unprocessableError":
            unprocessableError(res,err,"The server cannot or will not process the request due to semantic errors",false);
            break;
        case "DeviceTypeError":
            unprocessableError(res,err,"Not valid for tis device Type",false);
            break;
        case "DismissedError":
            unprocessableError(res,err,"Dismissed thing/device",false);
            break;
        case "DisabledError":
            unprocessableError(res,err,"Disabled thing/device",false);
            break;
        case "NotExistError":
            unprocessableError(res,err,"Not available thing/device",false);
            break;
        case "DuplicatedObservation":
            badDataError(res,err,"Not available thing/device",false);
            break;
        default:
            handleOtherErrors(res,err);
    }

};

