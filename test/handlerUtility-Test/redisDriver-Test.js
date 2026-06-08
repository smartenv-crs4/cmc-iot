/*
 ############################################################################
 ############################### GPL III ####################################
 ############################################################################
 *                         Copyright 2019 CRS4                              *
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

var EventEmitter = require('events');
var should = require('should/should');

var redisModule = require('redis');
var originalCreateClient = redisModule.createClient;
var redisDriverModulePath = require.resolve('../../DBEngineHandler/drivers/redisDriver');

function loadRedisDriverWithClient(fakeClient) {
    redisModule.createClient = function () {
        return fakeClient;
    };

    delete require.cache[redisDriverModulePath];
    return require('../../DBEngineHandler/drivers/redisDriver');
}

describe('Redis Driver Unit Test', function () {

    afterEach(function () {
        redisModule.createClient = originalCreateClient;
        delete require.cache[redisDriverModulePath];
    });

    it('must invoke connect callback only once when repeated connection errors occur', function (done) {
        var fakeClient = new EventEmitter();
        var redisDriver = loadRedisDriverWithClient(fakeClient);
        var callbackCount = 0;

        redisDriver.connect({
            totalRetryTime: 100,
            maxRetryTime: 10,
            connection: {
                host: '127.0.0.1',
                port: 6390,
                db: 0,
                password: ''
            }
        }, function (err) {
            callbackCount += 1;
            should(err).be.not.null();
            err.message.should.be.equal('first failure');
        });

        fakeClient.emit('error', new Error('first failure'));
        fakeClient.emit('error', new Error('second failure'));

        setImmediate(function () {
            callbackCount.should.be.equal(1);
            redisDriver.getRedisStatus().should.be.false();
            done();
        });
    });

    it('must report redis service not available for commands when disconnected', function (done) {
        var redisDriver = loadRedisDriverWithClient(new EventEmitter());

        redisDriver.flushall(function (err) {
            should(err).be.not.null();
            err.message.should.be.equal('Redis cache Service is not Available');
            done();
        });
    });
});