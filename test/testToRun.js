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

// start Timing
require('./reportTest/startTiming');

//Model
require('./Models-Test/apiActionModel');
require('./Models-Test/deviceModel');
require('./Models-Test/deviceType_DomainModel');
require('./Models-Test/deviceTypeModel');
require('./Models-Test/domainModel');
require('./Models-Test/observedPropertyModel');
require('./Models-Test/siteModel');
require('./Models-Test/thingModel');
require('./Models-Test/unitModel');
require('./Models-Test/vendorModel');
require('./Models-Test/observations');

// Utility
require('./handlerUtility-Test/observationsUtility-Test');
require('./handlerUtility-Test/redisHandlerUtility-Test');




//Middlewares
require('./Middlewares-Test/decodeTokenMiddleware');
require('./Middlewares-Test/paginationFilter');
require('./Middlewares-Test/searchFilter');

//API
require('./API-Test-Devices/devices-api');
require('./API-Test-Things/things-api');
require('./API-Test-DeviceTypes/deviceTypes-api');
require('./API-Test-Vendors/vendors-api');
require('./API-Test-Units/units-api');
require('./API-Test-Sites/sites-api');
require('./API-Test-ObservedProperties/observedProperties-api');
require('./API-Test-ApiActions/apiActions-api');
require('./API-Test-Domains/domains-api');
require('./API-Test-Observations/observations-api');



// end timing and Report
require('./reportTest/stopTiming');
