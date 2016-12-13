/**
 * Created by ff on 2016/12/12.
 */

var Async = require("async");
Async.each({a:1,b:2},function(o,cb){
    console.log(o);
    cb(null);
},function(err,resp){

});

console.log(typeof {})