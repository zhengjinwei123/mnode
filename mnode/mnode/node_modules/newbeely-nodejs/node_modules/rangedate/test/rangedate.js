var test = require('tape');
var rangeDate = require('../rangedate');

test('rangedate', function (t) {
  t.plan(6);

  function toString(o) {
    return o.toString();
  }

  function getDate(o) {
    return o.getDate();
  }

  t.deepEqual(rangeDate(new Date(2014,11,01), new Date(2014,11,04)).map(toString), [ 'Mon Dec 01 2014 00:00:00 GMT-0800 (PST)', 'Tue Dec 02 2014 00:00:00 GMT-0800 (PST)', 'Wed Dec 03 2014 00:00:00 GMT-0800 (PST)', 'Thu Dec 04 2014 00:00:00 GMT-0800 (PST)']);
  t.deepEqual(rangeDate(new Date(2014,11,01), new Date(2014,11,04)).map(getDate), [1,2,3,4]);
  t.deepEqual(rangeDate(new Date(2014,11,01)).length, rangeDate(new Date(2014,11,01), Date.now()).length);
  t.deepEqual(rangeDate(), []);
  t.deepEqual(rangeDate({}), []);
  t.deepEqual(rangeDate(343), []);

});
