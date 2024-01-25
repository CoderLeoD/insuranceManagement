<script setup>
import { ref, watch } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

const router = useRouter();

const remindNum = ref(0);

function logoutAction() {
  // 关闭当前标签页
  window.open("about:blank","_self");
  window.close();
}

function showRemind() {
  console.log('xdl-展示提醒选项');
}

// 面包屑
const breadcrumbItem = ref('');

watch(() => router.currentRoute.value, async (newRoute) => {
  const { name } = newRoute;
  if (name) {
    breadcrumbItem.value = {
      usersList: "客户管理",
      useAdd: "添加客户",
      userEdit: "编辑客户",
      insuranceList: "险种管理",
      insuranceAdd: "添加险种",
      insuranceEdit: "编辑险种",
    }[name];
  }
}, { immediate: true });
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
        <div class="mian_right_nav">
          <div class="nav_remind" @click="showRemind">
            <i class="iconfont icon-remind"></i>
            <div v-if="remindNum" class="remind_tag">{{ remindNum }}</div>
          </div>
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
          z-index: -1;
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
