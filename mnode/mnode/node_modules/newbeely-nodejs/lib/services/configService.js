/**
 * @filename configService
 *
 * @module configService
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
module.exports = {
    id: "configService",
    func: ConfigService,
    props: [
        {name: "app", ref: "application"}
    ]
}
var Bearcat = require('bearcat'),
    FS = require('fs'),
    Logger = require('pomelo-logger').getLogger('newbeely', 'configService'),
    Path = require('path')


/**
 * 配置文件服务
 *
 * @example
 *  require('bearcat).getBean('configService)
 * @class ConfigService
 * @constructor
 */
function ConfigService() {

    /**
     * bearcat register id
     * @type {string}
     */
    this.$id = module.exports.id;

    /**
     * configs
     *
     * @property configs
     * @type {group:{filename:json}}
     */
    this.configs = {};

    /**
     *
     * @type {null}
     */
    this.app = null;
}

/**
 * 获取配置文件
 *
 * @method get
 * @param {String} group 配置所在组
 * @param {String} name 配置文件名称
 *
 * @example
 *  require('bearcat').getBean('configService').get('groupName','filename');
 */
ConfigService.prototype.get = function (group, name) {
    if (!group) {
        return null;
    }
    if (!this.configs[group]) {
        return null;
    }
    return this.configs[group][name];
}

/**
 * 加载配置文件
 *
 * @method load
 * @param {String} group 配置组--外部可根据组不同分离配置文件
 * @param {String} path 配置文件所在路径
 * @param {Boolean} watch 是否做监听 --监听后会有热更新效果
 * @example
 *      Bearcat.getBean('configService').load('groupName','D://test.json',true);
 */
ConfigService.prototype.load = function (group, path, watch) {
    try {
        var data = require(path);
        if (!this.configs[group]) {
            this.configs[group] = {};
        }

        if (data[this.app.env]) {
            data = data[this.app.env]
        }

        this.configs[group][Path.basename(path, Path.extname(path))] = data;
        if (watch) {
            var self = this;
            FS.watchFile(path, function (event) {
                self.configs[group][Path.basename(path, Path.extname(path))] = require(path);
            });
        }
    } catch (e) {
        Logger.error("Can`t load file by:" + group + "-" + path + " error:" + e.stack);
    }
}
