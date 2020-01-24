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
var db = require("../../DBEngineHandler/models/mongooseConnection");
var Thing = require('../../DBEngineHandler/drivers/thingDriver');
var thingDocuments=require('../SetTestenv/createThingsDocuments');
var should = require('should/should');


describe('Things Model Test', function(){

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
          thingDocuments.createDocuments(100,function(err){
              if (err) throw err;
              else done();
          });
   });


  afterEach(function(done){
      thingDocuments.deleteDocuments(function(err){
          if(err) throw err;
          done();
      });
  });



  describe('findAll({skip:2, limit:30})', function(){

    it('must include _metadata with correct values', function(done){

      Thing.findAll({}, null, {skip:2, limit:30}, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.things.length.should.be.equal(30);
            results._metadata.skip.should.be.equal(2);
            results._metadata.limit.should.be.equal(30);
            results._metadata.should.have.property('totalCount');
            results._metadata.totalCount.should.be.equal(false);
          }
          done();
      });

    });

  });

    describe('findAll({skip:2, limit:30})', function(){

        it('must include _metadata with correct values', function(done){

            Thing.findAll({}, null, {skip:2, limit:30,totalCount:true}, function(err, results){

                if(err) throw err;
                else{
                    results.should.have.property('_metadata');
                    results.things.length.should.be.equal(30);
                    results._metadata.skip.should.be.equal(2);
                    results._metadata.limit.should.be.equal(30);
                    results._metadata.should.have.property('totalCount');
                    results._metadata.totalCount.should.be.equal(100);
                }
                done();
            });

        });

    });


  describe('findAll({skip:0, limit:10})', function(){

    it('must include _metadata with correct values', function(done){
      Thing.findAll({}, null, {skip:0, limit:10}, function(err, results){
          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.things.length.should.be.equal(10);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(10);

          }
          done();
      });

    });

  });

  describe('findAll({skip:0, limit:10})', function(){

    it('must include _metadata with correct values', function(done){
      Thing.findAll({}, null, {skip:0, limit:10,totalCount:true}, function(err, results){
          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.things.length.should.be.equal(10);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(10);
            results._metadata.totalCount.should.be.equal(100);

          }
          done();
      });

    });

  });


  describe('findAll() no pagination', function(){

    it('must include _metadata with default values', function(done){

      Thing.findAll({}, null, null, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.things.length.should.be.equal(100);
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

      Thing.findAll({}, null, {skip:0, limit:2}, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.things.length.should.be.equal(2);
            results._metadata.skip.should.be.equal(0);
            results._metadata.limit.should.be.equal(2);
            results._metadata.should.have.property('totalCount')
            results._metadata.totalCount.should.be.equal(false);;

          }
          done();

      });

    });

  });



  describe('findOne()', function(){

    it('must include all required properties', function(done){

      Thing.findOne({}, null, function(err, thing){

          if(err) throw err;
          else{
            thing.should.have.property('description');
            thing.should.have.property('name');
            thing.should.have.property('ownerId');
            thing.should.have.property('vendorId');
            thing.should.have.property('siteId');
            thing.should.have.property('dismissed');
            thing.should.have.property('disabled');
            thing.should.have.property('mobile');
            thing.should.have.property('api');
            thing.api.should.have.property('url');
            thing.api.should.have.property('access_token');
            thing.should.have.property('direct') ;
            thing.direct.should.have.property('url');
            thing.direct.should.have.property('access_token');
            thing.direct.should.have.property('username');
            thing.direct.should.have.property('password');
            thing.direct.should.have.property('private');
            thing.direct.private.should.be.True();
            thing.dismissed.should.be.false();
            thing.disabled.should.be.false();
          }
          done();

      });

    });

  });


    describe('findById()', function(){

        it('must test findById projection', function(done){

            Thing.findOne({}, null, function(err, thing){

                if(err) throw err;
                else{
                    thing.should.have.property('description');
                    thing.should.have.property('name');
                    thing.should.have.property('ownerId');
                    thing.should.have.property('vendorId');
                    thing.should.have.property('siteId');
                    thing.should.have.property('dismissed');
                    thing.should.have.property('disabled');
                    thing.should.have.property('mobile');
                    thing.should.have.property('api');
                    thing.api.should.have.property('url');
                    thing.api.should.have.property('access_token');
                    thing.should.have.property('direct') ;
                    thing.direct.should.have.property('url');
                    thing.direct.should.have.property('access_token');
                    thing.direct.should.have.property('username');
                    thing.direct.should.have.property('password');
                    thing.direct.should.have.property('private');
                    thing.direct.private.should.be.True();
                    thing.dismissed.should.be.false();
                    thing.disabled.should.be.false();

                    Thing.findById(thing._id, "description name disabled", function(err, thingById){

                        if(err) throw err;
                        else{
                            thingById.should.have.property('description');
                            thingById.should.have.property('name');
                            thingById.should.have.property('disabled');
                            should(thingById.ownerId).be.undefined();
                            should(thingById.vendorId).be.undefined();
                            should(thingById.siteId).be.undefined();
                            should(thingById.mobile).be.undefined();
                            should(thingById.api.url).be.undefined();
                            should(thingById.direct.url).be.undefined();
                            thingById._id.should.be.eql(thing._id);
                        }
                        done();
                    });
                }
            });

        });

    });


    describe('updateThing()', function(){

        it('must update a thing', function(done){

            Thing.findOne({}, null, function(err, thing){

                if(err) throw err;
                else{
                    thing.should.have.property('description');
                    thing.should.have.property('name');
                    thing.should.have.property('ownerId');
                    thing.should.have.property('vendorId');
                    thing.should.have.property('siteId');
                    thing.should.have.property('dismissed');
                    thing.should.have.property('disabled');
                    thing.should.have.property('mobile');
                    thing.should.have.property('api');
                    thing.api.should.have.property('url');
                    thing.api.should.have.property('access_token');
                    thing.should.have.property('direct') ;
                    thing.direct.should.have.property('url');
                    thing.direct.should.have.property('access_token');
                    thing.direct.should.have.property('username');
                    thing.direct.should.have.property('password');
                    thing.direct.should.have.property('private');
                    thing.direct.private.should.be.True();
                    thing.dismissed.should.be.false();
                    thing.disabled.should.be.false();
                    var updateName="updateName";
                    Thing.findByIdAndUpdate(thing._id,{name:updateName},function(err,updatedThing){
                        should(err).be.null();
                        updatedThing._id.should.be.eql(thing._id);
                        updatedThing.name.should.be.eql(updateName);

                        Thing.findById(thing._id,function(err,findThing){
                            should(err).be.null();
                            should(findThing).be.not.null();
                            findThing.name.should.be.eql(updateName);
                            findThing.name.should.be.not.eql(thing.name);
                            done();
                        });
                    });
                }
            });
        });
    });



    describe('updateThing()', function(){

        it('must update thing (thing not exist)', function(done){

            Thing.findByIdAndUpdate(Thing.ObjectId(),{name:"aa"},function(err,updatedThing){
                should(err).be.null();
                should(updatedThing).be.null();
                done();
            });
        });
    });


});
