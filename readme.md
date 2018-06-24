# 安装文档
在HTML文档中直接引用bin目录下的压缩执行文件
```
<html>
    ...
    <script src="path/to/js/flyRender.min.js"></script>
</html>
```

# flyRender使用文档
## 初始化对象
### 简要概述
实例化返回一个flyRender模板引擎对象
### 参数
参数名 | 必选 | 类型 | 说明
----|----|----|---
template | 是 | String | 模板字符串
app | 是 | DOM对象 | 渲染的容器
### 示例
```
    var render = new flyRender({
        template: 'hi, #{name}',
        app: document.getElementById('container')
    })
```
## 首次渲染
### 简要概述
会在初始化传入的渲染容器中进行首次渲染操作
### 方式名
firstPaint
### 参数
参数名 | 必选 | 类型 | 说明
----|----|----|---
data | 是 | Object对象 | 模板数据
### 示例
```
    render.firstPaint({data: {name: 'ailin'}})
```

## 二次渲染
### 简要概述
在调用首次渲染以后的更新都使用二次渲染
### 方式名
patchPaint
### 参数
参数名 | 必选 | 类型 | 说明
----|----|----|---
data | 是 | Object对象 | 模板数据
### 示例
```
    render.patchPaint({data: {name: 'ailin'}})
```