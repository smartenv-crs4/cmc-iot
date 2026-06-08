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

var db = require('../../connectionsHandler/mongooseConnection');
var deviceDocuments = require('../SetTestenv/createDevicesDocuments');
var thingAndDeviceHandlerUtility = require('../../routes/routesHandlers/handlerUtility/thingAndDeviceHandlerUtility');
var siteDriver = require('../../DBEngineHandler/drivers/siteDriver');
var thingDriver = require('../../DBEngineHandler/drivers/thingDriver');
var should = require('should/should');

describe('Thing And Device Handler Utility Test', function () {
    this.timeout(10000);

    var foreignKeys;

    before(function (done) {
        db.connect(done);
    });

    after(function (done) {
        db.disconnect(done);
    });

    beforeEach(function (done) {
        deviceDocuments.createDocuments(1, false, function (err, createdForeignKeys) {
            if (err) return done(err);
            foreignKeys = createdForeignKeys;
            done();
        });
    });

    afterEach(function (done) {
        deviceDocuments.deleteDocuments(done);
    });

    it('must reject getDeviceStatus with an invalid ObjectId', function (done) {
        thingAndDeviceHandlerUtility.getDeviceStatus('not-a-valid-object-id', false, function (err, deviceStatus) {
            should(err).be.not.null();
            should(deviceStatus).be.undefined();
            err.name.should.be.eql('BadRequestError');
            err.message.should.be.eql('not-a-valid-object-id is a not valid ObjectId');
            done();
        });
    });

    it('must resolve location from the first parent site with coordinates', function (done) {
        siteDriver.create({
            name: 'parent site',
            description: 'parent site',
            location: {type: 'Point', coordinates: [9, 39]}
        }, function (err, parentSite) {
            if (err) return done(err);

            siteDriver.create({
                name: 'child site',
                description: 'child site',
                locatedInSiteId: parentSite._id
            }, function (err, childSite) {
                if (err) return done(err);

                thingDriver.findByIdAndUpdate(foreignKeys.thingId, {siteId: childSite._id}, function (err) {
                    if (err) return done(err);

                    thingAndDeviceHandlerUtility.getDeviceStatus(foreignKeys.deviceId, true, function (err, deviceStatus) {
                        if (err) return done(err);

                        should(deviceStatus).be.ok();
                        should(deviceStatus.location).be.ok();
                        deviceStatus.location.type.should.be.eql('Point');
                        deviceStatus.location.coordinates.should.be.eql([9, 39]);
                        deviceStatus.thing.siteId.toString().should.be.eql(childSite._id.toString());
                        done();
                    });
                });
            });
        });
    });

    it('must fail fast on cyclic site hierarchies while resolving device location', function (done) {
        siteDriver.create({
            name: 'cyclic site',
            description: 'cyclic site',
            locatedInSiteId: siteDriver.ObjectId()
        }, function (err, cyclicSite) {
            if (err) return done(err);

            siteDriver.findByIdAndUpdate(cyclicSite._id, {locatedInSiteId: cyclicSite._id}, function (err) {
                if (err) return done(err);

                thingDriver.findByIdAndUpdate(foreignKeys.thingId, {siteId: cyclicSite._id}, function (err) {
                    if (err) return done(err);

                    thingAndDeviceHandlerUtility.getDeviceStatus(foreignKeys.deviceId, true, function (err, deviceStatus) {
                        should(err).be.not.null();
                        should(deviceStatus).be.not.null();
                        err.name.should.be.eql('ConflictError');
                        err.message.should.be.eql('Cyclic site hierarchy detected while resolving device location.');
                        done();
                    });
                });
            });
        });
    });
});