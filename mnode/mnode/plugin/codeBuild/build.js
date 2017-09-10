var UglifyJS = require('uglify-js');
var Path = require("path");
var FileUtil = require("./fileUtil");
var Async = require("async");
var config = require("./config");

var ROOT_PATH = Path.join(__dirname,"../");

var DistPath = config.dist;
if (FileUtil.isDirectory(DistPath)) {
    FileUtil.deleteFolderRecursive(DistPath,false);
}
FileUtil.createDirectory(DistPath);

var fatherDir = config.fatherDir;

/*******************JS 压缩混淆************************************/
var jsPathList = config.jsPathList;

var jsFileList = config.jsFileList;

var FileList = [];
FileList = FileList.concat(jsFileList);

Async.each(jsPathList, function (item, cb) {
    var p = FileUtil.traverseSync(Path.join(ROOT_PATH, "./" + item));
    FileList = FileList.concat(p);
    cb();
}, function (err, resp) {
    for (var i = 0; i < FileList.length; i++) {
        var f = FileList[i].path;
        f = f.replace(/\\/g, "/");
        f = f.replace(/\/\//g, "/");

        var oPath = f.split("/");
        var fatherIndex = oPath.indexOf(fatherDir);
        if (fatherIndex !== -1) {
            var curPath = DistPath;
            for (var j = fatherIndex + 1; j < oPath.length - 1; j++) {
                curPath = curPath + "\\" + oPath[j];
                if (!FileUtil.isDirectory(curPath)) {
                    FileUtil.createDirectory(curPath);
                }
            }
            console.log("正在处理js文件 " + f);
            var result = UglifyJS.minify(FileUtil.readSync(f));
            FileUtil.writeSync(curPath + "\\" + FileList[i].name, result.code);
        }
    }
});

//
// /***********************html 压缩混淆********************************/
FileList = [];
var HtmlMinify = require('html-minifier').minify;
var HtmlPathList = config.htmlPathList;

var ExcludeFiles = config.htmlExcludeFiles;
for(var i=0;i<ExcludeFiles.length;i++){
    ExcludeFiles[i] = ExcludeFiles[i].replace(/\\/g,"/");
}

Async.each(HtmlPathList, function (item, cb) {
    var p = FileUtil.traverseSync(Path.join(ROOT_PATH, "./" + item));
    FileList = FileList.concat(p);
    cb();
}, function (err, resp) {
    for (var i = 0; i < FileList.length; i++) {
        var f = FileList[i].path;

        f = f.replace(/\\/g, "/");
        f = f.replace(/\/\//g, "/");

        var oPath = f.split("/");
        var fatherIndex = oPath.indexOf(fatherDir);
        if (fatherIndex !== -1) {
            var curPath = DistPath;
            for (var j = fatherIndex + 1; j < oPath.length - 1; j++) {
                curPath = curPath + "/" + oPath[j];
                if (!FileUtil.isDirectory(curPath)) {
                    FileUtil.createDirectory(curPath);
                }
            }
            if (ExcludeFiles.indexOf(f) !== -1) {
                FileUtil.writeSync(curPath + "/" + FileList[i].name, FileUtil.readSync(f));
            } else {
                console.log("正在处理html文件 " + f);
                var result = HtmlMinify(FileUtil.readSync(f), {
                    caseSensitive: false,
                    removeComments: false,
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS: true
                });
                FileUtil.writeSync(curPath + "\\" + FileList[i].name, result);
            }
        }
    }
});

/************************拷贝代码********************************/
var copyExcludeDir = config.copyExcludeDir.concat(jsPathList).concat(HtmlPathList);

var copyExcludeFiles = config.copyExcludeFiles.concat(ExcludeFiles);

for(var i=0;i<copyExcludeFiles.length;i++){
    copyExcludeFiles[i] = copyExcludeFiles[i].replace(/\\/g,"/");
}

var files = FileUtil.traverseSync(Path.join(ROOT_PATH,"./"));
Async.each(files,function(file,cb){
    var f = file.path;

    f = f.replace(/\\/g, "/");
    f = f.replace(/\/\//g, "/");

    if(copyExcludeFiles.indexOf(f) !== -1){
        cb(null);
    }else{
        var oPath = f.split("/");
        var fatherIndex = oPath.indexOf(fatherDir);
        if (fatherIndex !== -1) {
            var curPath = DistPath;
            var status = true;

            var pathMerge = "";
            for (var j = fatherIndex + 1; j < oPath.length - 1; j++) {
                curPath = curPath + "/" + oPath[j];
                if(pathMerge !== ""){
                    pathMerge += ("/"+oPath[j]);
                }else{
                    pathMerge += oPath[j];
                }

                if (copyExcludeDir.indexOf(pathMerge) !== -1) {
                    status = false;
                    break;
                }
                if (!FileUtil.isDirectory(curPath)) {
                    FileUtil.createDirectory(curPath);
                }
            }
            if(status){
                console.log("正在拷贝 "+f);
                if(FileUtil.isAssets(f)){
                    FileUtil.writeAsync(Path.resolve(curPath + "\\" + file.name),FileUtil.readSync(f,'binary'),function(){
                        cb(null);
                    },'binary');
                }else{
                    if(/.*gameConfig/.test(f)){
                        FileUtil.copy(f,Path.resolve(curPath + "\\" + file.name));
                    }else{
                        FileUtil.writeSync(Path.resolve(curPath + "\\" + file.name), FileUtil.readSync(f));
                    }
                    cb(null);
                }
            }else{
                cb(null);
            }
        }else{
            cb(null);
        }
    }
},function(err,resp){
    console.log("拷贝完成...");
});

