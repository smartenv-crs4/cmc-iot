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

require('./Custom-Observation/dataValidationTests');
require('./Custom-Observation/searchFilterTests');
require('./Custom-Observation/CRUD-Tests');
require('./Custom-Observation/crudOptionsTests');
require('./Custom-Observation/ApiActions/APIActionsTests');
require('./Custom-Observation/ApiActions/RedisObservationsNotification');
require('./From_Template/accessTokenSecurityTests');
require('./From_Template/requestParserValidationTests');
require('./From_Template/sqlInjectionSecurityTests');
require('./From_Template/paginationTests');
require('./From_Template/httpStatusCodeTests');
