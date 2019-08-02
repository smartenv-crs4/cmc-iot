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
var thingsHandler=require('./routesHandlers/thingHandler');
var mongosecurity=require('./middlewares/mongoDbinjectionSecurity');




/* Create things */
router.post('/',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["thing"]), function(req, res, next) {
  thingsHandler.postCreateThing(req,res,next);
});


/* Delete things. */
router.delete('/:id',[authorisationManager.checkToken], function(req, res, next) {
  thingsHandler.deleteThing(req,res,next);
});


/* Update things. */
router.put('/:id',[authorisationManager.checkToken],parseRequestMiddleware.validateBody(["thing"]), function(req, res, next) {
  thingsHandler.updateThing(req,res,next);
});



/*Moduli di parsing delle query*/
router.use(parseRequestMiddleware.parseFields);

/* Read things. */
router.get('/:id',[authorisationManager.checkToken], function(req, res, next) {
  thingsHandler.getThingById(req,res,next);
});

router.use(parseRequestMiddleware.parseOptions);
router.use(mongosecurity.parseForOperators);

/* GET things listing. */
router.get('/',[authorisationManager.checkToken],parseRequestMiddleware.parseIds("things"), function(req, res, next) {
  thingsHandler.getThings(req,res,next);
});

module.exports = router;
