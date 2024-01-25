import axios from './axios'

const insurance = {
  getInsuranceType: () => {
    return axios.get(`/insurance/type`)
  },
  addInsurance: (params) => {
    return axios.post(`/insurance/add`, params)
  },
  getInsuranceList: (params) => {
    return axios.get(`/insurance/list`, { params })
  },
  deleteInsuranceValidate: (params) => {
    return axios.put(`/insurance/delete/validate`, params)
  },
  deleteInsurance: (params) => {
    return axios.delete(`/insurance/delete`, { params })
  },
  getInsuranceDetail: (params) => {
    return axios.get(`/insurance/detail`, { params })
  },
  editInsurance: (params) => {
    return axios.put(`/insurance/edit`, params)
  },
}

export default insurance
