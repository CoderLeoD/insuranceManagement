<script setup>
import { computed, onMounted, ref } from 'vue'
import UserAddEdit from './components/UserAddEdit.vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

const dialogVisible = ref(false)

const userDetail = ref({})

const readOnly = computed(() => {
  return 'true' === route.query?.isDetail
})

onMounted(() => {
  getUserDetail()
})

function getUserDetail() {
  const { userId: id } = route.query
  if (id) {
    api.getUserDetail({ id }).then(res => {
      if (200 === res.code) {
        userDetail.value = res.data
      }
    })
  }
}

const showDetail = computed(() => {
  return !!Object.keys(userDetail.value).length
})

// 响应事件
function backList() {
  dialogVisible.value && handleClose()
  router.push({
    name: 'usersList',
  })
}

function commitAction(userFormMsg) {
  api.editUser(userFormMsg).then(res => {
    if (200 === res.code) {
      dialogVisible.value = true
    }
  })
}

// 提示框
function handleClose() {
  dialogVisible.value = false
}

</script>

<template>
  <UserAddEdit
    v-if="showDetail"
    :title="readOnly ? '客户详情' : '编辑客户'"
    :isAdd="false"
    :readOnly="readOnly"
    :userDetail="userDetail"
    @cancel="backList"
    @commit="commitAction"
  ></UserAddEdit>
  <el-dialog
    v-model="dialogVisible"
    title="提示"
    width="30%"
    :before-close="handleClose"
  >
    <span>更新成功, 是否返回列表?</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">否, 继续编辑</el-button>
        <el-button type="primary" @click="backList">
          是, 返回列表
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>
