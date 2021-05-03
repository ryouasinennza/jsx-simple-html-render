"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var chalk = require('chalk');
var cliProgress = require('cli-progress');
var dependencyTree = require('dependency-tree');
var getJSXFilePaths = require('./getJSXFilePaths');
var JSXDependencyTree = /** @class */ (function () {
    function JSXDependencyTree(JSXDirectory) {
        this.tree = {};
        this.JSXDirectory = JSXDirectory;
        this.setTreeAll();
    }
    JSXDependencyTree.prototype.setTree = function (targetPath) {
        var _a;
        if (targetPath.match(/\.jsx$/) && !this.tree[targetPath]) {
            this.tree[targetPath] = this.getDependencyTree(targetPath);
            return _a = {}, _a[targetPath] = [], _a;
        }
    };
    JSXDependencyTree.prototype.setTreeAll = function () {
        console.log(chalk.yellow('> set JSX dependency tree'));
        var JSXPaths = getJSXFilePaths(this.JSXDirectory, false);
        var bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(JSXPaths.length, 1);
        for (var i = 0; i < JSXPaths.length; i++) {
            this.tree[JSXPaths[i]] = this.getDependencyTree(JSXPaths[i]);
            bar.update(i + 1);
        }
        bar.stop();
    };
    JSXDependencyTree.prototype.getDependencyTree = function (filename) {
        return dependencyTree.toList({
            filename: filename,
            directory: this.JSXDirectory,
            nodeModulesConfig: {
                entry: 'module'
            },
            filter: function (path) { return path.indexOf('node_modules') === -1; },
            nonExistent: []
        });
    };
    JSXDependencyTree.prototype.findDependencyFiles = function (targetPath) {
        var _a, _b;
        if (targetPath.match(/\.jsx$/)) {
            if (this.tree[targetPath]) {
                this.clearRequireCache(targetPath);
                return _a = {}, _a[targetPath] = [], _a;
            }
            else {
                this.setTreeAll();
                return this.tree;
            }
        }
        else {
            var JSXPaths = {};
            for (var propJSXPath in this.tree) {
                if (this.tree.hasOwnProperty(propJSXPath)) {
                    if (this.tree[propJSXPath].some(function (childrenPath) { return childrenPath === targetPath; })) {
                        this.clearRequireCache(propJSXPath);
                        JSXPaths = __assign(__assign({}, JSXPaths), (_b = {}, _b[propJSXPath] = [], _b));
                    }
                }
            }
            return JSXPaths;
        }
    };
    JSXDependencyTree.prototype.clearRequireCache = function (JSXPath) {
        delete require.cache[JSXPath];
        for (var i = 0; i < this.tree[JSXPath].length; i++) {
            delete require.cache[this.tree[JSXPath][i]];
        }
    };
    JSXDependencyTree.prototype.removeDependency = function (targetPath) {
        if (targetPath.match(/\.jsx$/)) {
            delete this.tree[targetPath];
        }
    };
    return JSXDependencyTree;
}());
module.exports = JSXDependencyTree;
