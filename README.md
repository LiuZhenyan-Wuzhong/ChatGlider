<div align="center">
  <picture>
    <img alt="ChatGlider" src="https://github.com/LiuZhenyan-Wuzhong/ChatGlider/blob/master/media/WuOpenAIlogo.png">
  </picture>
  <p>
    <em>ChatGlider - powered by ChatGPT.</em>
  </p>
</div>

# ChatGlider

一个通过electron构建的桌面端划词翻译软件，提供方便快捷的全局翻译服务。同时实现了对话、代码分析、文章润色等功能。Powered by ChatGPT API

## Quick Start
将本项目的releases文件1.0（目前只支持win，mac以及linux版本正在路上）下载到本地，常规的安装流程，需要开启管理员权限以体验全部功能。

<img alt="ChatGlider-usage" src="https://github.com/LiuZhenyan-Wuzhong/ChatGlider/blob/master/media/video1.0.0.gif">

本项目特色：
- 全局划词翻译，监听到划词时按钮弹出，轻松快捷
- 图钉按下时自动翻译选取的文字
- 对话，代码分析，文稿润色多种应用

本项目将不会获取您的任何私人数据，包括您的openAI_APIKey以及openAI_URL

## Build Your App
### Install

```bash
$ npm install

&&

$ yarn
```

### Development

```bash
$ npm run dev

&&

$ yarn dev
```

### Build

```bash
$ npm run build:win

&&

$ yarn build:mac
```

欢迎提出更新意见，贡献代码，有闲的产品同学可以一起玩。

个人微信：
<div align="center">
  <picture>
    <img alt="wuzhong个人微信" src="https://github.com/LiuZhenyan-Wuzhong/ChatGlider/blob/master/media/wuzhong_wechat.jpg" width="200">
  </picture>
</div>


## Reference
灵感来源于项目:<a href="https://github.com/yetone/openai-translator">openai-translator</a>

脚手架使用了<a href="https://github.com/alex8088/electron-vite">electron-vite</a>，感谢它的作者