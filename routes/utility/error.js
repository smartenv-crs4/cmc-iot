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


exports.printErrorLog= function(message){
    console.log("");
    console.log("### ************************************************************************************* ###");
    console.log("### --------------------------------- ERROR LOG ----------------------------------------- ###");
    console.log("### ************************************************************************************* ###");
    console.log("###                                                                                       ###");
    var index=0;
    var outputMessage;
    var diff;
    var space=" ";
    var lng=74;
    do{
        outputMessage=message.substr(index,lng);
        if(outputMessage.length < lng){
            diff=lng-outputMessage.length;
            outputMessage=space.repeat(parseInt(diff/2))+outputMessage+space.repeat(diff-parseInt(diff/2));
        }
        console.log("###       " + outputMessage + "      ###");
        index+=lng;
    }while(index<message.length);
    console.log("###                                                                                       ###");
    console.log("### ************************************************************************************* ###");
};
