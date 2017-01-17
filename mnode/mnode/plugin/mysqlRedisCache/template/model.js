/**
 * Created by zhengjinwei on genTime.
 * model代码基于工具自动生成,不要进行修改
 */
var Model = require("../model");
var Util = require("util");

function MODELNAME(){
    Model.call(this);
    this.tableName = 'tablename';
    this.fields = {};
    this.tablePrefix = 't_';
    this.pk = 'pkv';
}
Util.inherits(MODELNAME,Model);

module.exports = MODELNAME;