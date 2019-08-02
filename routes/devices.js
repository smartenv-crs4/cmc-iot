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

var express = require('express');
var router = express.Router();
var parseRequestMiddleware=require('./middlewares/parseRequestMiddleware');
var authorisationManager=require('./middlewares/authorisationMiddleware');
var devicesHandler=require('./routesHandlers/deviceHandler');
var mongosecurity=require('./middlewares/mongoDbinjectionSecurity');




/* Create devices */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["device"]), function(req, res, next) {
  devicesHandler.postCreateDevice(req,res,next);
});


/* Delete devices. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  devicesHandler.deleteDevice(req,res,next);
});


/* Update devices. */
router.put('/:id',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["device"]), function(req, res, next) {
  devicesHandler.updateDevice(req,res,next);
});



/*Moduli di parsing delle query*/
router.use(parseRequestMiddleware.parseFields);

/* Read devices. */
router.get('/:id',[authorisationManager.checkToken], function(req, res, next) {
  devicesHandler.getDeviceById(req,res,next);
});

router.use(parseRequestMiddleware.parseOptions);
router.use(mongosecurity.parseForOperators);

/* GET devices listing. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseIds("devices"), function(req, res, next) {
  devicesHandler.getDevices(req,res,next);
});

module.exports = router;
