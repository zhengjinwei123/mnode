(function(root) {

  function rangeDate(startDate, endDate) {
    if (!(startDate instanceof Date)) return [];
    if (!(endDate && endDate instanceof Date)) return [];
    if (!endDate) endDate = Date.now();
    var dates = [],
    currentDate = startDate,
    addDays = function(days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = rangeDate;
    }
    exports.rangeDate = rangeDate;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return rangeDate;
    });
  } else {
    root.rangeDate = rangeDate;
  }

})(this);
