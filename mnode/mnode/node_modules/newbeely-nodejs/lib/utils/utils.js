/**
 * @filename Utils
 *
 * @module Utils
 *
 * @author Gandalfull <orientcountry@gmail.com>
 * @version 1
 * @time 2016-02-19 10:03
 */
var __ = require('underscore');

/**
 * 128 进制编码查询表(中文字典)
 * @type {string[]}
 */
var Key128Maps = [
    ["干", "轻", "枫", "箔", "朝"], ["袍", "俭", "续", "先", "曾"], ["马", "灰", "益", "舫", "蝴"], ["鸟", "畤", "惘", "残", "浮"],
    ["属", "两", "太", "桥", "巧"], ["辜", "安", "赤", "枪", "蝙"], ["压", "慢", "不", "正", "座"], ["凝", "野", "低", "一", "未"],
    ["裙", "回", "节", "双", "裳"], ["唯", "静", "漫", "径", "以"], ["主", "下", "住", "悲", "帝"], ["觉", "到", "杜", "星", "耳"],
    ["数", "在", "同", "四", "表"], ["过", "犹", "河", "蚕", "牛"], ["扇", "罢", "汉", "沧", "秋"], ["世", "捻", "弹", "始", "眉"],
    ["院", "霓", "落", "立", "堆"], ["谪", "像", "谁", "铺", "饱"], ["复", "飘", "幺", "云", "发"], ["负", "唧", "逢", "家", "将"],
    ["殷", "抑", "借", "作", "与"], ["嫁", "僻", "教", "珠", "模"], ["收", "利", "仙", "信", "拂"], ["杂", "色", "六", "欲", "良"],
    ["肉", "舟", "违", "促", "头"], ["炬", "衾", "蕉", "钿", "饮"], ["把", "深", "闻", "栀", "上"], ["听", "彩", "妇", "高", "从"],
    ["底", "手", "血", "酒", "商"], ["玉", "日", "见", "忽", "阶"], ["瑟", "乍", "茫", "陵", "舞"], ["叶", "靰", "溪", "追", "争"],
    ["珰", "夸", "旦", "芭", "急"], ["呕", "心", "买", "阑", "青"], ["壁", "拨", "卧", "端", "偷"], ["铁", "昏", "错", "冷", "船"],
    ["浆", "百", "更", "涩", "妆"], ["今", "涯", "居", "烟", "峰"], ["石", "车", "二", "十", "万"], ["庄", "击", "婿", "肥", "爱"],
    ["娇", "却", "柱", "道", "泣"], ["滩", "缠", "镜", "险", "举"], ["知", "难", "阳", "后", "猿"], ["瘦", "此", "其", "敛", "多"],
    ["轮", "子", "如", "呼", "井"], ["火", "白", "入", "依", "言"], ["屏", "旁", "他", "明", "羹"], ["照", "腊", "枥", "牵", "央"],
    ["方", "独", "苏", "莫", "寻"], ["骑", "束", "北", "远", "哉"], ["勤", "岁", "链", "五", "京"], ["琶", "整", "移", "伤", "女"],
    ["寒", "忘", "幽", "咸", "由"], ["渐", "笑", "取", "久", "娘"], ["踏", "切", "愁", "瓶", "管"], ["宅", "怅", "西", "往", "清"],
    ["岸", "赐", "暂", "司", "乐"], ["局", "口", "楼", "抱", "嘲"], ["常", "水", "凤", "病", "浸"], ["通", "荦", "嘈", "敢", "袷"],
    ["消", "隔", "客", "学", "蟆"], ["已", "雨", "梦", "月", "升"], ["无", "相", "亦", "顿", "床"], ["迟", "秦", "去", "掩", "苦"],
    ["暖", "达", "蛤", "还", "州"], ["烂", "第", "浔", "田", "限"], ["转", "私", "碎", "才", "惨"], ["欢", "渔", "问", "烛", "力"],
    ["为", "飞", "锦", "乡", "得"], ["绕", "息", "起", "污", "抹"], ["关", "你", "置", "寥", "别"], ["微", "待", "围", "早", "中"],
    ["识", "茶", "思", "暮", "感"], ["行", "祠", "散", "织", "花"], ["刀", "说", "松", "鸣", "矾"], ["自", "添", "拟", "银", "凉"],
    ["妒", "疏", "邀", "扉", "开"], ["坐", "岭", "岂", "本", "竹"], ["光", "恨", "风", "少", "殿"], ["只", "每", "忆", "因", "吟"],
    ["蝠", "雁", "斗", "画", "宠"], ["哳", "间", "东", "天", "醉"], ["初", "衣", "吹", "部", "君"], ["小", "灯", "迸", "服", "宴"],
    ["承", "迢", "激", "故", "帛"], ["沦", "丝", "扑", "莱", "胜"], ["龟", "空", "坊", "武", "地"], ["然", "但", "晴", "辞", "缄"],
    ["成", "停", "驿", "来", "啼"], ["香", "看", "皆", "梁", "挑"], ["当", "山", "守", "桃", "篦"], ["稀", "歇", "芦", "舱", "沉"],
    ["声", "哑", "哀", "登", "古"], ["长", "破", "时", "峣", "媒"], ["老", "枕", "处", "歌", "名"], ["语", "蓝", "荻", "凄", "容"],
    ["出", "阿", "虫", "虾", "门"], ["翻", "暗", "饭", "蓬", "夜"], ["调", "连", "怜", "曲", "弟"], ["黄", "放", "何", "三", "归"],
    ["童", "情", "至", "强", "所"], ["我", "怕", "晓", "千", "绝"], ["音", "金", "必", "嗟", "被"], ["畔", "绮", "军", "削", "悄"],
    ["善", "颜", "莺", "泪", "随"], ["边", "叹", "针", "格", "又"], ["佛", "足", "席", "胖", "线"], ["确", "有", "村", "望", "遮"],
    ["指", "儿", "者", "排", "意"], ["探", "满", "拢", "性", "弦"], ["闲", "送", "死", "滑", "僧"], ["湓", "新", "罗", "碧", "外"],
    ["蝶", "宵", "堂", "话", "尽"], ["前", "华", "吾", "穷", "露"], ["改", "晚", "好", "鹃", "红"], ["帘", "札", "泉", "是", "倾"],
    ["路", "诉", "最", "饥", "裂"], ["终", "托", "向", "插", "重"], ["迷", "应", "霏", "琵", "度"], ["流", "姨", "盘", "党", "唤"],
    ["面", "洞", "可", "纷", "半"], ["咽", "萤", "平", "江", "城"], ["年", "鬓", "衫", "等", "昨"], ["事", "湿", "俯", "突", "物"],
    ["里", "春", "掌", "志", "涧"], ["轴", "走", "梳", "海", "笛"], ["似", "近", "共", "人", "生"], ["寺", "大", "隐", "离", "粝"]
]

