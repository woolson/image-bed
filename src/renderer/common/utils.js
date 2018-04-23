import { ipcRenderer } from 'electron'
import CRC32 from 'crc-32'

export function messager (name, args) {
  ipcRenderer.sendSync(name, args)
  return new Promise((resolve, reject) => {
    ipcRenderer.sendSync(`${name}-replay`, resolve)
  })
}

export function fileToBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = evt => {
      const base64 = evt.target.result
      resolve(base64)
    }
  })
}

export function pidToUrl (pid) {
  const type = 'large'
  let url, zone, ext
  if (pid[9] === 'w') {
    zone = (CRC32.str(pid) & 3) + 1
    ext = (pid[21] === 'g') ? 'gif' : 'jpg'
    url = `http://ww${zone}.sinaimg.cn/${type}/${pid}.${ext}`
  } else {
    zone = ((pid.substr(-2, 2), 16) & 0xf) + 1
    url = `http://ww${zone}.sinaimg.cn/${type}/${pid}`
  }
  return url
}
