'use strict'

import { app, BrowserWindow } from 'electron'
// import initMessager from './lib/messager'
import setMenu from './lib/menu'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 500,
    minHeight: 400,
    useContentSize: true,
    frame: false,
    titleBarStyle: 'hidden',
    // transparent: true,
    show: false,
    resizable: true,
    webPreferences: {
      devTools: true,
      webSecurity: false
    }
  })
  // Check for updater
  require('update-electron-app')({
    repo: 'woolson/image-bed',
    updateInterval: '5 minutes',
    logger: require('electron-log')
  })
  mainWindow.loadURL(winURL)

  // 设置菜单栏
  setMenu(mainWindow)
  // 创建窗口后加载事件
  // initMessager(app, ipcMain, mainWindow)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