/**
 * 64 进制编码查询表
 * @type {string[]}
 */
var Key64Maps = [
    ['Y'], ['i'], ['*'], ['q'], ['t'], ['L'],
    ['F'], ['A'], ['f'], ['x'], ['W'], ['7'],
    ['J'], ['l'], ['a'], ['3'], ['H'], ['Z'],
    ['5'], ['E'], ['s'], ['m'], ['U'], ['b'],
    ['S'], ['c'], ['p'], ['d'], ['g'], ['C'],
    ['n'], ['P'], ['k'], ['N'], ['6'], ['e'],
    ['r'], ['y'], ['R'], ['8'], ['G'], ['4'],
    ['z'], ['@'], ['0'], ['K'], ['u'], ['2'],
    ['h'], ['M'], ['9'], ['w'], ['X'], ['j'],
    ['V'], ['I'], ['Q'], ['o'], ['T'], ['v'],
    ['B'], ['D'], ['1'], ['O']
];

/**
 * 32 进制编码查询表
 * @type {string[]}
 */
var Key32Maps = [
    ['Y', 'i'], ['*', 'q'], ['t', 'L'],
    ['F', 'A'], ['f', 'x'], ['W', '7'],
    ['J', 'l'], ['a', '3'], ['H', 'Z'],
    ['5', 'E'], ['s', 'm'], ['U', 'b'],
    ['S', 'c'], ['p', 'd'], ['g', 'C'],
    ['n', 'P'], ['k', 'N'], ['6', 'e'],
    ['r', 'y'], ['R', '8'], ['G', '4'],
    ['z', '@'], ['0', 'K'], ['u', '2'],
    ['h', 'M'], ['9', 'w'], ['X', 'j'],
    ['V', 'I'], ['Q', 'o'], ['T', 'v'],
    ['B', 'D'], ['1', 'O']
];

/**
 * 16进制 映射表
 *
 * @type {*[]}
 */
var Key16Maps = [
    ['Y', 'i', 'q'], ['t', 'L', 'F', 'A'], ['f', 'x', 'W', '7'],
    ['J', 'a', '3'], ['H', 'Z', '5', 'E'], ['s', 'm', 'U', 'b'],
    ['S', 'c', 'p', 'd'], ['g', 'C', 'n', 'P'], ['k', 'N', '6', 'e'],
    ['r', 'y', 'R', '8'], ['G', '4', 'z'], ['K', 'u', '2'],
    ['h', 'M', '9', 'w'], ['X', 'j', 'V', 'I'], ['Q', 'T', 'v'],
    ['B', 'D']
];

/**
 * 参考时间
 * @type {number}
 */
