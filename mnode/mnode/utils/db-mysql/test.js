/**
 * Created by zhengjinwei on 2017/1/16.
 */

var Mysql = require("./app")({
    host:"127.0.0.1",
    port:3306,
    user:"root",
    database:"lxh_reportdb",
    password:"root"
});

Mysql.query("select * from t_regist LIMIT 1",[],{
    failed: function (err) {
        console.log(err);
    },
    success: function (rows, fields) {
        console.log(rows[0]['id']);
    }
});