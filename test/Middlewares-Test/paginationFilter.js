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

var _ = require('underscore')._;
var async = require('async');
var db = require("../../DBEngineHandler/models/mongooseConnection");
var Device = require('../../DBEngineHandler/drivers/deviceDriver');
var deviceDocuments=require('../SetTestenv/createDevicesDocuments');

describe('Pagination Filter Test', function(){

  before(function(done){

    db.connect(function(){
      done();
    });
  });

  after(function(done){

    db.disconnect(function(){
      done();
    });
  });




  beforeEach(function(done){

      deviceDocuments.createDocuments(100,function(err,newDeviceId){
          if (err) consoleLogError.printErrorLog("Pagination Middleware tests ---> " + err);
          done();
      });

  });


  afterEach(function(done){
      Device.deleteMany(function(err, p){
          if(err) throw err;
          done();
      });
  });



  describe('findAll({skip:2, limit:30, totalCount:false})', function(){

    it('must include _metadata with correct values -->[ skip:2, limit:30, totalCount:false]', function(done){

      Device.findAll({}, null, {skip:2, limit:30}, function(err, results){

          if (err) consoleLogError.printErrorLog("paginationFilter.js -  must include _metadata with correct values -->[ skip:2, limit:30, totalCount:false] ---> " + err);
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(30);
            results._metadata.skip.should.be.equal(2);
            results._metadata.limit.should.be.equal(30);
            results._metadata.should.have.property('totalCount');
            results._metadata.totalCount.should.be.equal(false);
          }
          done();
      });

    });

  });

    describe('findAll({skip:2, limit:30, totalCount:true})', function(){

        it('must include _metadata with correct values -->[ skip:2, limit:30, totalCount:100]', function(done){

            Device.findAll({}, null, {skip:2, limit:30,totalCount:true}, function(err, results){

                if (err) consoleLogError.printErrorLog("paginationFilter.js -  must include _metadata with correct values -->[ skip:2, limit:30, totalCount:100] ---> " + err);
                else{
                    results.should.have.property('_metadata');
                    results.devices.length.should.be.equal(30);
                    results._metadata.skip.should.be.equal(2);
                    results._metadata.limit.should.be.equal(30);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(100);
                }
                done();
            });

        });

    });


  describe('findAll({skip:0, limit:10, totalCount:false})', function(){

    it('must include _metadata with correct values -->[ skip:2, limit:30, totalCount:false]', function(done){
      Device.findAll({}, null, {skip:0, limit:10}, function(err, results){
          if (err) consoleLogError.printErrorLog("paginationFilter.js -  must include _metadata with correct values -->[ skip:2, limit:30, totalCount:false] ---> " + err);
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(10);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(10);
              results._metadata.should.have.property('totalCount');

          }
          done();
      });

    });

  });

  describe('findAll({skip:0, limit:10, totalCount:true})', function(){

    it('must include _metadata with correct values -->[ skip:0, limit:10, totalCount:100]', function(done){
      Device.findAll({}, null, {skip:0, limit:10,totalCount:true}, function(err, results){
          if (err) consoleLogError.printErrorLog("paginationFilter.js -  must include _metadata with correct values -->[ skip:0, limit:10, totalCount:100] ---> " + err);
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(10);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(10);
            results._metadata.totalCount.should.be.equal(100);

          }
          done();
      });

    });

  });


  describe('findAll() no pagination', function(){

    it('must include _metadata with default values -->[ skip:0, limit:-1, totalCount:false]', function(done){

      Device.findAll({}, null, null, function(err, results){

          if (err) consoleLogError.printErrorLog("paginationFilter.js -  'must include _metadata with default values -->[ skip:0, limit:-1, totalCount:false] ---> " + err);
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(100);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(-1);
            results._metadata.should.have.property('totalCount');
            results._metadata.totalCount.should.be.equal(false);

          }
          done();
      });

    });

  });

  describe('findAll({skip:0, limit:2})', function(){

    it('must include _metadata with correct values and only 2 entries', function(done){

      Device.findAll({}, null, {skip:0, limit:2}, function(err, results){

          if (err) consoleLogError.printErrorLog("paginationFilter.js - must include _metadata with correct values and only 2 entries  ---> " + err);
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(2);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(2);
            results._metadata.should.have.property('totalCount')
            results._metadata.totalCount.should.be.equal(false);;

          }
          done();

      });

    });

  });

});
