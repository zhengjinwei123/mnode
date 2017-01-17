/**
 * Created by zhengjinwei on 2017/1/16.
 * mysql-redis 缓存 模型化插件
 * 解决操作mysql的复杂度和速率，利用redis作为缓存，redis定时落地到mysql
 */
var XmlParser = require("../../utils/xml-parser/app");
var FileUtil = require("../../utils/file-utils/app");
var _ = require("lodash");
var Util = require("util");

var MysqlRedisCache = function (xmlPath,ModelPath, callback) {
    if (!FileUtil.isFile(xmlPath)) {
        throw new Error(xmlPath + " file not exits");
    }

    genDBCode(xmlPath, function (err, result, modeList) {
        if (!err && result) {
            var fileName = xmlPath.replace(".xml", ".sql");
            FileUtil.writeSync(fileName, result);

            if (modeList) {
                genModels(ModelPath,modeList,callback);
            }
        }
    });
};

function firstUppercase(str){ // 正则法
    str = str.toLowerCase();
    var reg = /\b(\w)|\s(\w)/g; //  \b判断边界\s判断空格
    return str.replace(reg,function(m){
        return m.toUpperCase()
    });
}

function genModels(ModelPath,dataList,callback) {
    var template = FileUtil.readSync(Path.join(__dirname,"./template/model.js"));

    _.forEach(dataList,function(v,tableName){
        var temp = template.replace(/MODELNAME/g,firstUppercase(tableName));
        temp = temp.replace(/tablename/,tableName);
        temp = temp.replace(/\{\}/,JSON.stringify(v['fields']));
        temp = temp.replace(/t_/,v['tablePrefix']);
        temp = temp.replace(/pkv/,v['pk']);
        temp = temp.replace(/genTime/,new Date().toLocaleString());

        //console.log(temp)
        FileUtil.writeSync(Path.join(ModelPath,"/"+tableName+".js"), temp);
    });
    callback(null);
}

var genDBCode = function (xmlPath, callback) {
    XmlParser(xmlPath, function (err, results) {
        var databaseObj = {};
        if (!err && results && results['database']) {
            var db = results['database']['$']['name'];
            var dbCharacter = results['database']['$']['character'];
            var dbCollate = results['database']['$']['collate'];

            databaseObj.dbName = db;
            databaseObj.dbCharacter = dbCharacter;
            databaseObj.dbCollate = dbCollate;
            databaseObj.tables = [];

            if (!results['database']['tables']) {
                callback("xml format error");
            } else {

                var tables = results['database']['tables'];

                if (!_.isArray(tables)) {
                    tables = [tables];
                }
                parseTables(tables, databaseObj);
                genSql(databaseObj, callback);
            }
        } else {
            callback("xml format error");
        }
    });
};


