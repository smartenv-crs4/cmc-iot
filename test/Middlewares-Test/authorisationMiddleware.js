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

var http = require('http');
var should = require('should/should');
var conf = require('propertiesmanager').conf;
var middleware = require('../../routes/middlewares/authorisationMiddleware');

function createResponseRecorder() {
    var response = {
        called: null,
        message: null
    };

    response.boom = {
        badRequest: function (message) {
            response.called = 'badRequest';
            response.message = message;
            return response;
        },
        unauthorized: function (message) {
            response.called = 'unauthorized';
            response.message = message;
            return response;
        },
        badImplementation: function (message) {
            response.called = 'badImplementation';
            response.message = message;
            return response;
        }
    };

    return response;
}

describe('Authorisation Middleware Unit Test', function () {
    this.timeout(10000);

    var originalAuthUrl;
    var originalAuthToken;

    before(function () {
        originalAuthUrl = conf.authUrl;
        originalAuthToken = conf.auth_token;
    });

    after(function () {
        conf.authUrl = originalAuthUrl;
        conf.auth_token = originalAuthToken;
    });

    it('must return badRequest when no access token is provided', function () {
        var req = {
            body: {},
            query: {},
            headers: {},
            method: 'GET',
            path: '/configuration',
            baseUrl: '',
            route: {path: '/configuration'}
        };
        var res = createResponseRecorder();
        var nextCalled = false;

        middleware.checkToken(req, res, function () {
            nextCalled = true;
        });

        nextCalled.should.be.false();
        res.called.should.be.equal('badRequest');
        res.message.should.be.equal('Unauthorized: Access token required, you are not allowed to use the resource');
    });

    it('must set decodedToken and call next when auth service validates the token', function (done) {
        var server = http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({valid: true, token: {sub: 'user-1'}}));
        });

        server.listen(0, '127.0.0.1', function () {
            var address = server.address();
            conf.authUrl = 'http://127.0.0.1:' + address.port;
            conf.auth_token = 'auth-service-token';

            var req = {
                body: {},
                query: {access_token: 'abc123'},
                headers: {},
                method: 'GET',
                path: '/configuration',
                baseUrl: '',
                route: {path: '/configuration'}
            };
            var res = createResponseRecorder();

            middleware.checkToken(req, res, function () {
                req.decodedToken.should.be.eql({sub: 'user-1'});
                should(res.called).be.null();
                server.close(done);
            });
        });
    });

    it('must return unauthorized when auth service marks token as invalid', function (done) {
        var server = http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({valid: false, error_message: 'Token not allowed'}));
        });

        server.listen(0, '127.0.0.1', function () {
            var address = server.address();
            conf.authUrl = 'http://127.0.0.1:' + address.port;
            conf.auth_token = 'auth-service-token';

            var req = {
                body: {},
                query: {access_token: 'abc123'},
                headers: {},
                method: 'GET',
                path: '/configuration',
                baseUrl: '',
                route: {path: '/configuration'}
            };
            var res = createResponseRecorder();
            var nextCalled = false;

            middleware.checkToken(req, res, function () {
                nextCalled = true;
            });

            setTimeout(function () {
                nextCalled.should.be.false();
                res.called.should.be.equal('unauthorized');
                res.message.should.be.equal('Token not allowed');
                server.close(done);
            }, 50);
        });
    });
});