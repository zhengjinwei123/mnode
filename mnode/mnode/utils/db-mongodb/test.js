/*****
 * 测试用例
 */
var MongodbUtil = require("./app");
var d = new MongodbUtil("localhost", 27017, 'mydb');

d.schema('student').model(function (err, model, release) {
    if (!err) {
        model.getData(function (err, docs) {
            console.log(err, docs);
        })
    } else {
        console.error(err);
    }
    release();
});

d.model(function(err,model,release){
    if (!err) {
        model.insertData(function (err, docs) {
            console.log(err, docs);
        })
    } else {
        console.error(err);
    }
    release();
});