var Path = require("path");
var ROOT_PATH = Path.join(__dirname,"../");
var FatherDir = "mysqlRedisCache";
var config = {
    fatherDir:FatherDir,
    dist:Path.join(ROOT_PATH,"./codeBuild/",FatherDir),
    jsPathList:[
       
    ],
    jsFileList:[
        {
            path: ROOT_PATH + "\\" + "app.js",
            name: "app.js"
        },
		{
			path: ROOT_PATH + "\\" + "cache.js",
			name: "cache.js"
		},
		{
			path: ROOT_PATH + "\\" + "model.js",
			name: "model.js"
		}
    ],
    htmlPathList : [
        
    ],
    htmlExcludeFiles: [
        
    ],
    copyExcludeDir:[
       
    ],
    copyExcludeFiles:[
       
    ]
};

module.exports = config;