import { app, shell, BrowserWindow, screen, ipcMain, Tray, Menu, session } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import copySelectedText from './copySelectedText'
import { MouseDragHandler } from './handler'

enum WindowState {
  expand = 'WindowState/expand',
  hover = 'WindowState/hover',
  suspension = 'WindowState/suspension'
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 31,
    height: 31,
    x: 1300,
    y: 700,
    type: 'toolbar',
    alwaysOnTop: true,
    show: false,
    movable: true,
    useContentSize: true,
    // skipTaskbar: true,
    frame: false,
    resizable: false,
    focusable: false,
    transparent: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // mainWindow.setAspectRatio(1)

  mainWindow.once('ready-to-show', () => {
    // mainWindow.show()
    // mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // window
  const mainWindow = createWindow()

  // tray
  const tray = new Tray(path.join(__dirname, '../../public/img/WuBlogLogo.png'))

  // var
  let state: WindowState = WindowState.suspension
  let pin = false

  // contextmenu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      click: (): void => {
        mainWindow.show()
        mainWindow.webContents.send('expand')
      }
    },
    {
      label: '最小化',
      click: (): void => {
        mainWindow.hide()
      }
    },
    {
      label: '退出',
      click: (): void => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('Glider')

  tray.setContextMenu(contextMenu)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1.0)

    const handler = new MouseDragHandler(mouseDownUserCallback, mouseUpUserCallback)

    handler.listen()
  })

  const mouseUpUserCallback = async (): Promise<void> => {
    const cursor = screen.getCursorScreenPoint()

    const { x, y } = cursor

    if (isPositionOnWindow(x, y, mainWindow)) return

    // re-locate
    if (state === WindowState.suspension) {
      mainWindow.setPosition(x + 10, y + 10)

      mainWindow.show()
    }

    // sendCopiedText
    if (pin) {
      try {
        const text = await copySelectedText()

        mainWindow.webContents.send('sendCopiedText', text)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const mouseDownUserCallback = (): void => {
    const cursor = screen.getCursorScreenPoint()

    const { x, y } = cursor

    if (isPositionOnWindow(x, y, mainWindow)) return

    if (state === WindowState.expand) {
      if (pin) {
        return
      } else {
        mainWindow.hide()

        mainWindow.setFocusable(false)
        mainWindow.setResizable(false)
        mainWindow.setContentSize(31, 31)

        state = WindowState.suspension

        mainWindow.webContents.send('suspension')
      }
    } else {
      mainWindow.hide()
    }
  }

  ipcMain.handle('expand', async (event) => {
    state = WindowState.expand

    mainWindow.setFocusable(true)
    mainWindow.setResizable(true)
    mainWindow.setContentSize(660, 380)

    try {
      const text = await copySelectedText()
      mainWindow.webContents.send('sendCopiedText', text)
    } catch (err) {
      console.log(err)
    }
  })

  ipcMain.handle('suspension', (event) => {
    state = WindowState.suspension

    mainWindow.setFocusable(false)
    mainWindow.setResizable(false)
    mainWindow.setContentSize(31, 31)
  })

  ipcMain.handle('openMenu', (event) => {
    console.log('openMenu')
  })

  ipcMain.handle('pin', (event, isPinVal) => {
    pin = isPinVal
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// let workInProgress = false

// const interval = 16

// function setWindowSizeGradual(
//   window: BrowserWindow,
//   width: number,
//   height: number,
//   duration: number
// ): void {
//   if (!workInProgress) {
//     workInProgress = true
//     let [curWidth, curHeight] = window.getContentSize()

//     const widthGap = width - curWidth
//     const widthStep = widthGap / (duration / interval)

//     const heightGap = height - curHeight
//     const heightStep = heightGap / (duration / interval)

//     const timerId = setInterval(() => {
//       if (curWidth < width || curHeight < height) {
//         curWidth += widthStep

//         curHeight += heightStep

//         window.setContentSize(curWidth, curHeight)
//       } else {
//         clearInterval(timerId)
//         workInProgress = false
//       }
//     }, interval)
//   }
// }

function isPositionOnWindow(x: number, y: number, window: BrowserWindow): boolean {
  const [width, height] = window.getSize()

  const [winX, winY] = window.getPosition()

  if (x <= winX + width && x >= winX && y <= winY + height && y >= winY) {
    return true
  } else {
    return false
  }
}
