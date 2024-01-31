export const usersList = [
  /**
   * 客户管理
   */
  // 客户列表
  {
    path: '/main/usersList',
    name: 'usersList',
    // meta: {
    //   loginRequired: true,
    //   keepAlive:true,
    // },
    component: () => import('@/views/users/UserList.vue'),
  },
  // 编辑客户
  {
    path: '/main/userEdit',
    name: 'userEdit',
    component: () => import('../views/users/UserEdit.vue'),
  },
  // 添加客户
  {
    path: '/main/userAdd',
    name: 'userAdd',
    component: () => import('../views/users/UserAdd.vue'),
  },
  /**
   * 险种管理
   */
  // 添加险种
  {
    path: '/main/insuranceAdd',
    name: 'insuranceAdd',
    component: () => import('../views/insurance/InsuranceAdd.vue'),
  },
  // 编辑险种
  {
    path: '/main/insuranceEdit',
    name: 'insuranceEdit',
    component: () => import('../views/insurance/InsuranceEdit.vue'),
  },
  // 险种列表
  {
    path: '/main/insuranceList',
    name: 'insuranceList',
    component: () => import('../views/insurance/InsuranceList.vue'),
  },
]
