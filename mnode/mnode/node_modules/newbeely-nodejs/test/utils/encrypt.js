var Bearcat = require('bearcat');
var Encrypt = require('../../lib/utils/encrypt');

describe("encrypt test!", function () {
    before('init bearcat', function (done) {
        Bearcat.createApp();
        Bearcat.start(function () {
            var bean = Bearcat.getBean(Encrypt);
            console.log(bean);
            done();
        });
    });
    it("md5 test", function (done) {
        var test = "Hello world!";
        var md5text = Bearcat.getBean('encrypt').md5(test, "hex");
        console.log(test, "=(md5)=", md5text, "\n");
        done();
    });
    it('rc4 encode test', function (done) {
        var object = {
            uid: "test",
            token: "oooo-oo-oo-oooo-ooo"
        };
        var key = "rc4key";
        var text = JSON.stringify(object);
        console.log(text, "=(rc4 encode)=", Bearcat.getBean('encrypt').rc4Encode(text, key));
        done();
    });
    it('rc4 decode test', function (done) {
        var source = "7bd3Q1OxZa99H5oLI9cq3sB5Gb1QDis2btyYv4NF2YyVwUXQPtMN8n6cgQqyluuWiAqVSkOqdVetB0HdbV4OA0IO+e1BTdcqWKr6nGrYIaIZHVzZFeuTsHqknK4C";
        var key = "rc4key";
        console.log('rc4 decode', Bearcat.getBean('encrypt').rc4Decode(source, key));
        done();
    });
    it('sha1 test', function (done) {
        var text = "hello world!"
        console.log(text, "=(sha1)=", Bearcat.getBean('encrypt').sha1(text, 'hex'));
        done();
    });
    it('base64 encode test', function (done) {
        var object = {
            uid: "test",
            token: "oooo-oo-oo-oooo-ooo"
        };
        var text = JSON.stringify(object);
        console.log(text,"=(base64)=",Bearcat.getBean('encrypt').base64Encode(text));
        done();
    });
    it('base64 decode test', function (done) {
        var text ="eyJ1aWQiOiJ0ZXN0IiwidG9rZW4iOiJvb29vLW9vLW9vLW9vb28tb29vIn0=";
        console.log(text,"=(base64)=",Bearcat.getBean('encrypt').base64Decode(text));
        done();
    });
    after('release bearcat', function (done) {
        Bearcat.stop();
        done();
    });
});