

// var url = APIURL + '/signin';


var start,end;
var tests={};
var moment=require('moment');

exports.startTime=function() {
   start=moment(new Date()).utc();
};

exports.stopTime=function(testName) {
    end=moment(new Date()).utc();
    tests[testName]=moment(end.diff(start)).utc().format("HH:mm:ss");
};

exports.stopTimeRaw=function() {
    end=moment(new Date()).utc();
    return(moment(end.diff(start)).utc());
};

exports.printReport=function() {
    console.log("REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT");
   for (var key in tests){
       console.log(key + ": " + tests[key] + " ms" );
   }
   console.log("REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT-REPORT");
};