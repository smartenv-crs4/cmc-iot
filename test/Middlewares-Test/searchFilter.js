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

describe('Search Filter Test', function(){

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

    var range = _.range(100);
    async.each(range, function(e,cb){

        Device.create({
            name:"name" + e,
            description:"description" +e,
            thingId:Device.ObjectId(),
            typeId:Device.ObjectId()
        },function(err,val){
            if (err) throw err;
            cb();
        });

    }, function(err){
        done();
      });
    });


  afterEach(function(done){
      Device.deleteMany(function(err, p){
          if(err) throw err;
          done();
      });
  });



  describe('findAll() field selection', function(){

    it('results must include fields projection [name, description]', function(done){

      Device.findAll({}, "name description", null, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(100);
            results.devices[0].should.have.properties("name");
            results.devices[0].should.have.properties("description");
            should(results.devices[0].thingId).be.eql(undefined);
            should(results.devices[0].typeId).be.eql(undefined);
          }
          done();
      });
    });
  });


  describe('findAll() field selection', function(){

    it('results must include fields projection [name, description , thingId]', function(done){

      Device.findAll({}, "name description thingId", null, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(100);
            results.devices[0].should.have.properties("name");
            results.devices[0].should.have.properties("description");
            results.devices[0].should.have.properties("thingId");
            should(results.devices[0].typeId).be.eql(undefined);

          }
          done();
      });
    });
  });

  describe('findAll() field selection', function(){

    it('results must not include [thingId] in fields projection', function(done){

      Device.findAll({}, "-thingId", null, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(100);
            results.devices[0].should.have.properties("name");
            results.devices[0].should.have.properties("description");
            should(results.devices[0].thingId).be.eql(undefined);
            results.devices[0].should.have.properties("typeId");
          }
          done();
      });
    });
  });

  describe('findAll() field selection', function(){

    it('results must not include [thingId name] in fields projection', function(done){

      Device.findAll({}, "-thingId -name", null, function(err, results){

          if(err) throw err;
          else{
            results.should.have.property('_metadata');
            results.devices.length.should.be.equal(100);
            should(results.devices[0].name).be.eql(undefined);
            results.devices[0].should.have.properties("description");
            should(results.devices[0].thingId).be.eql(undefined);
            results.devices[0].should.have.properties("typeId");
          }
          done();
      });
    });
  });


    describe('findAll() filter by ids', function(){

        it('must test filter by ids as array ---> ids=[_id1,_id2]', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var ids=[results.devices[0]._id,results.devices[1]._id];
                    Device.findAll({_id:ids}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(2);
                            ids.should.containEql(results.devices[0]._id);
                            ids.should.containEql(results.devices[1]._id);
                        }
                        done();
                    });
                }
            });
        });
    });


    describe('findAll() filter by ids', function(){

        it('must test filter by ids as elements list comma separated  ---> ids="_id1, _id2"', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var ids=results.devices[0]._id+","+ results.devices[1]._id;
                    Device.findAll({_id:ids}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(2);
                            ids.should.containEql(results.devices[0]._id);
                            ids.should.containEql(results.devices[1]._id);
                            ids.indexOf(results.devices[0]._id).should.be.greaterThanOrEqual(0);
                            ids.indexOf(results.devices[1]._id).should.be.greaterThanOrEqual(0);
                        }
                        done();
                    });
                }
            });
        });
    });

    describe('findAll() filter by ids', function(){

        it('must test filter by ids as single value ---> ids="_id1', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var ids=results.devices[0]._id;
                    Device.findAll({_id:ids}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(1);
                            results.devices[0]._id.should.be.eql(ids);
                        }
                        done();
                    });
                }
            });
        });
    });

    describe('findAll() filter by name', function(){

        it('must test filter by name as single value ---> name="name value"', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.devices[0].name;
                    Device.findAll({name:name}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(1);
                            results.devices[0].name.should.be.eql(name);
                        }
                        done();
                    });
                }
            });
        });
    });


    describe('findAll() filter by name', function(){

        it('must test filter by name as list comma separated ---> name="name1,name2"', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.devices[0].name + "," + results.devices[1].name;

                    Device.findAll({name:name}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(2);
                            name.indexOf(results.devices[0].name).should.be.greaterThanOrEqual(0);
                            name.indexOf(results.devices[1].name).should.be.greaterThanOrEqual(0);
                        }
                        done();
                    });
                }
            });
        });
    });


    describe('findAll() filter by name', function(){

        it('must test no filtering by name as list comma separated(with a space) ---> name="name1 , name2"', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=results.devices[0].name + " , " + results.devices[1].name;

                    Device.findAll({name:name}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(0);
                        }
                        done();
                    });
                }
            });
        });
    });


    describe('findAll() filter by name', function(){

        it('must test filter by name as array list ---> name=["name1","name2"]', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.devices[0].name , results.devices[1].name];

                    Device.findAll({name:name}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(2);
                            results.devices[0].name.should.be.equalOneOf(name);
                            results.devices[1].name.should.be.equalOneOf(name);
                        }
                        done();
                    });
                }
            });
        });
    });


    describe('findAll() filter by name and description', function(){

        it('must test filter by name, description as array list ---> name=["name1","name2"] description=["desc1","desc2"]', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.devices[0].name , results.devices[1].name];
                    var description=[results.devices[0].description , results.devices[1].description];

                    Device.findAll({name:name, description:description}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(2);
                            results.devices[0].name.should.be.equalOneOf(name);
                            results.devices[1].name.should.be.equalOneOf(name);
                            results.devices[0].description.should.be.equalOneOf(description);
                            results.devices[1].description.should.be.equalOneOf(description);
                        }
                        done();
                    });
                }
            });
        });
    });

    describe('findAll() filter by name and description', function(){

        it('must test filter by name as array list ---> name=["name1","name2"] and description as a list commma separated description="desc1,desc2]', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.devices[0].name , results.devices[1].name];
                    var description=results.devices[0].description + "," + results.devices[1].description;

                    Device.findAll({name:name, description:description}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(2);
                            results.devices[0].name.should.be.equalOneOf(name);
                            results.devices[1].name.should.be.equalOneOf(name);
                            description.indexOf(results.devices[0].description).should.be.greaterThanOrEqual(0);
                            description.indexOf(results.devices[1].description).should.be.greaterThanOrEqual(0);
                        }
                        done();
                    });
                }
            });
        });
    });

    describe('findAll() filter by name and description', function(){

        it('must test filter by name as array list ---> name=["name1","name2"] and description as single value description="desc1"', function(done){

            Device.findAll({}, null, null, function(err, results){

                if(err) throw err;
                else{
                    var name=[results.devices[0].name , results.devices[1].name];
                    var description=results.devices[0].description;

                    Device.findAll({name:name, description:description}, null, null, function(err, results){

                        if(err) throw err;
                        else{
                            results.should.have.property('_metadata');
                            results.devices.length.should.be.equal(1);
                            results.devices[0].name.should.be.equalOneOf(name);
                            results.devices[0].description.should.equal(description);

                        }
                        done();
                    });
                }
            });
        });
    });


});
