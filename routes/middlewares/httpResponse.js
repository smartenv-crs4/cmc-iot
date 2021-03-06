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

var errorHandler=require('../../routes/utility/mongooseError');



function customResp(res,statusCode,body){
    switch (statusCode) {
        case 409:
            res.boom.conflict(body);
            break;
        case 400:
            res.boom.badRequest(body);
            break;
        case 422:
            res.boom.badData(body);
            break;
        case 404:
            res.boom.notFound(body || "Resource not found");
            break;
        default:
            res.status(statusCode).send(body);
    }
}

/* Delete devices. */
module.exports.httpResponse = function (req,res,next) {

  res.httpResponse=function(err,statusC,body){
      if(err){
          errorHandler.handleError(res,err)
      }else {
          var status_code = null;
          if (!statusC) {
              switch (req.method) {
                  case "POST":
                      status_code = 201;
                      break;
                  case "GET":
                  case "PUT":
                  case "DELETE":
                      status_code = 200;
                      break;
                  default:
                      status_code = 200;
              }
          } else {
              status_code = statusC;
          }
          if (!body)
              status_code = 204;
        customResp(res,status_code,body);
      }
  };

  next();

};