function genSql(databaseObj, callback) {
    if (databaseObj['dbName']) {
        var modelList = {};//用于记录数据模型，之后用这份数据自动生成数据库模型脚本文件

        var sql = Util.format("CREATE DATABASE IF NOT EXISTS `%s` character set %s collate %s;", databaseObj['dbName'], databaseObj['dbCharacter'] || 'utf8', databaseObj['dbCollate'] || 'utf8_general_ci');
        sql += Util.format('\r\nUSE `%s`', databaseObj['dbName']);

        if (databaseObj['tables']) {
            _.forEach(databaseObj['tables'], function (t, k) {
                sql += Util.format('%s \r\n%s\r\n%s\r\n', '-- ------------------', '-- ' + t['table']['desc'], '-- ------------------');
                sql += Util.format('CREATE TABLE IF NOT EXISTS `%s` (\r\n', t['tablePrefix'] + t['table']['name']);
                if (!t['table']['fields']) {
                    return 0;
                }

                modelList[t['table']['name']] = modelList[t['table']['name']] || {};
                modelList[t['table']['name']].tablePrefix = t['tablePrefix'];

                var auto = null;
                var fieldsSql = [];

                modelList[t['table']['name']].fields = {};

                _.forEach(t['table']['fields'], function (f, k) {
                    var tempSql = "";
                    if (f['autoincr']) {
                        auto = f['start'] || 1;
                    }
                    if (f['name']) {
                        if (!f['length']) {
                            tempSql += Util.format("\t`%s` %s", f['name'], f['type']);
                        } else {
                            tempSql += Util.format("\t`%s` %s(%s)", f['name'], f['type'], f['length']);
                        }

                        if (f['default']) {
                            tempSql += " NOT NULL";
                            tempSql += " DEFAULT " + f['default'];
                        }
                        if (f['autoincr']) {
                            tempSql += ' AUTO_INCREMENT';
                        }
                        if (f['comment']) {
                            tempSql += ' COMMENT ' + "'" + f['comment'] + "'";
                        }
                        fieldsSql.push(tempSql);

                        if (f['default']) {
                            modelList[t['table']['name']].fields[f['name']] = f['default'];
                        } else {
                            if (f['type'].toLowerCase() == 'varchar' || f['type'].toLowerCase() == 'char') {
                                modelList[t['table']['name']].fields[f['name']] = '';
                            } else {
                                modelList[t['table']['name']].fields[f['name']] = 0;
                            }
                        }
                    }
                });

                if (fieldsSql.length) {
                    sql += fieldsSql.join(",\r\n");
                }

                var indexSQL = [];
                if (t['table']['indexs']) {
                    _.forEach(t['table']['indexs'], function (i, k) {
                        var tempSql = "";
                        var type = i['type'].toUpperCase();
                        if (type == 'PRIMARY KEY') {

                            modelList[t['table']['name']].pk = i['field'];//记录唯一索引

                            tempSql += '\tPRIMARY KEY (' + i['field'] + ')'
                        } else if (type == 'KEY' || type == 'UNIQUE KEY') {
                            var keyFields = i['field'].split(",");

                            tempSql += Util.format("\t%s `%s`(", type, i['name']);

                            var tempKeys = [];
                            _.forEach(keyFields, function (v, k) {
                                tempKeys.push(Util.format("`%s`", v));
                            });
                            tempSql += tempKeys.join(",");
                            tempSql += ") USING " + (i['using'] || 'BTREE');
                        }
                        indexSQL.push(tempSql);
                    });
                }
                if (indexSQL.length) {
                    sql += ",\r\n";
                    sql += indexSQL.join(",\r\n");
                }

                sql += "\r\n)";
                if (t['table']['engine']) {
                    sql += 'ENGINE=' + (t['engine'] || 'InnoDB');
                }
                if (auto) {
                    sql += ' AUTO_INCREMENT=' + auto;
                }
                if (t['table']['row_format']) {
                    sql += ' ROW_FORMAT=' + t['table']['row_format'];
                }
                if (t['table']['key_block_size']) {
                    sql += ' KEY_BLOCK_SIZE=' + t['table']['key_block_size'];
                }
                if (t['table']['charset']) {
                    sql += ' DEFAULT CHARSET=' + t['table']['charset'];
                }

                sql += ";\r\n\r\n";
            });
        }

        callback(null, sql, modelList);
    } else {
        callback("xml format error");
    }
}


function parseTables(tables, databaseObj) {
    _.forEach(tables, function (t, k) {
        var tablePrefix = t['$']['tablePrefix'];
        var table = t['table'];

        if (!table) {
            return 0;
        }
        if (!_.isArray(table)) {
            table = [table];
        }
        parseFields(tablePrefix, table, databaseObj);
    });
}

function parseFields(tablePrefix, table, databaseObj) {
    _.forEach(table, function (t, k) {
        var tt = {
            tablePrefix: tablePrefix,
            table: {}
        };

        if (!t['$']['name']) {
            return 0;
        }

        tt.table.name = t['$']['name'];

        if (t['$']['engine']) {
            tt.table.engine = t['$']['engine'];
        }
        if (t['$']['charset']) {
            tt.table.charset = t['$']['charset'];
        }

        if (t['$']['desc']) {
            tt.table.desc = t['$']['desc'];
        }

        if (t['$']['row_format']) {
            tt.table.row_format = t['$']['row_format'];
        }
        if (t['$']['key_block_size']) {
            tt.table.key_block_size = t['$']['key_block_size'];
        }

        var fields = t['field'];
        if (!fields) {
            return 0;
        }
        if (!_.isArray(fields)) {
            fields = [fields];
        }

        tt.table.fields = [];
        parseField(tt, fields);

        if (t['index']) {
            var indexs = t['index'];
            if (!_.isArray(t['index'])) {
                indexs = [t['index']];
            }
            tt.table.indexs = [];
            parseIndex(tt, indexs);
        }

        databaseObj.tables.push(tt);
    });
}

function parseIndex(tt, indexs) {
    _.forEach(indexs, function (i, k) {
        var $ = i['$'];
        tt.table.indexs.push($);
    });
}

function parseField(tt, fields) {
    _.forEach(fields, function (f, k) {
        var $ = f['$'];
        tt.table.fields.push($);
    });
}

module.exports = MysqlRedisCache;


//var Path = require("path");
//var m = new MysqlRedisCache(Path.join(__dirname, "/template/db.xml"), Path.join(__dirname, "/template"),function () {
//
//});



