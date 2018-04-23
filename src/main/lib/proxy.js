import express from 'express'
import httpProxyMiddleware from 'http-proxy-middleware'

export default class Proxy {
  constructor (options) {
    // 初始化服务
    this.app = express()
    this.app.listen(3000)
    console.log('proxy server at 3000')

    this.optionsList = options
    this.options = options
  }

  set options (value) {
    value.forEach(item => {
      const proxyOptions = {
        target: item.target,
        changeOrigin: true,
        onProxyReq (proxyReq, req, res) {
          console.log('there')
        }
      }
      this.app.use(item.reg, httpProxyMiddleware(proxyOptions))
    })
    this.optionsList = value
  }

  dropAll () {
    this.optionsList.forEach(item => {
      this.app.disable(item.reg)
    })
  }
}
