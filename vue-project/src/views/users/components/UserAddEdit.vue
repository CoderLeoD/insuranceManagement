<script setup>
import api from '@/api'
import { onMounted, ref, reactive } from 'vue'
import { pcaTextArr } from 'element-china-area-data'
import { Plus, Delete, StarFilled, Close } from '@element-plus/icons-vue'
import { toNumber } from 'lodash'

const emit = defineEmits(['cancel', 'commit'])

const { userDetail } = defineProps({
  title: {
    type: String,
    default: "添加客户",
  },
  isAdd: {
    type: Boolean,
    default: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  userDetail: {
    type: Object,
    default: () => {},
  },
})

// const userName = defineModel('userName')
// const gender = defineModel('gender')

const userFormRef = ref()
// 险种名称
const insuranceOpts = ref([])

// 客户类型
const userTypeOpts = ref([])

// 意向等级
const userGradeOpts = ref([])


// 组件加载完毕
onMounted(() => {
  getInsuranceList()
  getUserStatusList()
  getUserGradeList()
  initFormData()
})

// 保险列表
function getInsuranceList() {
  api.getInsuranceList({}).then(res => {
    if (200 === res.code) {
      res.results?.data?.forEach(ele => {
        insuranceOpts.value.push({
          value: ele.id,
          label: ele.name,
        })
      })
    }
  })
}
// 用户状态
function getUserStatusList() {
  api.getUserStatusList().then(res => {
    if (200 === res.code) {
      res.results?.forEach(ele => {
        userTypeOpts.value.push({
          value: ele.id,
          label: ele.status,
        })
      })
    }
  })
}
// 意向等级
function getUserGradeList() {
  api.getUserGradeList().then(res => {
    if (200 === res.code) {
      res.results?.forEach(ele => {
        userGradeOpts.value.push({
          value: ele.id,
          label: ele.grade,
        })
      })
    }
  })
}

function initFormData() {
  if (userDetail && Object.keys(userDetail).length) {
    userForm.id = userDetail.id
    userForm.user = userDetail.user
    userForm.gender = userDetail.gender
    userForm.age = userDetail.age
    userForm.phone = userDetail.phone
    userForm.identity_num = userDetail.identity_num
    userForm.status_type = userDetail.status_type
    userForm.grade_type = userDetail.grade_type
    userForm.address_city = JSON.parse(userDetail.address_city)
    userForm.address_street = userDetail.address_street
    userForm.specialDays = []
    userForm.insurances = []
    userDetail.specialDays?.forEach(ele => {
      userForm.specialDays.push({
        key: ele.date,
        name: ele.name,
        date: toNumber(ele.date),
        id: ele.id,
      })
    })
    
    userDetail.insurances?.forEach(ele => {
      userForm.insurances.push({
        key: ele.start_time,
        // insurance_id: ele.insurance_id || '',
        insurance_id: ele.insurance_id,
        start_time: toNumber(ele.start_time),
        end_time: toNumber(ele.end_time),
        first_money: ele.first_money,
        com_money: ele.com_money,
        id: ele.id,
      })
    })
  }
}

const userForm = reactive({
  user: '',
  gender: '',
  age: '',
  phone: '',
  identity_num: '',
  status_type: '',// 1, 已缴费, 2, 意向客户
  grade_type: '',// A, B, C
  address_city: [],
  address_street: '',
  specialDays: [
    // {
    //   key: Date.now(),
    //   name: '',
    //   date: 0,
    // },
  ],
  insurances: [
    // {
    //   key: Date.now() + 1,
    //   insurance_id: '',
    //   start_time: 0,
    //   end_time: 0,
    //   first_money: undefined,
    //   com_money: undefined,
    // },
  ],
})
const rules = reactive({
  user: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入客户手机号', trigger: 'blur' },
    { validator: checkPhone, trigger: 'blur' },
  ],
})
// 手机号验证
function checkPhone(rule, value, callback) {
  if (!value) {
    return callback(new Error('手机号不能为空'));
  } else {
    const reg = /^1[3456789]\d{9}$/
    if (reg.test(value)) {
      callback();
    } else {
      return callback(new Error('请输入正确的手机号'));
    }
  }
}

