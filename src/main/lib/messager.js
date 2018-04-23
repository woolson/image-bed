// import os from 'os'
// import { execSync } from 'child_process'
import Proxy from './proxy'

let proxyServer // lint-disable-line

export default function (app, ipc, mainWindow) {
  // 退出软件
  ipc.on('quite', (event, arg) => {
    // 网口信息
    app.quit()
    event.returnValue = 'ok'
  })
  // 最小化软件
  ipc.on('mini', (event, arg) => {
    // 网口信息
    mainWindow.minimize()
    event.returnValue = 'ok'
  })

  ipc.on('start-proxy', (event, arg) => {
    proxyServer = new Proxy(arg)
    event.returnValue = true
  })

  ipc.on('update-proxy', (event, arg) => {
    proxyServer.options = arg
    event.returnValue = true
  })

  ipc.on('stop-proxy', (event, arg) => {
    proxyServer && proxyServer.dropAll()
    event.returnValue = true
  })
}
