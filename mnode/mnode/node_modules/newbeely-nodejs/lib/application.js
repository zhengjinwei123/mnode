/**
 * @filename application
 *
 * @module application
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */

var Logger = require('pomelo-logger').getLogger('newbeely', 'application'),
    Bearcat = require('bearcat'),
    Path = require('path'),
    FS = require('fs');

var STATE_INITED = 1;  // app has inited
var STATE_START = 2;    // app start
var STATE_STARTED = 3;  // app has started
var STATE_STOPED = 4;  // app has stoped

/**
 * 应用实例Application
 *
 * @example
 *  require('bearcat).getBean('application)
 * @class Application
 * @constructor
 */
function Application() {

    /**
     * 应用程序状态 分为
     * STATE_INITED: 初始化完毕
     * STATE_START: 启动中
     * STATE_STARTED: 启动完毕
     * STATE_STOPED: 已经停止
     *
     * @property state
     * @type {number}
     */
    this.state = 0;

    /**
     * 应用程序缓存字典
     *
     * @property settings
     * @type {Object}
     */
    this.settings = {};

    /**
     * 应用程序加载的所有组件,结构为{service:[component,component]}
     *
     * @property components
     * @type {[Object]}
     */
    this.components = {};

    Logger.info("Application created.");
}

/**
 * 初始化Application方法
 *
 * @method init
 * @for Application
 * @param {Array} opts 初始化参数,具体为外部的/config/services.json配置的数据, opts[i] 为单个服务配置
 */
Application.prototype.init = function (opts) {

    /// config all component
    for (var i in opts) {
        this.components[i] = Bearcat.getBean(opts[i].bean, i, opts[i]);
    }
    if (FS.existsSync(Path.join(this.workedir, "/config/", this.log4js))) {
        require('pomelo-logger').configure(Path.join(this.workedir, "/config/", this.log4js), {
            base: this.workedir,
            env: this.env
        });
    }

    Logger.info("Application inited.");
    this.state |= (1 << STATE_INITED);
};

/**
 * 启动服务和服务下挂的组件
 *
 * @example
 *  require('bearcat').getBean('application').start()
 * @method start
 * @for Application
 * @async
 *
 * @return null
 */
Application.prototype.start = function () {
    this.state |= (1 << STATE_START);

    for (var i in this.components) {
        var component = this.components[i];
        if (component) {
            component.start();
        } else {
            Logger.error("Component :" + j + " = null;");
        }
    }

    Logger.info("Application started.");
    this.state |= (1 << STATE_STARTED);
};

/**
 * 停止服务
 *
 * @example
 *  require('bearcat').getBean('application').stop()
 * @method stop
 * @for Application
 * @return null;
 */
Application.prototype.stop = function () {


    Logger.info("Application stop");
    this.state |= (1 << STATE_STOPED);
};

/**
 * 设置配置信息
 *
 * @method set
 * @for Application
 * @param {String} key 数据主键
 * @param {*} value 数据
 * @param {Boolean} bind 是否绑定application
 * @return null
 *
 * @example
 *  require('bearcat').getBean('application').set('data','D://workspace/project/configs/data.json',false);
 */
Application.prototype.set = function (key, value, bind) {
    this.settings[key] = value;
    if (bind) {
        this[key] = value;
    }
};

/**
 * application作为全局缓存数据的输出接口
 * 数据填充方式为 set(key,value,bind) 接口
 *
 * @method get
 * @for Application
 * @param {String} key 数据主键
 * @returns {*}
 *
 * @example
 *  require('bearcat').getBean('application').get('data');
 */
Application.prototype.get = function (key) {
    return this.settings[key];
};

/**
 * 获取服务器组件
 *
 * @method getComponent
 * @for Application
 * @param {String} cid 组件id
 * @return {*} 组件Bearcat Bean
 *
 * @example
 *  require('bearcat').getBean('application').getComponent('componentName');
 */
Application.prototype.getComponent = function (cid) {
    return this.components[cid];
};

module.exports = {
    id: "application",
    func: Application
};