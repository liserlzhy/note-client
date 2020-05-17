import axios from 'axios'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && config.url !== '/login' && config.url !== '/register') {
    config.headers.common['Authorization'] = 'Bearer ' + token
  }
  return config
})

axios.interceptors.response.use(res => res, error => {
  if (error.response && error.response.status === 401) {
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

export default function ajax(url, data={}, type='GET') {
  if (type === 'GET') {
    let paramStr = ''

    Object.keys(data).forEach(key => {
      if (data[key]) {
        paramStr += key + '=' + data[key] + '&'
      }
    })
    if (paramStr) {
      paramStr = paramStr.substring(0, paramStr.length-1)
    }
    return axios.get(url + '?' + paramStr)
  } else {
    return axios.post(url, data)
  }
}