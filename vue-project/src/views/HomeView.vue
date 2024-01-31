<script setup>
import api from '@/api'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import RemindMessageBox from '@/views/components/RemindMessageBox.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()


const remindList = ref([])

const remindNum = computed(() => remindList.value?.filter(v => 1 === v.is_reminded)?.length)

function logoutAction() {
  // 关闭当前标签页
  window.open("about:blank","_self")
  window.close()
}

onMounted(() => {
  getRemindList()
})

function getRemindList() {
  api.getRemindList().then(res => {
    const { results, code } = res
    if (200 === code) {
      results.length && (remindList.value = results)
    }
  })
}

const rightNav = ref(null)
const remindDetail = ref({})
function showRemindDetail(row) {
  rightNav.value.click()
  remindDetail.value = row
  remindVisible.value = true
}

const remindVisible = ref(false)

function remindCancel() {
  remindVisible.value = false
}

function remindedAction(remindData) {
  api.updateRemind(remindData).then(res => {
    if (200 === res.code) {
      // 1, 提示用户
      ElMessage({
        message: '提醒状态更新成功',
        type: 'success',
      })
      // 2, 修改当前页面数据状态
      remindList.value.forEach(v => {
        if (remindData.id === v.id) {
          v.is_reminded = 2
        }
      })
      // 3, 关闭 remind message box
      remindCancel()
    }
  })
}

// 面包屑
const breadcrumbItem = ref('')

watch(() => router.currentRoute.value, async (newRoute) => {
  const { name } = newRoute
  if (name) {
    breadcrumbItem.value = {
      usersList: "客户管理",
      useAdd: "添加客户",
      userEdit: "编辑客户",
      insuranceList: "险种管理",
      insuranceAdd: "添加险种",
      insuranceEdit: "编辑险种",
    }[name]
  }
}, { immediate: true })
</script>

<template>
  <main class="main">
    <div class="main_left">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="">
      </div>
      <ul class="nav_list">
        <li class="nav_item">
          <RouterLink to="/main/usersList">客户管理</RouterLink>
        </li>
        <li class="nav_item">
          <RouterLink to="/main/userAdd">添加客户</RouterLink>
        </li>
        <li class="nav_item">
          <RouterLink to="/main/insuranceList">险种管理</RouterLink>
        </li>
        <li class="nav_item">
          <RouterLink to="/main/insuranceAdd">添加险种</RouterLink>
        </li>
      </ul>
    </div>
    <div class="main_right">
      <div class="logo right_nav">
        <div class="main_right_nav_l">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ breadcrumbItem }}</el-breadcrumb-item>
            <!-- <el-breadcrumb-item>
              <a href="/">promotion management</a>
            </el-breadcrumb-item>
            <el-breadcrumb-item>promotion list</el-breadcrumb-item>
            <el-breadcrumb-item>promotion detail</el-breadcrumb-item> -->
          </el-breadcrumb>
        </div>
        <div class="mian_right_nav" ref="rightNav">
          <el-popover
            placement="bottom"
            :width="300"
            trigger="click"
          >
            <template #reference>
              <div class="nav_remind">
                <i class="iconfont icon-remind"></i>
                <div v-if="remindNum" class="remind_tag">{{ remindNum }}</div>
              </div>
            </template>
            <el-table :data="remindList" max-height="300">
              <el-table-column width="150" label="提醒类型">
                <template #default="scope">
                  <div class="table_remind">
                    <el-link type="primary" @click="showRemindDetail(scope.row)">{{ 'special_days' === scope.row.type ? '纪念日提醒' : '保费到期提醒' }}</el-link>
                    <div v-if="1 === scope.row.is_reminded" class="table_remind_tag"></div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="100" property="user" label="客户姓名" />
            </el-table>
          </el-popover>
          <div class="logout_btn" @click="logoutAction">退出</div>
        </div>
      </div>
      <div class="main_content">
        <div class="con">
          <RouterView></RouterView>
        </div>
      </div>
    </div>
  </main>
  <RemindMessageBox
    :visible="remindVisible"
    :remindDetail="remindDetail"
    @cancel="remindCancel"
    @reminded="remindedAction"
  ></RemindMessageBox>
</template>

<style scoped>
.main {
  height: 100%;
  display: flex;
}
.logo {
  height: 64px;
  padding: 12px;
  border-bottom: 1px solid #efefef;
  font-size: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 40px;
    height: 40px;
    border-radius: 100px;
  }
}
.main_left {
  flex: none;
  width: 128px;
  height: 100%;
  background-color: rgb(40, 56, 75);
  .nav_list {
    display: flex;
    flex-direction: column;
    .nav_item {
      width: 100%;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #efefef;
      a {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        color: #fff;
        &.router-link-active {
          background-color: #42b883;
        }
        &:hover {
          background-color: #42b883aa;
        }
      }
    }
  }
}
.main_right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .right_nav {
    flex: none;
    font-size: 16px;
    justify-content: space-between;
    .main_right_nav_l {
      padding-left: 24px;
    }
    .mian_right_nav {
      padding: 0 32px;
      display: flex;
      align-items: center;
      gap: 32px;
      .nav_remind {
        position: relative;
        cursor: pointer;
        i {
          font-size: 24px;
          &:hover {
            color: #42b883;
          }
        }
        .remind_tag {
          padding: 2px 4px;
          border-radius: 100px;
          background-color: #ff0000;
          position: absolute;
          right: -4px;
          top: -2px;
          font-size: 12px;
          line-height: 100%;
          color: #fff;
        }
      }
      .logout_btn {
        cursor: pointer;
        &:hover {
          color: #42b883;
        }
      }
    }
  }
  .main_content {
    width: 100%;
    height: 100%;
    padding: 32px;
    padding-top: 16px;
    .con {
      width: 100%;
      height: 100%;
      padding: 16px 32px;
      box-shadow: 2px 2px 6px 0 #3f3f3f3f;
    }
  }
}
</style>
<style>
.el-table td.el-table__cell .table_remind {
    position: relative;
    .table_remind_tag {
      width: 6px;
      height: 6px;
      border-radius: 100px;
      background-color: #ff0000;
      position: absolute;
      top: 2px;
      left: -6px;
    }
  }
</style>
