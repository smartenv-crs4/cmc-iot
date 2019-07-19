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
var _=require('underscore')


function pagination(query){
    var paginateConf={error:null,paginateInfo:{}};

    var skip = query.skip && !isNaN(parseInt(query.skip)) ? parseInt(query.skip) : conf.pagination.skip;
    var limit = query.limit && !isNaN(parseInt(query.limit)) ? parseInt(query.limit): conf.pagination.limit;


    if((!conf.pagination.allowLargerLimit) && limit>conf.pagination.limit){
        paginateConf.error="limit must be less then " + conf.pagination.limit;

    }else{
        var totalCount = query.totalCount  ? query.totalCount : conf.pagination.totalCount;


        if(limit==-1)
            paginateConf.paginateInfo = {"skip": skip, totalCount:totalCount};
        else
            paginateConf.paginateInfo = {"skip": skip, "limit": limit, totalCount:totalCount};

    }

    return (paginateConf);
}




function order(query){
    var orderParameters=null;
    var sortDescRaw = query.sortDesc ? query.sortDesc.split(",") : null;
    var sortAscRaw = query.sortAsc ? query.sortAsc.split(",") : null;


    if (sortAscRaw) {
        orderParameters={sort:{}};
        _.each(sortAscRaw,function(value,index){
            orderParameters.sort[value]="asc"
        });
    }

    if (sortDescRaw) {
        orderParameters={sort:{}};
        _.each(sortDescRaw,function(value,index){
            orderParameters.sort[value]="desc"
        });
    }
    return(orderParameters);

}


//Middleware to parse DB query fields selection from request URI
//Adds dbQueryFields to request
exports.parseFields = function (req, res, next) {

    var fields = req.query.fields ? req.query.fields.split(",") : null;
    if (fields) {
        req.dbQueryFields = fields.join(' ');
    }
    else {
        req.dbQueryFields = null;
    }
    next();

};

//Middleware to parse pagination params from request URI
//Adds dbPagination to request
exports.parsePagination = function (req, res, next) {



    var paginateInfo=pagination(req.query);

    if(paginateInfo.error){
        return res.boom.badRequest(paginateInfo.error);
    }else{
        req.dbPagination=paginateInfo.paginateInfo;
        next();
    }

};

//Middleware to parse sort option from request
//Adds sort to request
exports.parseOrder = function (req, res, next) {

    req.sort = order(req.query);
    next();

};


//Middleware to parse sort option from request
//Adds sort to request
exports.parseOptions = function (req, res, next) {



    var options=pagination(req.query);

    if(options.error){
        return res.boom.badRequest(options.error);
    }else{
        req.options=_.extend(options.paginateInfo,order(req.query));
        next();
    }
};


//Middleware to parse sort option from request
//Adds sort to request
exports.validateBody = function (mandatoryFields) {

    return(
        function (req,res,next){
            if (!req.body || _.isEmpty(req.body)){
                return res.boom.badRequest('body missing');
            }else{
                var noMandatoryFields="";
                mandatoryFields.forEach(function(value,index){
                    if(!req.body[value]) noMandatoryFields+=value+", ";
                });

                if(noMandatoryFields.length>0){
                    return res.boom.badRequest("body fields '" + noMandatoryFields.slice(0,-2) + "' missing");
                }else {
                    next();
                }
            }
        }
    );
};



//Middleware to parse sort option from request
//Adds sort to request
exports.parseIds = function(field){
    return(function (req, res, next) {

        if (req.query[field]) {
            req.query._id =  req.query[field];
            delete req.query[field];
        }
        next();
    });
};

