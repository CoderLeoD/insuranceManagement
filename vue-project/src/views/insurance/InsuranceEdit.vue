<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AddOrEdit from './components/AddOrEdit.vue'
import api from '@/api';

const router = useRouter()
const route = useRoute()

const insuranceDetail = ref({})

// 按钮事件
function cancelAction() {
  backList()
}
function editAction() {
  dialogVisible.value = true;
}

function backList() {
  dialogVisible.value && handleClose()
  router.push({
    name: 'insuranceList',
  })
}


onMounted(() => {
  getInsuranceDetail()
})
// 获取当前险种详情
function getInsuranceDetail() {
  api.getInsuranceDetail({
    id: route.query.insuranceId,
  }).then(res => {
    if (200 === res.code) {
      insuranceDetail.value = res.results?.[0]
    }
  })
}

/**
 * 提示框
 */
const dialogVisible = ref(false)
function handleClose() {
  dialogVisible.value = false
}
function goonAction() {
  api.editInsurance(insuranceDetail.value).then(res => {
    if (200 === res.code) {
      handleClose()
      backList()
    }
  })
}

</script>

<template>
  <AddOrEdit
    v-model:insuranceName="insuranceDetail.name"
    v-model:insuranceType="insuranceDetail.type"
    title="编辑险种"
    @cancel="cancelAction"
    @commit="editAction"
  ></AddOrEdit>
  <el-dialog
    v-model="dialogVisible"
    title="提示"
    width="30%"
    :before-close="handleClose"
  >
    <span>修改后, 所有该险种的名称/类型都将显示当前修改内容!</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="goonAction">
          继续
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>
