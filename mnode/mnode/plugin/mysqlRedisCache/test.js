/**
 * Created by zhengjinwei on 2017/1/16.
 */

var Model = require("./model");

var m = new Model({}, "id");

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

m.setTableName("regist");

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
    id: 999999997,
    account: 'a',
    mode: '1',
    source: 'source',
    device: 'd',
    deviceuuid: 'dd',
    os: 'o',
    osvers: 's',
    time: '1111',
    savetime: '2017-01-16 17:11:54'
});

//m.insert(function(err){
//    console.log(err);
//})

m.setField("account","ZHENGJINWEI");

//m.update(function(ERR){
//    console.log(ERR)
//})

m.delete(function(err){
    console.log(err);
})


