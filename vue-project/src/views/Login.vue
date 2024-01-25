<script setup>
import { getCurrentInstance, ref } from 'vue';
import LabelInput from '@/components/LabelInput.vue';

const { $router } = getCurrentInstance().proxy;

const username = ref('');
const password = ref('');

function loginAction() {
  console.log('xdl-来了, 老弟')
  if ('admin' === username.value && 'admin123' === password.value) {
    $router.push({
      name: "main",
      // query: {
      //   pageType: "compare",
      //   id: item.Id,
      //   termName: item.Name,
      // },
    });
  }
}

</script>

<template>
  <main class="login_bg">
    <div class="login_wrap">
      <div class="username">
        <LabelInput
          id="username"
          label="用户名:"
          v-model="username"
          placeholder="请输入用户名"
        ></LabelInput>
      </div>
      <div class="password">
        <LabelInput
          id="password"
          label="密码:"
          v-model="password"
          type="password"
          placeholder="请输入密码"
        ></LabelInput>
      </div>
      <div class="login_btn" @click="loginAction">登录</div>
    </div>
  </main>
</template>

<style scoped>
.login_bg {
  width: 100%;
  height: 100%;
  background: url('@/assets/homebg.jpg');
  background-size: 100% 100%;
}
.login_wrap {
  width: 412px;
  height: 260px;
  padding: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.7);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-206px, -130px);
}
.username, .password {
  margin-bottom: 40px;
}
.login_btn {
  padding: 16px;
  font-size: 20px;
  line-height: 20px;
  border-radius: 6px;
  background-color: rgb(104, 205, 239);
  color: #fff;
  text-align: center;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: rgb(85, 200, 238);
  }
}
</style>
