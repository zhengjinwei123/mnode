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

m.find(188189, function (err, model) {
    if(!err && model){
        console.log(m.getFields())
        console.log(m.getField('id'))
    }
});
