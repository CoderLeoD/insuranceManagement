<script setup>
import api from '@/api'
import SearchInput from '@/components/SearchInput.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()

// table数据
const tableData = ref([])

// 页码
const pageData = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

// 警示框
const dialogVisible = ref(false)
const dialogDesc = ref('')
const showDel = ref(true)

// 搜索
const searchValue = ref('')
function clearAction() {
  searchAction()
}
function searchAction() {
  pageData.currentPage = 1
  getInsuranceList()
}

// 编辑
function handleEdit(row) {
  router.push({
    name: "insuranceEdit",
    query: {
      insuranceId: row.id,
    }
  })
}
// 删除
let deleteId = -1
function handleDelete(row) {
  deleteId = row.id
  api.deleteInsuranceValidate({
    id: deleteId,
  }).then(res => {
    if (200 === res.code) {
      dialogDesc.value = res.message
      showDel.value = 2000 === res.messageCode
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
  deleteInsurance()
  // 关闭 dialog
  handleClose()
}
function deleteInsurance() {
  api.deleteInsurance({
    id: deleteId,
  }).then(res => {
    if (200 === res.code) {
      getInsuranceList()
    }
  })
}

// 获取列表数据
onMounted(() => {
  getInsuranceList()
})

function getInsuranceList() {
  api.getInsuranceList({
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

function handleCurrentChange(val) {
  pageData.currentPage = val
  getInsuranceList()
}

</script>

<template>
  <div class="mange_wrap">
    <div class="mange_search">
      <SearchInput
        placeholder="请输入险种"
        v-model="searchValue"
        @search="searchAction"
        @clear="clearAction"
      ></SearchInput>
    </div>
    <div class="mange_con">
      <div id="tableBox" v-height>
        <el-table class="table_list" :data="tableData" border stripe style="width: 100%" height="100%">
          <el-table-column align="center" type="index" label="序号" width="54" />
          <el-table-column prop="name" label="险种名称" width="180" />
          <el-table-column prop="type" label="保险类型" width="150" />
          <el-table-column prop="cycle" label="缴费周期" width="150" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
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
        <el-button v-if="showDel" type="primary" @click="confirmDelete">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
