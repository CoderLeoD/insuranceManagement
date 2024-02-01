import api from './basic'
import axios from './axios'

const basic = `${api}/insurance`

const insurance = {
  getInsuranceType: () => {
    return axios.get(`${basic}/type`)
  },
  addInsurance: (params) => {
    return axios.post(`${basic}/add`, params)
  },
  getInsuranceList: (params) => {
    return axios.get(`${basic}/list`, { params })
  },
  deleteInsuranceValidate: (params) => {
    return axios.put(`${basic}/delete/validate`, params)
  },
  deleteInsurance: (params) => {
    return axios.delete(`${basic}/delete`, { params })
  },
  getInsuranceDetail: (params) => {
    return axios.get(`${basic}/detail`, { params })
  },
  editInsurance: (params) => {
    return axios.put(`${basic}/edit`, params)
  },
}

export default insurance
