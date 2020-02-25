/**
 * @description:图片压缩、缩放处理，支持链式调用
 */
export default class ImageOperate {
    // 记录初始数据
    originResult = '';

    // canvas
    canvas = null;

    context = null;

    // 文件大小
    size = 0;


    file = null;

    // 图片质量
    quality = 1;

    // 图片缩放比例
    scaleRatio = 1;

    // 缩放事件队列
    scaleQueue = [];


    constructor(file) {
        if (!this.checkOption(file)) return;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.file = file;
    }

    // eslint-disable-next-line class-methods-use-this
    async getFileReader(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                let image = new Image(); // 新建一个img标签（不嵌入DOM节点，仅做canvas操作)
                image.src = e.target.result;
                // this.originResult = e.target.result;
                // 图片加载完毕后再通过canvas压缩图片，否则图片还没加载完就压缩，结果图片是全黑的
                image.onload = () => {
                    resolve({
                        image,
                    });
                };
            };
            reader.onerror = (err) => {
                console.error(err);
            };
        });
    }

    // eslint-disable-next-line class-methods-use-this
    checkOption(file) {
        if (Object.prototype.toString.call(file) !== '[object File]') {
            console.error('必须传入要处理的file，类型为File对象');
            return false;
        }
        if (typeof FileReader === 'undefined') {
            console.error('您的浏览器不支持FileReader对象，无法使用该组件');
            return false;
        }
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    getSize(base64Str) {
        let len = base64Str.substring(22).replace(/=/g, '').length;
        return Math.floor(len - (len / 8) * 2);
    }

    getCanvasData(width = 0, height = 0, quality = 1) {
        const { canvas, context, image } = this;
        canvas.width = width; // 设置绘图的宽度
        canvas.height = height; // 设置绘图的高度
        context.drawImage(image, 0, 0, width, height);

        return canvas.toDataURL('image/jpeg', quality);
    }

    compress(quality = 1) {
        if (!quality) return;
        this.quality *= quality;
        // eslint-disable-next-line consistent-return
        return this;
    }

    // 只支持等比缩放
    scale({ width = 0, height = 0 }) {
        this.scaleQueue.push([width, height]);
        return this;
    }

    draw(image, width, height) {
        const { canvas, context } = this;
        canvas.width = width; // 设置绘图的宽度
        canvas.height = height; // 设置绘图的高度
        context.drawImage(image, 0, 0, width, height);
    }

    async toData(type = 2) { // type 输出数据类型 1：base64  2：file文件
        const { image } = await this.getFileReader(this.file);
        let { width } = image;
        let { height } = image;
        if (this.scaleQueue.length) {
            this.scaleRatio = this.scaleQueue.reduce((result, item) => {
                return result * Math.min(item[0] / width, item[1] / height);
            }, 1);
        }

        this.draw(image, width * this.scaleRatio, height * this.scaleRatio);

        if (type === 1) {
            const result = this.canvas.toDataURL('image/jpeg', this.quality);
            return {
                data: result,
                size: this.getSize(result),
            };
        }
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                blob.lastModifiedDate = new Date();
                blob.name = this.file.name;
                resolve({
                    data: blob,
                    size: blob.size,
                });
            }, 'image/jpeg');
        });
    }
}

