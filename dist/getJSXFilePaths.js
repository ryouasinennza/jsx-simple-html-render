"use strict";
var readdirSync = require('fs-extra').readdirSync;
module.exports = function (root, returnObj) {
    var files = returnObj ? {} : [];
    var readDir = function (dirArray, prefix) {
        prefix = prefix ? prefix + "/" : '';
        for (var i = 0; i < dirArray.length; i++) {
            if (!!dirArray[i].match(/\.(js|jsx)$/)) {
                if (dirArray[i].match(/\.jsx$/)) {
                    var path = "" + root + prefix + dirArray[i];
                    if (returnObj) {
                        files["" + path] = [];
                    }
                    else {
                        files.push(path);
                    }
                }
            }
            else {
                var recursionDir = readdirSync("" + root + prefix + dirArray[i]);
                readDir(recursionDir, "" + prefix + dirArray[i]);
            }
        }
    };
    readDir(readdirSync(root), false);
    return files;
};
