var Bearcat = require('bearcat');
var Application = function () {
    this.$id = "application";

    this.getComponent = function () {
        return Bearcat.getBean(require('../../../node_modules/newbeely-nodejs/lib/components/redisComponent/redisComponent.js'), 'dao-rank', {
            host: "127.0.0.1",
            port: 6379,
            auth_pass: ""
        });
    };
};

describe("tools test", function () {
    before('init bearcat ', function (done) {
        Bearcat.createApp();
        Bearcat.module(Application);
        Bearcat.use(['application']);
        Bearcat.start(function () {
            Bearcat.abb = "ttttttttttttttttt";
            done();
        });
    });
    it('tester', function (done) {
        var tools = Bearcat.getBean(require('../schemas/tools.js'));
        tools.getID("march", "31", done);
    });
    it('checker', function (done) {
        var tools = Bearcat.getBean(require('../schemas/tools.js'));
        tools.check("march", function (err, data) {
            if (err) done(err);
            //require("chai").expect(data).to.be.equal("31");
            console.log(data);
            done();
        });
    });
    after('release bearcat', function (done) {
        Bearcat.stop();
        done();
    });
});