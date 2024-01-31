<script setup>
import { onMounted, reactive, ref } from 'vue'
import SearchInput from '@/components/SearchInput.vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

// 警示框
const dialogVisible = ref(false)
const dialogDesc = ref('')

// 搜索框
const searchValue = ref('')

// 页码
const pageData = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

// table 数据
const tableData = ref([])

// 搜索
function clearAction() {
  searchAction()
}
function searchAction() {
  pageData.currentPage = 1
  getUsersList()
}

// 查看
function handleDetail(row) {
  router.push({
    name: "userEdit",
    query: {
      userId: row.id,
      isDetail: JSON.stringify(true),
    }
  })
}

// 编辑
function handleEdit(row) {
  router.push({
    name: "userEdit",
    query: {
      userId: row.id,
    }
  })
}
// 删除
let deleteId = -1
function handleDelete(row) {
  deleteId = row.id
  api.deleteUserValidate({
    id: deleteId,
  }).then(res => {
    if (200 === res.code) {
      dialogDesc.value = res.message
      dialogVisible.value = true
    }
  })
}

/**
 * 警示框
 */
// 关闭警示框
function handleClose() {
  dialogVisible.value = false
}
// 确认删除
function confirmDelete() {
  // 删除
  deleteUser()
  // 关闭 dialog
  handleClose()
}

function deleteUser() {
  api.deleteUser({
    id: deleteId,
  }).then(res => {
    if (200 === res.code) {
      getUsersList()
    }
  })
}

/**
 * 数据获取
 */
onMounted(() => {
  getUsersList()
})

function getUsersList() {
  api.getUsersList({
    pageNum: pageData.currentPage,
    pageSize: pageData.pageSize,
    searchValue: searchValue.value,
  }).then(res => {
    if (200 === res.code) {
      tableData.value = res.results?.data
      pageData.total = res.results?.total
    }
  })
}

// 页码
function handleCurrentChange(val) {
  pageData.currentPage = val
  getUsersList()
}
</script>

<template>
  <div class="mange_wrap">
    <!-- 一, 搜索 -->
    <div class="mange_search">
      <SearchInput
        v-model="searchValue"
        placeholder="请输入客户姓名"
        @search="searchAction"
        @clear="clearAction"
      ></SearchInput>
    </div>
    <!-- 二, 用户列表 -->
    <div class="mange_con">
      <div id="tableBox" v-height>
        <el-table class="table_list" :data="tableData" border stripe style="width: 100%;" height="100%">
          <el-table-column align="center" type="index" label="序号" width="54" />
          <el-table-column prop="user" label="姓名" width="150" />
          <el-table-column prop="gender" label="性别" width="54" />
          <el-table-column prop="age" label="年龄" width="54" />
          <el-table-column prop="status_type" label="客户类型" width="100" />
          <el-table-column prop="grade_type" label="意向等级" width="90" />
          <el-table-column label="联系电话" width="150">
            <template #default="scope">
              {{ scope.row.phone.substring(0, 3) }} {{ scope.row.phone.substring(3, 7) }} {{ scope.row.phone.substring(7) }}
            </template>
          </el-table-column>
          <el-table-column prop="identity_num" label="身份证号" width="200" />
          <el-table-column label="操作" min-width="200">
            <template #default="scope">
              <el-button
                size="small"
                @click="handleDetail(scope.row)"
              >查看</el-button>
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
              >编辑</el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 三, 页码 -->
    <div class="mange_footer">
      <el-pagination
        :page-sizes="[10]"
        background
        layout="total, sizes, prev, pager, next"
        :total="pageData.total"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <!-- dialog 警示框 -->
  <el-dialog
    v-model="dialogVisible"
    title="提示"
    width="30%"
    :before-close="handleClose"
  >
    <span>{{ dialogDesc }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirmDelete">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
