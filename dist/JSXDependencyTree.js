"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var fs = require('fs-extra');

var chalk = require('chalk');

var cliProgress = require('cli-progress');

var dependencyTree = require('dependency-tree');

module.exports.JSXDependencyTree = /*#__PURE__*/function () {
  function _class(JSXDirectory) {
    _classCallCheck(this, _class);

    this.tree = {};
    this.JSXDirectory = JSXDirectory;
    this.setTreeAll();
  }

  _createClass(_class, [{
    key: "setTree",
    value: function setTree(targetPath) {
      if (targetPath.match(/\.jsx$/) && !this.tree[targetPath]) {
        this.tree[targetPath] = this.getDependencyTree(targetPath);
        return _defineProperty({}, targetPath, []);
      }
    }
  }, {
    key: "setTreeAll",
    value: function setTreeAll() {
      console.log(chalk.yellow('> Set JSX dependency tree'));
      this.JSXpaths = this.getJSXFilePaths(this.JSXDirectory);
      var bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
      bar.start(this.JSXpaths.length, 1);

      for (var i = 0; i < this.JSXpaths.length; i++) {
        this.tree[this.JSXpaths[i]] = this.getDependencyTree(this.JSXpaths[i]);
        bar.update(i + 1);
      }

      bar.stop();
    }
  }, {
    key: "getJSXFilePaths",
    value: function getJSXFilePaths(root) {
      var files = [];

      var readDir = function readDir(dirArray, prefix) {
        prefix = prefix ? "".concat(prefix, "/") : '';

        for (var i = 0; i < dirArray.length; i++) {
          if (!!dirArray[i].match(/\.(js|jsx)$/)) {
            if (dirArray[i].match(/\.jsx$/)) {
              files.push("".concat(root).concat(prefix).concat(dirArray[i]));
            }
          } else {
            var recursionDir = fs.readdirSync("".concat(root).concat(prefix).concat(dirArray[i]));
            readDir(recursionDir, "".concat(prefix).concat(dirArray[i]));
          }
        }
      };

      readDir(fs.readdirSync(root), false);
      return files;
    }
  }, {
    key: "getDependencyTree",
    value: function getDependencyTree(filename) {
      return dependencyTree.toList({
        filename: filename,
        directory: this.JSXDirectory,
        nodeModulesConfig: {
          entry: 'module'
        },
        filter: function filter(path) {
          return path.indexOf('node_modules') === -1;
        },
        nonExistent: []
      });
    }
  }, {
    key: "findDependencyFiles",
    value: function findDependencyFiles(targetPath) {
      if (targetPath.match(/\.jsx$/)) {
        if (this.tree[targetPath]) {
          this.clearRequireCache(targetPath);
          return _defineProperty({}, targetPath, []);
        } else {
          this.setTreeAll();
          return this.tree;
        }
      } else {
        var JSXPaths = {};

        for (var propJSXPath in this.tree) {
          if (this.tree.hasOwnProperty(propJSXPath)) {
            if (this.tree[propJSXPath].some(function (childrenPath) {
              return childrenPath === targetPath;
            })) {
              this.clearRequireCache(propJSXPath);
              JSXPaths = _objectSpread(_objectSpread({}, JSXPaths), {}, _defineProperty({}, propJSXPath, []));
            }
          }
        }

        return JSXPaths;
      }
    }
  }, {
    key: "clearRequireCache",
    value: function clearRequireCache(JSXPath) {
      delete require.cache[JSXPath];

      for (var i = 0; i < this.tree[JSXPath].length; i++) {
        delete require.cache[this.tree[JSXPath][i]];
      }
    }
  }, {
    key: "removeDependency",
    value: function removeDependency(targetPath) {
      if (targetPath.match(/\.jsx$/)) {
        delete this.tree[targetPath];
      }
    }
  }]);

  return _class;
}();