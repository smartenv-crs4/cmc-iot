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
var conf = require('propertiesmanager').conf;
var authorisationManager=require('./middlewares/authorisationMiddleware');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CMC IoT Microservice by Express' , description:conf.microserviceConf.description});
});


// get env setting used by consule
router.get('/env', function(req, res, next) {
  res.status(200).send({env:conf.env});
});


// get env setting used by
router.get('/configuration',[authorisationManager.checkToken], function(req, res, next) {
  res.status(200).send(conf);
});

/* GET environment info page. */
router.get('/running_env', function(req, res) {
  res.status(200).send({conf:conf});
});

module.exports = router;
