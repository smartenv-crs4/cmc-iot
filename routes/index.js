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

/*
 * Bootstrap and diagnostic endpoints.
 *
 * These routes expose runtime metadata used by operators and UI tooling:
 * - Service landing page
 * - Environment name
 * - Full resolved configuration (token protected)
 * - Running environment snapshot
 */

/**
 * @api {get} / Service landing page
 * @apiVersion 1.0.0
 * @apiName ServiceLandingPage
 * @apiGroup Service
 * @apiDescription Renders the service's HTML landing page.
 * @apiSuccess {String} . HTML page
 * @apiSampleRequest off
 */
/* Render landing page for quick sanity checks. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CMC IoT Microservice by Express' , description:conf.microserviceConf.description});
});


/**
 * @api {get} /env Get active environment
 * @apiVersion 1.0.0
 * @apiName GetServiceEnvironment
 * @apiGroup Service
 * @apiDescription Returns the configured environment name. This endpoint does not require authentication.
 * @apiSuccess {String} env Active environment name
 * @apiSuccessExample {json} Example: 200 OK, Success Response
 *     {"env": "production"}
 * @apiSampleRequest off
 */
/* Expose the active environment identifier used by console clients. */
router.get('/env', function(req, res, next) {
  res.status(200).send({env:conf.env});
});


/**
 * @api {get} /configuration Get resolved configuration
 * @apiVersion 1.0.0
 * @apiName GetServiceConfiguration
 * @apiGroup Service
 * @apiPermission Access Token
 * @apiDescription Returns the full resolved configuration for the running service. The response can contain sensitive values; access is token-protected and example values are intentionally omitted.
 * @apiSuccess {Object} . Resolved service configuration for the active environment
 * @apiUse Unauthorized
 * @apiSampleRequest off
 */
/* Return the full resolved configuration (restricted to authenticated clients). */
router.get('/configuration',[authorisationManager.checkToken], function(req, res, next) {
  res.status(200).send(conf);
});

/**
 * @api {get} /running_env Get runtime configuration wrapper
 * @apiVersion 1.0.0
 * @apiName GetRunningEnvironment
 * @apiGroup Service
 * @apiDescription Returns the full resolved configuration wrapped in a `conf` property. This route currently has no authentication middleware and may disclose sensitive configuration; it should only be reachable in a trusted environment.
 * @apiSuccess {Object} conf Full resolved service configuration, potentially including sensitive values
 * @apiSampleRequest off
 */
/* Return runtime configuration wrapper used by legacy monitors. */
router.get('/running_env', function(req, res) {
  res.status(200).send({conf:conf});
});

module.exports = router;
