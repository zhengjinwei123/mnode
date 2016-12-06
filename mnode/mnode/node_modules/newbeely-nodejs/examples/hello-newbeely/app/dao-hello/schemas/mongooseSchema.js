/**
 * @filename mongooseSchema
 *
 * @module mongooseSchema
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var Mongoose = require('mongoose');

var TableView = {
    name: {type: String, index: true, required: true},
    age: {type: Number, default: 0},
    email: {type: String, default: "xx@xx.com"}
}

var SchemaOption = {};

var PersonSchema = new Mongoose.Schema(TableView, SchemaOption);

module.exports = {
    "name": "Person",
    "schema": PersonSchema
};