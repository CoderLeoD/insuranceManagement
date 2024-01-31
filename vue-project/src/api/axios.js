import loading from '@/utils/loading'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'

// 基础配置
const instance = axios.create({
  baseURL: 'http://localhost:3000/', // 根据实际情况修改API地址
  timeout: 5000 // 设置超时时间，单位为ms
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    loading.loading()
    config.headers['Authorization'] = localStorage.getItem('token') // 设置请求头部分，这里举例使用了localStorage存储的token作为身份标识
    return config
  },
  (error) => {
    loading.close()
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    loading.close()
    const data = response.data
    if (data && data.code !== 200) {
      // 根据接口返回的状态码判断是否有错误
      // alert(`Error code ${data.code}: ${data.message}`) // 自定义错误提示
      ElMessageBox.alert(`网络错误, 请求数据错误: ${data.message}`, 'Error', {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: '确定',
        type: 'warning',
        callback: () => {
          
        },
      })
      return Promise.reject(new Error(data.message))
    } else {
      return data
    }
  },
  (error) => {
    loading.close()
    console.log(error)
    ElMessageBox.alert(`网络错误, 请求数据错误: ${error.message}`, 'Error', {
      // if you want to disable its autofocus
      // autofocus: false,
      confirmButtonText: '确定',
      type: 'warning',
      callback: () => {
        
      },
    })
    return Promise.reject(error)
  }
)

export default instance
