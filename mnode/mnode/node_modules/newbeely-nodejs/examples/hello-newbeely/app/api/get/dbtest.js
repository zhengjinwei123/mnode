/**
 * @filename dbtest
 *
 * @module dbtest
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var Bearcat = require('bearcat');

module.exports = function () {
    return Bearcat.getBean({
        id: "api-Db",
        func: Db,
        props: [
            {name: "app", "ref": "application"}
        ]
    });
}
function Db() {
    this.app = null;
}

/**
 * http://127.0.0.1:port/db
 *
 * @param msg
 * @param next
 */
Db.prototype.handle = function (msg, next) {
    var dbConnection = this.app.getComponent('dao-hello').getConnection();
    var personSchema = dbConnection.model('Person');
    personSchema.find({}, function (error, persons) {
        next(error, persons);
    });
}