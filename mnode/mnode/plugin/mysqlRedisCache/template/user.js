/**
 * Created by zhengjinwei on 2017-01-18 16:53:55.
 * model代码基于工具自动生成,不要进行修改
 */
var Model = require("../model");
var Util = require("util");

function User(){
    Model.call(this);
    this.tableName = 'user';
    this.fields = {"roleid":0,"rolename":"","create_tm":"0","serverid":"0","channelid":"0","lastupdate":"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"};
    this.tablePrefix = 't1_';
    this.pk = 'roleid';
}
Util.inherits(User,Model);

module.exports = User;