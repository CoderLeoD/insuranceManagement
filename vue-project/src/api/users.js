import api from './basic'
import axios from './axios'

const basic = `${api}/users`

const users = {
  getUserStatusList: () => {
    return axios.get(`${basic}/status_type`)
  },
  getUserGradeList: () => {
    return axios.get(`${basic}/grade_type`)
  },
  getUsersList: (params) => {
    return axios.get(`${basic}/list`, { params })
  },
  deleteUserValidate: (params) => {
    return axios.put(`${basic}/delete/validate`, params)
  },
  deleteUser: (params) => {
    return axios.delete(`${basic}/delete`, { params })
  },
  addUser: (params) => {
    return axios.post(`${basic}/add`, params)
  },
  getUserDetail: (params) => {
    return axios.get(`${basic}/detail`, { params })
  },
  editUser: (params) => {
    return axios.put(`${basic}/edit`, params)
  },
}


export default users
