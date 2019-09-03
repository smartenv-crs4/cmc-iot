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

exports.findAll = function findAll(model, entityName, conditions, fields, options, callback) {

    var opt = options || {};

    if(opt.limit==-1) {
        delete opt.skip;
    }


    var query={};

    _.each(conditions,function(value,key){

        if (model.schema.path(key) || (key==="_id")) {

            if (_.isArray(value)) { //is an array
                query[key]={ "$in": value };
            } else {
                if (_.isString(value) && (value.indexOf(",")>=0)) { //is a string of values comma separated
                    query[key]={ "$in": value.split(",") };
                }else
                    query[key] = value;
            }
        }
    });


    model.find(query, fields, opt, function (err, result) {


        if (!err) {

            var entities = entityName ? entityName : 'entities';

            var results = {
                _metadata: {
                    totalCount: false,
                    skip: opt.skip || 0,
                    limit: opt.limit || -1
                }
            };

            results[entities] = result;

            if(options && options.totalCount){
                model.countDocuments(query, function (err, count) {

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



exports.findByIdAndUpdateStrictMode = function findByIdAndUpdateStrictMode(model, id, newFields, unUpdatableFields, options,callback) {

    try {
        for(const field in unUpdatableFields) {

            if(newFields[unUpdatableFields[field]]) {
                var error= new Error("The field '" + unUpdatableFields[field] + "' is in Schema but cannot be changed anymore. If exist you should use an action to do it");
                error.name="ValidatorError";
                throw(error);
            }
        }
        model.findByIdAndUpdate(id,newFields,options,callback);
    }catch (e) {
        callback(e);
    }

};




//It wraps the find() + populate() method to include metadata

exports.findAllPopulated = function findAllPopulated(schema, entityName, conditions, fields, options, populate, callback) {

    var opt = options ? options : {skip: conf.skip, limit: conf.limit};
    if (!populate || _.isEmpty(populate)) throw new Error("Populate cannot be empty");
    else {
        var query = schema.find(conditions, fields, opt);

        //populate
        _.each(_.keys(populate), function (p, index) {

            query = query.populate(p, populate[p].join(' '));

        });


        query.exec(function (err, result) {

            if (!err) {
                schema.countDocuments(conditions, function (err, count) {

                    if (!err) {

                        var entities = entityName ? entityName : 'entities';

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
