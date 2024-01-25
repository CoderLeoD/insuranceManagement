<script setup>
import api from '@/api'
import { onMounted, ref } from 'vue'

const emit = defineEmits(['cancel', 'commit'])

defineProps({
  title: {
    type: String,
    default: "添加险种",
  },
})

const insuranceName = defineModel('insuranceName', { required: true })
const insuranceType = defineModel('insuranceType')

function cancelAction() {
  emit('cancel')
}
function commitAction() {
  emit('commit')
}

// 获取保险类型
onMounted(() => {
  getInsuranceType()
})

const options = ref([])
function getInsuranceType() {
  api.getInsuranceType().then(res => {
    if (200 === res.code) {
      res.results?.forEach(ele => {
        options.value.push({
          value: ele.type_name,
          label: ele.type_name,
        })
      })
    }
  })
}

</script>

<template>
  <div class="title">{{ title }}</div>
  <div class="insurance_list">
    <div class="item_name">险种名称:</div>
    <div class="item_con">
      <el-input v-model="insuranceName" clearable placeholder="请输入险种名称" />
    </div>
    <div class="item_name">保险类型:</div>
    <div class="item_con">
      <el-select
        v-model="insuranceType"
        clearable
        placeholder="请选择保险类型"
        style="width: 240px"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="item_btn">
      <el-button @click="cancelAction">取消</el-button>
      <el-button type="primary" @click="commitAction">提交</el-button>
    </div>
  </div>
</template>

<style scoped>
.title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 36px;
}
.insurance_list {
  height: 40%;
  height: 136px;
  display: grid;
  grid-template-columns: 96px 1fr;
  row-gap: 20px;
  column-gap: 12px;
}
.item_name {
  line-height: 32px;
  font-size: 16px;
}
.item_con {
}
.item_btn {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
  text-align: center;
}

</style>