// 添加/删除纪念日
const addSpecialDay = () => {
  userForm.specialDays.push({
    key: Date.now(),
    name: '',
    date: 0,
  })
}
const removeSpecialDay = (item) => {
  const index = userForm.specialDays.indexOf(item)
  if (index !== -1) {
    userForm.specialDays.splice(index, 1)
  }
}

// 添加/删除已购保险
const removeInsurance = (item) => {
  const index = userForm.insurances.indexOf(item)
  if (index !== -1) {
    userForm.insurances.splice(index, 1)
  }
}

const addInsurance = () => {
  userForm.insurances.push({
    key: Date.now(),
    insurance_id: '',
    start_time: 0,
    end_time: 0,
    first_money: undefined,
    com_money: undefined,
  })
}

// form 事件
function cancelAction() {
  emit('cancel')
}

const onSubmit = async formEl => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      emit('commit', dealWithUserForm(userForm))
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 提交数据整理
function dealWithUserForm() {
  const dealData = { ...userForm }
  dealData.insurances?.forEach(ele => {
    ele.insurance_name = insuranceOpts.value?.find(v => v.value === ele.insurance_id)?.label
  })
  return dealData
}

</script>

<template>
  <div class="user_wrap">
    <div class="title">
      {{ title }}
      <div v-if="!isAdd" class="tit_close" @click="cancelAction"><el-icon><Close /></el-icon></div>
    </div>
    <div class="user_con">
      <div class="main_con">
        <el-form
          ref="userFormRef"
          :inline="true"
          :model="userForm"
          :rules="rules"
          :disabled="readOnly"
          class="demo-form-inline"
        >
          <el-form-item label="姓名:" prop="user">
            <el-input v-model="userForm.user" placeholder="客户姓名" />
          </el-form-item>
          <el-form-item label="性别:">
            <el-radio-group v-model="userForm.gender">
              <el-radio label="男" />
              <el-radio label="女" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="年龄:">
            <el-input type="number" v-model="userForm.age" placeholder="客户年龄" />
          </el-form-item>
          <el-form-item label="电话:" prop="phone">
            <el-input maxlength="11" v-model="userForm.phone" placeholder="客户电话" />
          </el-form-item>
          <el-form-item label="身份证号:">
            <el-input maxlength="18" v-model="userForm.identity_num" placeholder="客户身份证号" />
          </el-form-item>
          <el-form-item label="意向类型:">
            <el-select
              v-model="userForm.status_type"
              placeholder="意向类型"
              clearable
              style="width: 100px"
            >
              <el-option v-for="{label, value} in userTypeOpts" :key="value" :label="label" :value="label" />
            </el-select>
          </el-form-item>
          <el-form-item label="意向等级:">
            <el-select
              v-model="userForm.grade_type"
              placeholder="意向等级"
              clearable
              style="width: 100px"
            >
              <el-option v-for="{label, value} in userGradeOpts" :key="value" :label="label" :value="label" />
            </el-select>
          </el-form-item>
          <el-row>
            <el-form-item label="地址:" class="address">
              <div class="city">
                <el-cascader
                  class="city_con"
                  :options="pcaTextArr"
                  clearable
                  placeholder="选择城市"
                  v-model="userForm.address_city"
                >
                </el-cascader>
              </div>
              <div class="street">
                <el-input v-model="userForm.address_street" placeholder="详细地址" clearable />
              </div>
            </el-form-item>
          </el-row>

          <el-divider>
            <el-icon><star-filled /></el-icon>
          </el-divider>
          
          <el-row>
            <el-col :span="24">
              <el-row>
                <el-form-item
                  v-for="(specialDay, index) in userForm.specialDays"
                  :key="specialDay.key"
                  :label="`纪念日${index + 1}:`"
                >
                  <el-col :span="8">
                    <el-date-picker
                      v-model="specialDay.date"
                      type="date"
                      placeholder="选择日期"
                      format="YYYY-MM-DD"
                      value-format="x"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="7" :offset="1">
                    <el-input maxlength="5" placeholder="最多五个字" v-model="specialDay.name" />
                  </el-col>
                  <el-col :span="7" :offset="1">
                    <el-button type="danger" :icon="Delete" circle @click.prevent="removeSpecialDay(specialDay)" />
                  </el-col>
                </el-form-item>
              </el-row>
              <el-row class="add_special_days">
                <el-button type="primary" :icon="Plus" circle @click="addSpecialDay" />
                <div>添加纪念日</div>
              </el-row>
            </el-col>
          </el-row>

          <el-divider>
            <el-icon><star-filled /></el-icon>
          </el-divider>

          <template v-if="'已缴费' === userForm.status_type">
            <el-row>
              <el-col :span="24">
                <el-row class="insurance_wrap">
                  <el-form-item
                    v-for="(insurance, index) in userForm.insurances"
                    :key="insurance.key"
                    class="insurance_form_item"
                  >
                    <el-col :span="6">
                      {{ `已购险种${index + 1}:` }}
                      <el-select
                        v-model="insurance.insurance_id"
                        placeholder="险种名称"
                        style="width: 100%"
                      >
                        <el-option v-for="{label, value} in insuranceOpts" :key="value" :label="label" :value="value" />
                      </el-select>
                    </el-col>
                    <el-col :span="4" :offset="1">
                      购买日期:
                      <el-date-picker
                        v-model="insurance.start_time"
                        type="date"
                        placeholder="选择日期"
                        format="YYYY-MM-DD"
                        value-format="x"
                        style="width: 100%"
                      />
                    </el-col>
                    <el-col :span="4" :offset="1">
                      当期结束日期:
                      <el-date-picker
                        v-model="insurance.end_time"
                        type="date"
                        placeholder="选择日期"
                        format="YYYY-MM-DD"
                        value-format="x"
                        style="width: 100%"
                      />
                    </el-col>
                    <el-col :span="2" :offset="1">
                      首期保费:
                      <el-input
                        v-model="insurance.first_money"
                        :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\¥\s?|(,*)/g, '')"
                      >
                      </el-input>
                    </el-col>
                    <el-col :span="2" :offset="1">
                      保费:
                      <el-input
                        v-model="insurance.com_money"
                        :formatter="(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\¥\s?|(,*)/g, '')"
                      >
                      </el-input>
                    </el-col>
                    <el-col :span="1" :offset="1">
                      <!-- 删除该险: -->
                      <el-button class="insurance_delete" type="danger" :icon="Delete" circle @click.prevent="removeInsurance(insurance)" />
                    </el-col>
                  </el-form-item>
                </el-row>
                <el-row class="add_special_days add_insurance">
                  <el-button type="primary" :icon="Plus" circle @click="addInsurance" />
                  <div>添加已购险种</div>
                </el-row>
              </el-col>
            </el-row>
  
            <el-divider>
              <el-icon><star-filled /></el-icon>
            </el-divider>
          </template>

          <el-row class="buttons" v-if="!readOnly">
            <el-form-item>
              <el-button @click="cancelAction">取消</el-button>
              <el-button type="primary" @click="onSubmit(userFormRef)">提交</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user_wrap {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 32px 1fr;
  row-gap: 36px;
  .title {
    font-size: 32px;
    line-height: 32px;
    font-weight: 700;
    position: relative;
    .tit_close {
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
      transition: all 0.3s ease-in;
      &:hover {
        transform: rotate(90deg);
      }
    }
  }
  .user_con {
    position: relative;
    .main_con {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      overflow: auto;
      .address {
        width: 100%;
        display: grid;
        grid-template-columns: 44px 1fr;
        .city {
          width: 40%;
        }
        :deep() .city_con {
          width: 96%;
        }
        .street {
          width: 50%;
        }
      }
      .add_special_days {
        width: 100%;
        justify-content: center;
        border: 1px dashed #e3e3e3;
        padding: 4px;
        margin-bottom: 18px;
        gap: 12px;
        align-items: center;
      }
      .insurance_form_item {
        border-radius: 6px;
        padding-bottom: 8px;
        transition: all 0.3s ease-in;
        margin-bottom: 0;
        padding-left: 8px;
        &:hover {
          background-color: rgb(242, 245, 248);
        }
        .insurance_delete {
          margin-top: 8px;
        }
      }
      .add_insurance {
        margin-top: 18px;
      }
      .buttons {
        padding-top: 36px;
        justify-content: center;
        :deep() .el-form-item__content {
          gap: 36px;
        }
        .el-form-item {
          margin-right: 0;
        }
      }
      /* 输入框样式 */
      :deep() .el-date-editor .el-input__suffix {
        width: 22px;
      }
      :deep() .insurance_wrap .el-form-item {
        margin-right: 0;
      }

    }
  }
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
