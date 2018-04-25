import { ipcRenderer } from 'electron'
import axios from 'axios'
import CRC32 from 'crc-32'

const UPLOAD_URL = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog'

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

export function uploadFile (file) {
  const formData = new FormData()
  formData.append('b64_data', file.base64.split(',')[1])

  const request = [
    UPLOAD_URL,
    formData,
    { withCredentials: true }
  ]

  return axios.post(...request).then(res => {
    let text = res.data
    text = text.replace(/<.*?\/>/, '')
    text = text.replace(/<(\w+).*?>.*?<\/\1>/, '')
    const result = JSON.parse(text)

    switch (result.code) {
      case 'A20001':
        if (result.data.count === -1) {
          return { success: false, msg: '请登录微博', ...file }
        } else {
          return { success: false, msg: '文件类型错误', ...file }
        }
      case 'A00006':
        const pid = result.data.pics.pic_1.pid
        return { success: true, imageUrl: pidToUrl(pid), ...file }
      default:
        return { success: false, msg: '未知错误', ...file }
    }
  })
}

export function imgCompress (data, quality, outputFormat = 'image/png') {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      const { width, height } = img || {}
      // 按比例压缩4倍
      // const rate = (width < height ? width / height : height / width) / 4
      canvas.width = width * quality
      canvas.height = height * quality
      ctx.drawImage(img, 0, 0, width, height, 0, 0, width * quality, height * quality)
      var dataURL = canvas.toDataURL(outputFormat, quality)
      resolve(dataURL)
      canvas = null
    }
    img.src = data
  })
}

// 深拷贝
export function deepCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}
