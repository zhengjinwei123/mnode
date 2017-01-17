var a = {
    "database": {
        "$": {"name": "jade_db", "character": "utf8", "collate": "utf8_general_ci"},
        "tables": [{
            "$": {"tablePrefix": "t_"},
            "table": [{
                "$": {"name": "user", "engine": "InnoDB", "charset": "latin1", "desc": "用户表"},
                "field": [{
                    "$": {
                        "name": "roleid",
                        "type": "bigint",
                        "length": "20",
                        "null": "false",
                        "comment": "唯一ID"
                    }
                }, {
                    "$": {
                        "name": "rolename",
                        "type": "varchar",
                        "length": "32",
                        "null": "false",
                        "default": "",
                        "character": "utf8",
                        "collate": "utf8_bin",
                        "comment": "玩家名"
                    }
                }, {
                    "$": {
                        "name": "create_tm",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "创建时间"
                    }
                }, {
                    "$": {
                        "name": "serverid",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "服ID"
                    }
                }, {
                    "$": {
                        "name": "channelid",
                        "type": "int",
                        "length": "8",
                        "null": "false",
                        "default": "0",
                        "comment": "渠道ID"
                    }
                }, {
                    "$": {
                        "name": "lastupdate",
                        "type": "timestamp",
                        "null": "false",
                        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                        "comment": "最后更新时间"
                    }
                }],
                "index": [{"$": {"type": "PRIMARY KEY", "field": "roleid"}}, {
                    "$": {
                        "type": "KEY",
                        "name": "inx_rolename",
                        "field": "rolename",
                        "using": "BTREE"
                    }
                }, {
                    "$": {
                        "type": "UNIQUE KEY",
                        "name": "uni_serverid_channelid",
                        "field": "serverid,channelid",
                        "using": "BTREE"
                    }
                }]
            }, {
                "$": {"name": "user1", "engine": "InnoDB", "charset": "latin1", "desc": "用户表1"},
                "field": [{
                    "$": {
                        "name": "roleid",
                        "type": "bigint",
                        "length": "20",
                        "null": "false",
                        "comment": "唯一ID"
                    }
                }, {
                    "$": {
                        "name": "rolename",
                        "type": "varchar",
                        "length": "32",
                        "null": "false",
                        "default": "",
                        "character": "utf8",
                        "collate": "utf8_bin",
                        "comment": "玩家名"
                    }
                }, {
                    "$": {
                        "name": "create_tm",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "创建时间"
                    }
                }, {
                    "$": {
                        "name": "serverid",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "服ID"
                    }
                }, {
                    "$": {
                        "name": "channelid",
                        "type": "int",
                        "length": "8",
                        "null": "false",
                        "default": "0",
                        "comment": "渠道ID"
                    }
                }, {
                    "$": {
                        "name": "lastupdate",
                        "type": "timestamp",
                        "null": "false",
                        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                        "comment": "最后更新时间"
                    }
                }],
                "index": [{"$": {"type": "PRIMARY KEY", "field": "roleid"}}, {
                    "$": {
                        "type": "KEY",
                        "name": "inx_rolename",
                        "field": "rolename",
                        "using": "BTREE"
                    }
                }, {
                    "$": {
                        "type": "UNIQUE KEY",
                        "name": "uni_serverid_channelid",
                        "field": "serverid,channelid",
                        "using": "BTREE"
                    }
                }]
            }]
        }, {
            "$": {"tablePrefix": "t1_"},
            "table": [{
                "$": {"name": "user", "engine": "InnoDB", "charset": "latin1", "desc": "用户表"},
                "field": [{
                    "$": {
                        "name": "roleid",
                        "type": "bigint",
                        "length": "20",
                        "null": "false",
                        "comment": "唯一ID"
                    }
                }, {
                    "$": {
                        "name": "rolename",
                        "type": "varchar",
                        "length": "32",
                        "null": "false",
                        "default": "",
                        "character": "utf8",
                        "collate": "utf8_bin",
                        "comment": "玩家名"
                    }
                }, {
                    "$": {
                        "name": "create_tm",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "创建时间"
                    }
                }, {
                    "$": {
                        "name": "serverid",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "服ID"
                    }
                }, {
                    "$": {
                        "name": "channelid",
                        "type": "int",
                        "length": "8",
                        "null": "false",
                        "default": "0",
                        "comment": "渠道ID"
                    }
                }, {
                    "$": {
                        "name": "lastupdate",
                        "type": "timestamp",
                        "null": "false",
                        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                        "comment": "最后更新时间"
                    }
                }],
                "index": [{"$": {"type": "PRIMARY KEY", "field": "roleid"}}, {
                    "$": {
                        "type": "KEY",
                        "name": "inx_rolename",
                        "field": "rolename",
                        "using": "BTREE"
                    }
                }, {
                    "$": {
                        "type": "UNIQUE KEY",
                        "name": "uni_serverid_channelid",
                        "field": "serverid,channelid",
                        "using": "BTREE"
                    }
                }]
            }, {
                "$": {"name": "user1", "engine": "InnoDB", "charset": "latin1", "desc": "用户表1"},
                "field": [{
                    "$": {
                        "name": "roleid",
                        "type": "bigint",
                        "length": "20",
                        "null": "false",
                        "comment": "唯一ID"
                    }
                }, {
                    "$": {
                        "name": "rolename",
                        "type": "varchar",
                        "length": "32",
                        "null": "false",
                        "default": "",
                        "character": "utf8",
                        "collate": "utf8_bin",
                        "comment": "玩家名"
                    }
                }, {
                    "$": {
                        "name": "create_tm",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "创建时间"
                    }
                }, {
                    "$": {
                        "name": "serverid",
                        "type": "int",
                        "length": "10",
                        "null": "false",
                        "default": "0",
                        "comment": "服ID"
                    }
                }, {
                    "$": {
                        "name": "channelid",
                        "type": "int",
                        "length": "8",
                        "null": "false",
                        "default": "0",
                        "comment": "渠道ID"
                    }
                }, {
                    "$": {
                        "name": "lastupdate",
                        "type": "timestamp",
                        "null": "false",
                        "default": "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                        "comment": "最后更新时间"
                    }
                }],
                "index": [{"$": {"type": "PRIMARY KEY", "field": "roleid"}}, {
                    "$": {
                        "type": "KEY",
                        "name": "inx_rolename",
                        "field": "rolename",
                        "using": "BTREE"
                    }
                }, {
                    "$": {
                        "type": "UNIQUE KEY",
                        "name": "uni_serverid_channelid",
                        "field": "serverid,channelid",
                        "using": "BTREE"
                    }
                }]
            }]
        }]
    }
}