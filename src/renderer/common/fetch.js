import axios from 'axios'

export const post = (url, data, options) => {
  return common('POST', url, data, options)
}

export const get = (url, data, options) => {
  // console.log(url)
  return common('GET', url, data, options)
}

export const common = (type, url, data = {}, options = {}) => {
  // console.log(typeof url)
  if (typeof url === 'object') {
    const request = url
    url = request.url
    data = request.data
    options = request.options || {}
  }
  // 设置默认值
  options = Object.assign({
    url,
    method: type,
    dataType: 'json',
    withCredentials: true,
    // 显示loading
    process: true,
    // 超时时间
    timeout: 15000,
    // 是否需要提示
    headers: {
      'content-type': 'application/json;charset=utf-8'
    }
  }, options)

  // 根据请求类型修改数据传输结构
  if (type.toLowerCase() === 'get') options.params = data
  else options.data = data || {}

  return axios(options)
}

axios.interceptors.request.use(function (config) {
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

axios.interceptors.response.use(function (response) {
  return response.data || {}
}, function (error) {
  return Promise.reject(error)
})

function install (Vue) {
  Object.defineProperty(Vue.prototype, '$get', {
    get: () => get
  })
  Object.defineProperty(Vue.prototype, '$post', {
    get: () => post
  })
  Object.defineProperty(Vue.prototype, '$fetch', {
    get: () => common
  })
}

export default install
