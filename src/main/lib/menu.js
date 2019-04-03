
import { app, Menu } from 'electron'

export default function setMenu () {
  let isZh = app.getLocale() === 'zh-CN'
  let template = [
    {
      label: 'Application',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: isZh ? '窗口' : 'Window',
      submenu: [
        { role: 'reload' },
        {
          accelerator: 'command+w',
          role: 'hide'
        },
        { role: 'minimize' }
      ]
    },
    {
      label: isZh ? '编辑' : 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
