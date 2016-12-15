/**
 * Created by zhengjinwei on 2016/12/15.
 */
var Mongoose = require('mongoose');

var schemeTable = {
    name: {type: String},
    age: {type: Number}
};

var schema = new Mongoose.Schema(schemeTable, {});

schema.statics.getData = function (callback) {
    var condition = {};
    var view = {_id: 0};
    this.find(condition, view).lean().exec(function (err, docs) {
        callback(err, docs);
    })
};

schema.statics.insertData = function (callback) {

    var newData = new this();
    newData.name = 'zhengjinwei';
    newData.age = 26;

    newData.save(newData,function (err, resp) {
        callback(err, resp);
    })
};


module.exports = {
    "table": 'student',
    'schema': schema
};