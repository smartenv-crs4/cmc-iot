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


var conf = require('propertiesmanager').conf;
var _ = require('underscore')._;


//It wraps the find() method to include metadata

exports.findAll = function findAll(schema, entityName, conditions, fields, options, callback) {

    var opt = options || {};


    if(opt.skip==-1){
        delete opt.skip;
    }

    if(opt.limit==-1) {
        delete opt.skip;
    }


    schema.find(conditions, fields, opt, function (err, result) {


        if (!err) {

            var entities = entityName ? entityName : 'entities';
//                           console.log(entities);
//                           console.log(count);
            var results = {
                _metadata: {
                    totalCount: false,
                    skip: opt.skip || 0,
                    limit: opt.limit || -1
                }
            };

            results[entities] = result;

            if(options && options.totalCount){
                schema.countDocuments(conditions, function (err, count) {

                    if (!err) {
                        results._metadata.totalCount=count;
                        callback(null, results);
                    }
                    else {
                        callback(err, null);
                    }
                });
            }else{
                callback(null, results);
            }
        }
        else {
            callback(err, null);
        }
    });
};

//It wraps the find() + populate() method to include metadata

exports.findAllPopulated = function findAllPopulated(schema, entityName, conditions, fields, options, populate, callback) {

    var opt = options ? options : {skip: conf.skip, limit: conf.limit};
    if (!populate || _.isEmpty(populate)) throw new Error("Populate cannot be empty");
    else {
        var query = schema.find(conditions, fields, opt);

        //populate
        _.each(_.keys(populate), function (p, index) {

            // console.log(p);
            query = query.populate(p, populate[p].join(' '));

        });


        query.exec(function (err, result) {

            if (!err) {
                schema.countDocuments(conditions, function (err, count) {

                    if (!err) {

                        var entities = entityName ? entityName : 'entities';
                        //                           console.log(entities);
                        //                           console.log(count);
                        var results = {
                            _metadata: {
                                totalCount: count,
                                skip: opt.skip,
                                limit: opt.limit

                            }
                        };
                        results[entities] = result;

                        callback(null, results);
                    }
                    else {
                        callback(err, null);
                    }
                });
            }
            else {
                callback(err, null);
            }


        });

    }


};
