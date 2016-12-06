var Bearcat = require('bearcat');

describe('redis component test', function () {
    before('init bearcat', function (done) {
        function application() {
            this.$id = "application";
        }

        Bearcat.createApp();
        Bearcat.module(application);
        Bearcat.use(['application']);
        Bearcat.start(function () {
            done();
        });
    });
    it('Redis execute test', function (done) {
        var redisComponent = Bearcat.getBean(require('../../lib/components/redisComponent/redisComponent'), 'redis', {
            host: "localhost",
            port: 6379,
            pass: ""
        });
        redisComponent.execute(function (client, release) {
            client.set("test", "hello!", function (error, state) {
                console.log("redis set test:hello!", error, state);
                release();
                done();
            });
        });
    });
    it('Redis command test', function (done) {
        var redisComponent = Bearcat.getBean(require('../../lib/components/redisComponent/redisComponent'), 'redis', {
            host: "localhost",
            port: 6379,
            pass: ""
        });
        redisComponent.command('get', 'test', function (error, value) {
            console.log("redis command get test", value);
            done();
        });
    });
    after('release bearcat', function (done) {
        Bearcat.stop();
        done();
    });
});