var RefDate = new Date("2016-01-01 00:00:00").getTime();

/**
 * 常用方法工具集
 *
 * @class Utils
 * @constructor
 */
function Utils() {

}

var SupportModel = [
    128, 64, 32, 16
];
var Mark = {
    128: {
        bits: 7,
        mask: 0x7f,
        maps: Key128Maps
    },
    64: {
        bits: 6,
        mask: 0x3f,
        maps: Key64Maps
    },
    32: {
        bits: 5,
        mask: 0x1f,
        maps: Key32Maps
    },
    16: {
        bits: 4,
        mask: 0x0f,
        maps: Key16Maps
    }
};

/**
 * 生成唯一的字符串
 * 根据时间算法生成
 *
 * @method uniqueString
 * @param variances
 * @param model 16 or 64 default 16
 * @returns {string}
 */
Utils.prototype.uniqueString = function (variances, model) {
    model = SupportModel.indexOf(model) == -1 ? 16 : model;
    var info = Mark[model];
    variances = Math.floor(variances);
    var value = Date.now() - RefDate;
    value = ((value << 8) >>> 1) + variances;
    var retValue = [];
    while (value > 0) {
        retValue.unshift(__.sample(__.shuffle(info.maps)[value & info.mask]));
        if (value > 0xffffffff) {
            value = value >> info.bits >>> 1;
        } else {
            value = value >> info.bits;
        }
    }
    return retValue.join("");
}

/**
 * 安全调用方法
 * @param cb
 */
Utils.prototype.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * 从数组内随机一个元素
 *
 * @method random
 * @param array
 * @returns {*}
 */
Utils.prototype.random = function (array) {
    if (!array.length) {
        return null;
    }
    if (typeof array[0].weight !== 'number') {
        return __.sample(array);
    }
    var weight = 0;
    for (var i = 0; i < array.length; i++) {
        weight += array[i].weight;
    }
    var ran = Math.floor(Math.random() * 100000) % weight;
    var tmp = 0;
    for (var i = 0; i < array.length; i++) {
        tmp += array[i].weight;
        if (tmp >= ran) {
            return array[i];
        }
    }
    return null;
}

/**
 * 计算一个对象内的变量数量
 *
 * @method size
 * @for Utils
 * @param JSON obj
 * @returns {Number}
 */
Utils.prototype.size = function (obj) {
    var count = 0;
    for (var i in obj) {
        if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
            count++;
        }
    }
    return count;
};
/**
 * 检测两个数组是否相同
 *
 * @method arrayDiff
 * @for Utils
 * @param JSON array1
 * @param JSON array2
 * @returns {boolean}
 */
Utils.prototype.arrayDiff = function (array1, array2) {
    var o = {};
    for (var i = 0, len = array2.length; i < len; i++) {
        o[array2[i]] = true;
    }

    var result = [];
    for (i = 0, len = array1.length; i < len; i++) {
        var v = array1[i];
        if (o[v]) continue;
        result.push(v);
    }
    return result;
};

/**
 * 检测字符串内是否包含中文字符
 *
 * @method hasChineseChar
 * @for Utils
 * @param string
 * @returns {boolean}
 */
Utils.prototype.hasChineseChar = function (str) {
    if (/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
        return true;
    } else {
        return false;
    }
};

/**
 * 获取http请求的客户端ip
 *
 * 因为有可能是nginx/负载均衡 转发的 需要判定headers内的字段
 *
 * @method getClientIP
 * @param req
 * @returns {*|Object|string}
 */
Utils.prototype.getClientIP = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.headers['remote-host'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket && req.connection.socket.remoteAddress) ||
        "";
    ip = ip.substring(ip.lastIndexOf(":") + 1, ip.length);
    return ip;
}

/**
 * 判断是否是Ip
 *
 * @method isIp
 * @for Utils
 * @param ipvalue
 * @returns {boolean}
 */
Utils.prototype.ipIp = function isIp(ipvalue) {
    return this.isIPv4(ipvalue) || this.isIPv6(ipvalue);
};


/**
 * 判断是否是Ipv4
 *
 * @method isIPv4
 * @for Utils
 * @param ipvalue
 * @returns {boolean}
 */
Utils.prototype.isIPv4 = function isIPv4(ipvalue) {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return re.test(ipvalue);
};

/**
 * 判断是否是Ipv6
 *
 * @method isIPv6
 * @for Utils
 * @param ipvalue
 * @returns {boolean}
 */
Utils.prototype.isIPv6 = function isIPv6(ipvalue) {
    return ipvalue.match(/:/g).length <= 7 && /::/.test(ipvalue) ? /^([\da-f]{1,4}(:|::)){1,6}[\da-f]{1,4}$/i.test(ipvalue) : /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(ipvalue);
};

module.exports = {
    id: "utils",
    func: Utils
};