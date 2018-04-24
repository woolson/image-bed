// import os from 'os'
// import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import moment from 'moment'

const HISTORY_FILE = path.join(__dirname, '../db/history.json')

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

  // 获取历史数据
  ipc.on('get-history', (event, arg) => {
    event.returnValue = JSON.parse(fs.readFileSync(HISTORY_FILE))
  })

  // 保存历史
  ipc.on('insert-history', (event, arg) => {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE))

    arg.forEach(item => {
      item = {
        imageUrl: item.imageUrl,
        success: item.success,
        name: item.name,
        date: moment().format('YYYY-MM-DD HH:mm:SS')
      }
      history.push(item)
    })

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 4))
    event.returnValue = true
  })
}
