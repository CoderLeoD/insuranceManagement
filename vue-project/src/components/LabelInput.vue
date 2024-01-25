<script setup>
defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '请输入',
  },
});

const model = defineModel();

</script>

<template>
  <div class="label_input">
    <label class="base_label" :for="id">{{ label }}</label>
    <div class="base_input"><input :id="id" :type="type" v-model="model" :placeholder="placeholder"></div>
  </div>
</template>

<style scoped>
.label_input {
  width: 100%;
  display: flex;
  display: grid;
  grid-template-columns: 96px 1fr;
  font-size: 20px;
}
.base_input {
  padding: 0 12px;
  background-color: rgb(227, 236, 254);
}
.base_input input {
  width: 100%;
  height: 32px;
  line-height: 32px;
  border: none;
  outline: none;
  font-size: 20px;
  background-color: rgb(227, 236, 254);
}
</style>
