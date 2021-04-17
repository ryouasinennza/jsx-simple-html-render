"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

require('@babel/register');

var fs = require('fs-extra');

var chalk = require('chalk');

var _require = require('./JSXDependencyTree'),
    JSXDependencyTree = _require.JSXDependencyTree;

var Hook = require('console-hook');

var chokidar = require('chokidar');

var root = require('app-root-path');

var ConvertJSXToHTML = /*#__PURE__*/function () {
  function ConvertJSXToHTML(_ref) {
    var src = _ref.src,
        dist = _ref.dist,
        output = _ref.output,
        watch = _ref.watch,
        dev = _ref.dev;

    _classCallCheck(this, ConvertJSXToHTML);

    this.dev = dev;
    this.src = this.makePath(src);
    this.dist = dist;
    this.output = this.makePath(output);
    this.DTI = new JSXDependencyTree(this.src);
    this.exportHTML(this.DTI.tree);

    if (watch) {
      this.watch();
    }
  }

  _createClass(ConvertJSXToHTML, [{
    key: "watch",
    value: function watch() {
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
    }
  }, {
    key: "makePath",
    value: function makePath(path) {
      var replacePath = path;

      if (replacePath.match(/\/$/)) {
        replacePath = replacePath.replace(/\/$/, '');
      }

      if (replacePath.match(/^\//)) {
        replacePath = replacePath.replace(/^\//, '');
      }

      return "".concat(root, "/").concat(replacePath, "/");
    }
  }, {
    key: "getOutputPath",
    value: function getOutputPath(target) {
      return target.replace(this.src, this.output).replace(/\.jsx/, '.html');
    }
  }, {
    key: "exportHTML",
    value: function exportHTML(fileNames) {
      console.log(chalk.yellow('> export html'));

      for (var prop in fileNames) {
        if (fileNames.hasOwnProperty(prop)) {
          var outputPath = this.getOutputPath(prop);
          console.log(chalk.blue(outputPath));
          fs.outputFileSync(outputPath, this.getHTML(prop, this.getRelativePath(outputPath)));
        }
      }
    }
  }, {
    key: "getRelativePath",
    value: function getRelativePath(targetPath) {
      var pathArray = targetPath.split('/');
      var pathLength = pathArray.length - pathArray.indexOf(this.dist) - 1;
      var relativePath = '';
      if (pathLength === 1) return relativePath;

      for (var i = 1; i < pathLength; i++) {
        relativePath = "".concat(relativePath, "../");
      }

      return relativePath;
    }
  }, {
    key: "errorHook",
    value: function errorHook() {
      return Hook().attach(function (method, args) {
        if (method.match(/(error|wran)/)) {
          throw "".concat(Object.entries(args).map(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                value = _ref3[1];

            return value;
          }).join());
        }
      });
    }
  }, {
    key: "getHTML",
    value: function getHTML(targetPath, relativePath) {
      var env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        var ReactDOMServer = require('react-dom/server');

        var errorHook = this.errorHook();

        var JSX = require(targetPath);

        var htmlMin = "<!DOCTYPE html>".concat(ReactDOMServer.renderToStaticMarkup(JSX["default"]({
          relativePath: relativePath
        })));
        errorHook.detach();
        return htmlMin.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/charSet=/g, 'charset=').replace(/frameBorder=/g, 'frameborder=').replace(/replaceonclick/g, 'onclick').replace(/replacehistory/g, 'href').replace(/hrefLang/g, 'hreflang').replace(/colSpan/g, 'colspan').replace(/&#x27;/g, "'").replace(/replacechecked/g, 'checked').replace(/replacedataytid/g, 'data-ytMovieId').replace(/replacedatayttype/g, 'data-ytMovieType').replace(/async=""/g, 'async');
      } catch (e) {
        console.log('\n', e);

        if (this.dev) {
          return 'Error';
        }

        throw '';
      } finally {
        process.env.NODE_ENV = env;
      }
    }
  }, {
    key: "apply",
    value: function apply(compiler) {}
  }]);

  return ConvertJSXToHTML;
}();

module.exports = ConvertJSXToHTML;
