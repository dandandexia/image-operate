# 图片处理类
## 简介
支持图片上传前的图片等比缩放、压缩（有损压缩），支持链式调用，支出输出格式为file和base64的两种格式
```
import ImageOperate from './src/index.js

const imageOperate = new ImageOperate(file);
```

## 方法
+ compress(quality)
同步函数，支持链式调用
quality:图片质量 
+ scale(width, height)
同步函数，支持链式调用
会根据参数值做同比压缩放大，不会裁剪拉升图片
+ toData(type)
异步函数，不支持链式调用
type: 输出类型，1：输出base64格式数据    2：输出file格式数据


## 属性
+ quality
压缩质量，可手动设置后使用toData方法

+ scaleRatio 
伸缩比例，可手动设置后使用toData方法

