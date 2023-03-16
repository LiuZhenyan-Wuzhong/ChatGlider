使用以下代码在electron中监听鼠标事件


```javascript
robot.keyTap('c', 'control')
robot.keyTap('v', 'control')
```

```javascript
const robot = require('robotjs');

// 获取屏幕大小
const screenSize = robot.getScreenSize();
const height = screenSize.height;
const width = screenSize.width;

// 监听鼠标事件
robot.setMouseDelay(2);
robot.moveMouseSmooth(0, height);

const onMouseAction = (event, mouseStatus) => {
  switch (mouseStatus) {
    case 'drag':
      // 拖拽中不做处理
      break;
    case 'down':
      // 鼠标按下时获取点击位置的颜色值
      const clickPos = robot.getMousePos();
      const pixelColor = robot.getPixelColor(clickPos.x, clickPos.y);
      
      // 判断是否选中了单词，如果选中则调用显示悬浮框的函数，并在其中进行交互界面跳转逻辑
      if (isWordSelected(pixelColor)) {
        showFloatingBox(clickPos.x, clickPos.y);
      }
      break;
    case 'up':
      // 鼠标抬起时自动复制选中的内容，并且将其更新到交互界面中
      const selectedContent = robot.getCopy().trim(); // 去除多余空格
      updateUI(selectedContent);
      break;
    default:
      break;
  }
}

// 开始监听鼠标事件
robot.onMouse(onMouseAction);

// 判断选中的是否为单词
function isWordSelected(colorValue) {
  // TODO: 根据颜色判断是否选中了单词
}

// 显示悬浮框并在其中实现交互界面跳转逻辑
function showFloatingBox(x, y) {
  // TODO: 实现弹出悬浮框的逻辑
}

// 更新交互界面中的内容
function updateUI(content) {
  // TODO: 实现更新交互界面中的内容的逻辑
}

```

显示悬浮框：使用Electron提供的BrowserWindow创建一个新的无边框窗口，将其位置设为鼠标当前位置。 还可以使用CSS美化窗口外观

```javascript
let win = new BrowserWindow({
  show: false, // 先不显示窗口
  frame: false, // 去掉标题栏和边框
  transparent: true, // 窗口透明
  webPreferences: {
    nodeIntegration: true, // 允许加载node模块
  },
})

// 获取鼠标位置
const { x, y } = electron.screen.getCursorScreenPoint()
// 将悬浮框位置设置为鼠标位置
win.setPosition(x, y)

// 将悬浮框的HTML内容填充到窗口中
win.loadURL(`data:text/html;charset=UTF-8,${htmlContents}`)

// 显示悬浮框窗口
win.showInactive()

// 关闭窗口
win.close()
```

处理选择事件：当选择结束后，可以使用clipboard模块将选择的文本复制到剪贴板，并在悬浮框中显示。如果需要添加交互功能，可以定位用户的点击事件并执行相应的操作。
```javascript
const { clipboard } = require('electron')
const selection = clipboard.readText()

// 这里可以编写将选择的文本填充到悬浮框中的代码

// 监听悬浮框点击事件
win.webContents.on('click', (event) => {
  // 这里可以编写进入交互界面的代码
})

```