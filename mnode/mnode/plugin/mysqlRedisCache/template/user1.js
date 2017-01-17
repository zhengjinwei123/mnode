/**
 * Created by zhengjinwei on 2017/1/17.
 */
var Model = require("../model");
var Util = require("util");

function User1() {
    Model.call(this);
    this.tableName = 'user1';
    this.fields = {
        "roleid": 0,
        "rolename": "",
        "create_tm": "0",
        "serverid": "0",
        "channelid": "0",
        "lastupdate": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    };
    this.tablePrefix = 't1_';
    this.roleid = 'pk';
}
Util.inherits(User1, Model);

module.exports = User1;