<script setup>
import { Search } from '@element-plus/icons-vue';

defineProps({
  placeholder: {
    type: String,
  },
});

const search = defineModel();

const emit = defineEmits(['search', 'clear'])

let oldSearch = '';
function searchAction() {
  if (oldSearch !== search.value) {
    emit('search');
    oldSearch = search.value;
  }
}
function clearAction() {
  oldSearch = ''
  emit('clear');
}

</script>

<template>
  <el-input v-model="search" clearable :placeholder="placeholder" @clear="clearAction">
    <template #prepend>
      <el-button :icon="Search" />
    </template>
    <template #append>
      <el-button @click="searchAction">点击搜索</el-button>
    </template>
  </el-input>
</template>

<style scoped>
:deep() .el-input-group__append {
  background-color: rgb(40, 56, 75) !important;
  color: #fff !important;
}
</style>
