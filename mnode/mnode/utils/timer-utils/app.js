/**
 * Created by Administrator on 2016/12/4.
 */
function TimerUtils() {
    this.s = new Date();
}
TimerUtils.prototype.end = function () {
    return (new Date().getTime() - this.s.getTime());
};

module.exports = TimerUtils;