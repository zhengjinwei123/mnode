/**
 * Created by zhengjinwei on 2017/1/16.
 */

var UserModel = require("./template/user");

var m = new UserModel();

m.setMysql({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "lxh_reportdb",
    password: "root"
});

m.setRedis({
    poolCnt: 1,
    namePrefix: "pool_",
    host: "127.0.0.1",
    port: 6379,
    db: 1,
    auth: null
});


console.log(m.getFullTableName());

process.on("uncaughtException", function (err) {
    console.error(err.message, err.stack);
})

//m.find(188189, function (err, model) {
//    if (!err && model) {
//        console.log(m.getFields())
//        console.log(m.getField('id'))
//    }
//});


m.initFields({
    roleid:104,
    rolename: "中文",
    create_tm: new Date().getTime() / 1000,
    serverid: 1000033,
    channelid: 10000
});

m.insert(function(err){
    console.log("insert",err);
    //m.setField("rolename","ROLENAME2");
    //m.update(function(ERR){
    //    console.log("update",ERR)
    //});
});



//m.delete(function(err){
//    console.log(err);
//})

var Cache = require("./cache");

var c = new Cache({
    poolCnt: 1,
    namePrefix: "pool_",
    host: "127.0.0.1",
    port: 6379,
    db: 1,
    auth: null
},{
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "lxh_reportdb",
    password: "root"
},1000);


