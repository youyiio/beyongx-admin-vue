# beyongx-admin-vue

beyongx管理系统 - 后台前端（Vue版本）

## 创建项目

创建项目
> vue create beyongx-admin-vue

使用帮助
```
vue --help
vue --version
```

### 安装依赖

淘宝定制的cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com/

全局淘宝镜像
npm config set registry https://registry.npmmirror.com/

查看配置
npm config get 

```
npm install
```
或者
```
npm install --registry=https://registry.npmmirror.com/
```

### 清理缓存

rd /s /q node_modules

npm cache clean -f

### 开发模式,支持热加载（Compiles and hot-reloads for development）

```
npm run serve
```

### 打包正式部署（Compiles and minifies for production）

```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### 自定义配置
See [Configuration Reference](https://cli.vuejs.org/config/).


## 项目开发

### 安装

> npm install

### 开发模式

> npm run dev


### api代理设置

修改vue.config.js 的 proxy 配置