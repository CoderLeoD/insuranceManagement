<script setup>
import api from '@/api'
import UserAddEdit from '@/views/users/components/UserAddEdit.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const dialogVisible = ref(false)

function backList() {
  dialogVisible.value && handleClose()
  router.push({
    name: 'usersList',
  })
}

function addAction(userFormMsg) {
  api.addUser(userFormMsg).then(res => {
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
    @cancel="backList"
    @commit="addAction"
  ></UserAddEdit>
  <el-dialog
    v-model="dialogVisible"
    title="提示"
    width="30%"
    :before-close="handleClose"
  >
    <span>添加成功, 是否继续添加?</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">是, 继续添加</el-button>
        <el-button type="primary" @click="backList">
          否, 返回列表
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>
