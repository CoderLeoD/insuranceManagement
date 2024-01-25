<script setup>
import { ref } from 'vue'
import AddOrEdit from './components/AddOrEdit.vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const insuranceName = ref('')
const insuranceType = ref('')

// 提示框
const dialogVisible = ref(false)

// 按钮事件
function cancelAction() {
  backList()
}
function addAction() {
  api.addInsurance({
    name: insuranceName.value,
    type: insuranceType.value,
    cycle: '年交',
  }).then(res => {
    if (200 === res.code) {
      dialogVisible.value = true
    }
  })
}

// 提示框
function handleClose() {
  dialogVisible.value = false
}
function backList() {
  dialogVisible.value && handleClose()
  router.push({
    name: 'insuranceList',
  })
}
</script>

<template>
  <AddOrEdit
    v-model:insuranceName="insuranceName"
    v-model:insuranceType="insuranceType"
    @cancel="cancelAction"
    @commit="addAction"
  ></AddOrEdit>
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
