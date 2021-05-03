"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
require('@babel/register');
var _a = require('chalk'), yellow = _a.yellow, blue = _a.blue, red = _a.red;
var outputFileSync = require('fs-extra').outputFileSync;
var chokidar = require('chokidar');
var root = require('app-root-path');
var Hook = require('console-hook');
var getFilePaths = require('./getJSXFilePaths');
var jsxDependencyTree = require('./JSXDependencyTree');
var replaceList = require('./replaceList');
var JsxSimpleHtmlRender = /** @class */ (function () {
    function JsxSimpleHtmlRender(_a) {
        var throwFlag = _a.throwFlag, watch = _a.watch, src = _a.src, relativeRoot = _a.relativeRoot, output = _a.output, _b = _a.replace, replace = _b === void 0 ? [] : _b;
        this.replace = replace;
        this.throwFlag = throwFlag;
        this.relativeRoot = relativeRoot;
        this.src = this.makePath(src);
        this.output = this.makePath(output);
        if (watch) {
            this.DTI = new jsxDependencyTree(this.src);
            this.exportHTML(this.DTI.tree);
            this.watch();
        }
        else {
            this.exportHTML(getFilePaths(this.src, true));
        }
    }
    JsxSimpleHtmlRender.prototype.watch = function () {
        var _this = this;
        var watcher = chokidar.watch(this.src, {
            persistent: true
        });
        watcher.on('ready', function () {
            watcher.on('change', function (path) {
                _this.exportHTML(_this.DTI.findDependencyFiles(path));
            });
            watcher.on('add', function (path) {
                _this.exportHTML(_this.DTI.setTree(path));
            });
            watcher.on('unlink', function (path) {
                _this.DTI.removeDependency(path);
            });
        });
    };
    JsxSimpleHtmlRender.prototype.makePath = function (path) {
        var replacePath = path;
        if (replacePath.match(/\/$/)) {
            replacePath = replacePath.replace(/\/$/, '');
        }
        if (replacePath.match(/^\//)) {
            replacePath = replacePath.replace(/^\//, '');
        }
        return root + "/" + replacePath + "/";
    };
    JsxSimpleHtmlRender.prototype.getOutputPath = function (target) {
        return target.replace(this.src, this.output).replace(/\.jsx/, '.html');
    };
    JsxSimpleHtmlRender.prototype.exportHTML = function (fileNames) {
        console.log(yellow('> export html'));
        var env = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        var renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
        var errorHook = this.errorHook();
        for (var jsxPath in fileNames) {
            if (fileNames.hasOwnProperty(jsxPath)) {
                var outputPath = this.getOutputPath(jsxPath);
                outputFileSync(outputPath, this.getHTML(renderToStaticMarkup, jsxPath, this.getRelativePath(outputPath)));
            }
        }
        errorHook.detach();
        process.env.NODE_ENV = env;
    };
    JsxSimpleHtmlRender.prototype.getRelativePath = function (targetPath) {
        var pathArray = targetPath.split('/');
        var pathLength = pathArray.length - pathArray.indexOf(this.relativeRoot) - 1;
        var relativePath = '';
        if (pathLength === 1)
            return relativePath;
        for (var i = 1; i < pathLength; i++) {
            relativePath = relativePath + "../";
        }
        return relativePath;
    };
    JsxSimpleHtmlRender.prototype.errorHook = function () {
        return Hook().attach(function (method, args) {
            if (method.match(/(error|wran)/)) {
                throw "" + Object.entries(args)
                    .map(function (_a) {
                    var value = _a[1];
                    return value;
                })
                    .join();
            }
        });
    };
    JsxSimpleHtmlRender.prototype.getHTML = function (renderToStaticMarkup, targetPath, relativePath) {
        try {
            var htmlMin = renderToStaticMarkup(require(targetPath).default({ relativePath: relativePath }));
            console.log(blue(targetPath));
            return this.codeReplace(htmlMin);
        }
        catch (e) {
            console.log(red(targetPath));
            console.log(red(e));
            if (this.throwFlag) {
                throw '';
            }
            return 'Error';
        }
    };
    JsxSimpleHtmlRender.prototype.codeReplace = function (htmlCode) {
        var code = htmlCode;
        var replace = this.replace.length === 0 ? replaceList : __spreadArray(__spreadArray([], replaceList), this.replace);
        for (var i = 0; i < replace.length; i++) {
            code = code.replace(replace[i].regexp, replace[i].value);
        }
        return code;
    };
    JsxSimpleHtmlRender.prototype.apply = function () { };
    return JsxSimpleHtmlRender;
}());
module.exports = JsxSimpleHtmlRender;
