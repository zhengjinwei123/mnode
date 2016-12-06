var Bearcat = require('bearcat');

function Tools() {

}

Tools.prototype.getID = function (key, value, cb) {
    Bearcat.getBean('application').getComponent('dao-rank').command('set', key, value, cb);
};

Tools.prototype.check = function (key, cb) {
    Bearcat.getBean('application').getComponent('dao-rank').command('get', key, cb);
};

module.exports = {
    id: "redis-tools",
    func: Tools
};