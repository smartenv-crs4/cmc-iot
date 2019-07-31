var config = require("../.././config/default.json");
var async=require('async');
var _=require('underscore');
var argv = require('minimist')(process.argv.slice(2));
var conf;
var key;
switch (process.env['NODE_ENV']) {
    case 'dev':
        conf = config.dev || config.production;
        key= config.dev ? 'dev' : 'production';
        break;
    case 'test':
        key= config.test ? 'test' : 'production';
        conf = config.test || config.production;
        break;
    default:
        conf = config.production;
        key='production';
        break;
}

delete argv["_"];


async.eachOf(conf, function(param,index,callback) {

    console.log('Processing Key ' + index);

    if(argv[index]) {
        setValueAndKey(argv[index], conf, index, function (err) {
            callback();
        });
    }

},function(err){
    config[key]=conf;
});


function setValueAndKey(argvTmp, currentObj, currentKey, callbackEnd){
    if((typeof (argvTmp)!="object")){
        if(_.has(currentObj,currentKey))
            currentObj[currentKey] = argvTmp;
        callbackEnd(null);
    }else {
        var keys=_.keys(argvTmp);
        async.eachOf(keys, function(value,key,callback) {
            if(currentObj[currentKey]) {
                setValueAndKey(argvTmp[value], currentObj[currentKey], value, function (err) {
                    callback()
                });
            }else{
                callback();
            }

        },function (err) {
            callbackEnd(null);
        });
    }

}


exports.conf=conf;
