import api from './basic'
import axios from './axios'

const basic = `${api}/remind`

const remind = {
  getRemindList: () => {
    return axios.get(`${basic}/list`)
  },
  getRemindDetail: (params) => {
    return axios.get(`${basic}/list`, { params })
  },
  updateRemind: (params) => {
    return axios.put(`${basic}/update`, params)
  },
}


export default remind
