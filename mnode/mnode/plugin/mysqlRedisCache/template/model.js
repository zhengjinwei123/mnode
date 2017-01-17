/**
 * Created by zhengjinwei on 2017/1/17.
 */
var Model = require("../model");
var Util = require("util");

function MODELNAME(){
    Model.call(this);
    this.tableName = 'tablename';
    this.fields = {};
    this.tablePrefix = 't_';
    this.pk = 'pk';
}
Util.inherits(MODELNAME,Model);

module.exports = MODELNAME;