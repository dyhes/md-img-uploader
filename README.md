# README

## 目的

将markdown中的本地图片上传至图片服务器(imgbb)并替换链接

## 环境

node 20.17.0 (LTS)

## 使用方法

### 创建.env文件

设置 IMGBB_API_KEY 和 MARKDOWN_DIRECTORY

e.g.

```bash

IMGBB_API_KEY=aaaaa
MARKDOWN_DIRECTORY=bbbb
```

其中 IMGBB_API_KEY 可从 [imgbb](https://api.imgbb.com/) 获取

### 下载依赖

```bash
npm install
```

### 执行项目

```bash
npm start
```
