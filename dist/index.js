"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @description:图片压缩、缩放处理，支持链式调用
 */
var ImageOperate =
/*#__PURE__*/
function () {
  // 记录初始数据
  // canvas
  // 文件大小
  // 图片质量
  // 图片缩放比例
  // 缩放事件队列
  function ImageOperate(file) {
    _classCallCheck(this, ImageOperate);

    _defineProperty(this, "originResult", '');

    _defineProperty(this, "canvas", null);

    _defineProperty(this, "context", null);

    _defineProperty(this, "size", 0);

    _defineProperty(this, "file", null);

    _defineProperty(this, "quality", 1);

    _defineProperty(this, "scaleRatio", 1);

    _defineProperty(this, "scaleQueue", []);

    if (!this.checkOption(file)) return;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.file = file;
  } // eslint-disable-next-line class-methods-use-this


  _createClass(ImageOperate, [{
    key: "getFileReader",
    value: async function getFileReader(file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function (e) {
          var image = new Image(); // 新建一个img标签（不嵌入DOM节点，仅做canvas操作)

          image.src = e.target.result; // this.originResult = e.target.result;
          // 图片加载完毕后再通过canvas压缩图片，否则图片还没加载完就压缩，结果图片是全黑的

          image.onload = function () {
            resolve({
              image: image
            });
          };
        };

        reader.onerror = function (err) {
          console.error(err);
        };
      });
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "checkOption",
    value: function checkOption(file) {
      if (Object.prototype.toString.call(file) !== '[object File]') {
        console.error('必须传入要处理的file，类型为File对象');
        return false;
      }

      if (typeof FileReader === 'undefined') {
        console.error('您的浏览器不支持FileReader对象，无法使用该组件');
        return false;
      }

      return true;
    } // eslint-disable-next-line class-methods-use-this

  }, {
    key: "getSize",
    value: function getSize(base64Str) {
      var len = base64Str.substring(22).replace(/=/g, '').length;
      return Math.floor(len - len / 8 * 2);
    }
  }, {
    key: "getCanvasData",
    value: function getCanvasData() {
      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var quality = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var canvas = this.canvas,
          context = this.context,
          image = this.image;
      canvas.width = width; // 设置绘图的宽度

      canvas.height = height; // 设置绘图的高度

      context.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', quality);
    }
  }, {
    key: "compress",
    value: function compress() {
      var quality = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      if (!quality) return;
      this.quality *= quality; // eslint-disable-next-line consistent-return

      return this;
    } // 只支持等比缩放

  }, {
    key: "scale",
    value: function scale(_ref) {
      var _ref$width = _ref.width,
          width = _ref$width === void 0 ? 0 : _ref$width,
          _ref$height = _ref.height,
          height = _ref$height === void 0 ? 0 : _ref$height;
      this.scaleQueue.push([width, height]);
      return this;
    }
  }, {
    key: "draw",
    value: function draw(image, width, height) {
      var canvas = this.canvas,
          context = this.context;
      canvas.width = width; // 设置绘图的宽度

      canvas.height = height; // 设置绘图的高度

      context.drawImage(image, 0, 0, width, height);
    }
  }, {
    key: "toData",
    value: async function toData() {
      var _this = this;

      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

      // type 输出数据类型 1：base64  2：file文件
      var _ref2 = await this.getFileReader(this.file),
          image = _ref2.image;

      var width = image.width;
      var height = image.height;

      if (this.scaleQueue.length) {
        this.scaleRadio = this.scaleQueue.reduce(function (result, item) {
          return result * Math.min(item[0] / width, item[1] / height);
        }, 1);
      }

      this.draw(image, width * this.scaleRadio, height * this.scaleRadio);

      if (type === 1) {
        var result = this.canvas.toDataURL('image/jpeg', this.quality);
        return {
          data: result,
          size: this.getSize(result)
        };
      }

      return new Promise(function (resolve, reject) {
        _this.canvas.toBlob(function (blob) {
          blob.lastModifiedDate = new Date();
          blob.name = _this.file.name;
          resolve({
            data: blob,
            size: blob.size
          });
        }, 'image/jpeg');
      });
    }
  }]);

  return ImageOperate;
}();

window.ImageOperate = ImageOperate;