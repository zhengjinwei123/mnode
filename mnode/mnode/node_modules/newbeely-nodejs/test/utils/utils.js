var Bearcat = require('bearcat');

describe('utils test', function () {
    before('init bearcat', function (done) {
        Bearcat.createApp();
        Bearcat.start(function () {
            Bearcat.getBean(require('../../lib/utils/utils'));
            done();
        });
    });
    it('uniqueString test', function (done) {
        var results = {
            16: [], 32: [], 64: [], 128: []
        };
        for (var i = 0; i < 10; i++) {
            results["16"].push(Bearcat.getBean('utils').uniqueString(i, 16));
        }
        for (var i = 0; i < 10; i++) {
            results["32"].push(Bearcat.getBean('utils').uniqueString(i, 32));
        }
        for (var i = 0; i < 10; i++) {
            results["64"].push(Bearcat.getBean('utils').uniqueString(i, 64));
        }
        for (var i = 0; i < 10; i++) {
            results["128"].push(Bearcat.getBean('utils').uniqueString(i, 128));
        }
        console.log(JSON.stringify(results, 0, 4));
        done();
    });
    it('random test', function (done) {
        var array = [100, 5, 168, "hello", "world", {name: "a"}];
        console.log("random", array, " is ", Bearcat.getBean('utils').random(array), "\n");

        var hasWeight = [{weight: 100, value: 100}, {weight: 10, value: 10}, {weight: 50, value: 50}];
        console.log("random by weight", hasWeight, " is ", Bearcat.getBean('utils').random(hasWeight));
        done();
    });
    it('object size test', function (done) {
        var object = {
            name: "a",
            age: 30,
            run: function () {
            }
        };
        console.log("object size is ", Bearcat.getBean('utils').size(object));
        done();
    });
    it('array diff test', function (done) {
        var a1 = [0, 2, 3, 10];
        var a2 = [0, 2, 3, 10];
        var a3 = ["test"];
        console.log("array diff:", Bearcat.getBean('utils').arrayDiff(a1, a2), Bearcat.getBean('utils').arrayDiff(a1, a3), Bearcat.getBean('utils').arrayDiff(a3, a2));
        done();
    });
    it('has chinese char test', function (done) {
        var text = "im test str 是否 ok!";
        console.log(text, Bearcat.getBean('utils').hasChineseChar(text));
        done();
    });
    after('release bearcat', function (done) {
        Bearcat.stop();
        done();
    });
});