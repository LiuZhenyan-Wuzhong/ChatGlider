import {
  app,
  shell,
  BrowserWindow,
  screen,
  ipcMain,
  Tray,
  Menu,
  clipboard,
  Notification
} from 'electron'
import fs from 'fs'
import process from 'process'
import fsPromises from 'fs/promises'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import copySelectedText from './copySelectedText'
import { MouseDragHandler } from './handler'

enum WindowMode {
  expand = 'WindowMode/expand',
  hover = 'WindowMode/hover',
  suspension = 'WindowMode/suspension',
  bigger = 'WindowMode/bigger'
}

const storagePath = path.join(app.getPath('userData'), 'storage.json')

interface UsetStorage {
  openAIAPIKey?: string
  openAIURL?: string
  stream?: boolean
  trailCount: number
}

// read
async function loadStorage(): Promise<UsetStorage> {
  try {
    const data = await fsPromises.readFile(storagePath, { encoding: 'utf-8', flag: 'r' })

    // init
    if (data.length === 0) {
      return { trailCount: 0 }
    }

    return JSON.parse(data)
  } catch (err) {
    console.error(err)

    await fsPromises.writeFile(storagePath, '')

    console.log('创建了用户数据目录。')

    return { trailCount: 0 }
  }
}

// save
async function saveStorage(data: UsetStorage): Promise<void> {
  try {
    await fsPromises.writeFile(storagePath, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
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
    icon: path.resolve(__dirname, '../../public/img/favicon.ico'),
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

const note = ({
  title,
  body,
  onClick
}: {
  title: string
  body: string
  onClick?: (notification: Notification) => void
}): void => {
  const notification = new Notification({
    title,
    body,
    icon: path.resolve(__dirname, '../../public/img/favicon.ico'),
    closeButtonText: '关闭'
  })
  notification.on('click', (): void => {
    onClick ? onClick(notification) : notification.close()
  })
  notification.show()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('ChatGlider')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  if (process.platform === 'win32') {
    app.setAppUserModelId('ChatGlider')
  }

  // window
  const mainWindow = createWindow()

  // mainWindow.on('rezise')

  // tray
  const tray = new Tray(path.join(__dirname, '../../public/img/favicon.ico'))

  // var
  let windowMode: WindowMode = WindowMode.suspension
  let pin = false

  // contextmenu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      click: (): void => {
        mainWindow.show()
        mainWindow.webContents.send('expand', false)
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

    loadStorage().then((storage) => {
      console.log('loadUserData', storage)

      mainWindow.webContents.send('loadUserData', storage)

      note({
        title: 'ChatGlider已经准备好',
        body: '全局划词翻译已上线，双击选中单词或划选文字即可触发翻译入口。'
      })
    })
  })

  const mouseUpUserCallback = async (): Promise<void> => {
    const cursor = screen.getCursorScreenPoint()

    const { x, y } = cursor

    if (isPositionOnWindow(x, y, mainWindow)) return

    // re-locate
    if (windowMode === WindowMode.suspension) {
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

    if (windowMode === WindowMode.expand) {
      if (pin) {
        return
      } else {
        mainWindow.hide()

        mainWindow.setFocusable(false)
        mainWindow.setResizable(false)
        mainWindow.setContentSize(31, 31)

        windowMode = WindowMode.suspension

        mainWindow.webContents.send('suspension')
      }
    } else {
      mainWindow.hide()
    }
  }

  ipcMain.handle('bigger', async (event) => {
    windowMode = WindowMode.bigger

    mainWindow.setFocusable(true)
    mainWindow.setResizable(true)

    const [width, height] = mainWindow.getContentSize()

    mainWindow.setContentSize(width, height + 400 > 820 ? 820 : height + 400)
  })

  ipcMain.handle('expand', async (event, fromSuspension: boolean) => {
    windowMode = WindowMode.expand

    mainWindow.setFocusable(true)
    mainWindow.setResizable(true)
    mainWindow.setContentSize(660, 420)
    mainWindow.setOpacity(1)
    mainWindow.setMinimumSize(400, 340)

    if (fromSuspension) {
      try {
        const text = await copySelectedText()
        mainWindow.webContents.send('sendCopiedText', text)
      } catch (err) {
        console.log(err)
      }
    } else {
      const [width] = mainWindow.getContentSize()

      mainWindow.setContentSize(width, 420)
    }
  })

  ipcMain.handle('suspension', (event) => {
    windowMode = WindowMode.suspension

    mainWindow.setMinimumSize(30, 30)
    mainWindow.setFocusable(false)
    mainWindow.setResizable(false)
    mainWindow.setOpacity(0.75)
    mainWindow.setContentSize(31, 31)
  })

  ipcMain.handle('openMenu', (event) => {
    console.log('openMenu')
  })

  ipcMain.handle('pin', (event, isPinVal) => {
    pin = isPinVal
  })

  ipcMain.handle('sendTranslateReq', (event) => {})

  ipcMain.handle('copy', (event, text) => {
    clipboard.writeText(text)
  })

  ipcMain.handle('saveUserData', async (event, userData) => {
    try {
      const storage = await loadStorage()
      const { openAIAPIKey, openAIURL, stream } = userData

      storage.openAIAPIKey = openAIAPIKey
      storage.openAIURL = openAIURL
      storage.stream = stream

      await saveStorage(storage)

      note({ title: 'ChatGlider Error', body: '保存设定成功。' })

      return true
    } catch (err) {
      console.error(err)

      note({ title: 'ChatGlider Error', body: (err as Error).message })

      return false
    }
  })

  ipcMain.handle('queryUserData', (event) => {
    loadStorage().then((storage) => {
      mainWindow.webContents.send('loadUserData', storage)
    })
  })

  // ipcMain.handle('sendRequest', async (event) => {
  //   const storage = await loadStorage()
  //   const { openAIAPIKey } = storage
  //   if (openAIAPIKey === import.meta.env.MAIN_VITE_TRIAL_OPENAI_API_KEY) {
  //     storage.trailCount++
  //     await saveStorage(storage)

  //     if (import.meta.env.MAIN_VITE_TRIALS) {
  //       const trials = parseInt(import.meta.env.MAIN_VITE_TRIALS)
  //       if (storage.trailCount >= trials) {
  //         return { trial: true, trailCount: storage.trailCount, trials, goon: false }
  //       } else {
  //         return { trial: true, trailCount: storage.trailCount, trials, goon: true }
  //       }
  //     }
  //     return { trial: false }
  //   } else {
  //     return { trial: false }
  //   }
  // })

  ipcMain.handle('openBrowser', async (event, url) => {
    shell.openExternal(url)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function isPositionOnWindow(x: number, y: number, window: BrowserWindow): boolean {
  const [width, height] = window.getSize()

  const [winX, winY] = window.getPosition()

  if (x <= winX + width && x >= winX && y <= winY + height && y >= winY) {
    return true
  } else {
    return false
  }
}
