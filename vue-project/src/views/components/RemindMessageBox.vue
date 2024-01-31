<script setup>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { isDate, toNumber } from 'lodash'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  remindDetail: {
    type: Object,
    default: () => {},
  },
})

const isSpecial = computed(() => 'special_days' === props.remindDetail?.type)

const tableData = computed(() => {
  const { user, date, name, insurance_name, end_time, com_money} = props.remindDetail
  return [{
    user: user,
    date: getDateFormat(new Date(toNumber(isSpecial.value ? date : end_time))),
    content: isSpecial.value ? name : insurance_name,
    money: `${(com_money || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 元`,
  }]
})

function getDateFormat(date) {
  if (isDate(date)) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    return `${year}年${month + 1}月${day}日`
  }
  return date
}

const emit = defineEmits(['cancel', 'reminded'])

function cancelAction() {
  emit('cancel')
}
function remindedAction() {
  emit('reminded', { id: props.remindDetail.id, type: props.remindDetail.type })
}

</script>

<template>
  <div v-if="visible" class="remind_message_box_wrap">
    <div class="remind_message_box_con">
      <div class="remind_tit">
        {{ isSpecial ? '纪念日提醒' : '保费续缴提醒' }}
        <div class="tit_close" @click="cancelAction"><el-icon><Close /></el-icon></div>
      </div>
      <el-table :data="tableData" border stripe style="width: 100%;" max-height="120">
        <el-table-column prop="user" label="客户姓名" width="96" />
        <el-table-column prop="date" label="关键日期" width="124" />
        <el-table-column label="提醒事项">
          <template #default="scope">
            <el-popover trigger="hover" placement="top"  width="300" effect="dark">
              <p>{{ scope.row.content }}</p>
              <template v-slot:reference>
                <span class="ellipsis">{{ scope.row.content }}</span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column v-if="!isSpecial" prop="money" label="续缴保费" width="90" />
      </el-table>
      <div class="remind_btn">
        <el-button @click="cancelAction">关闭</el-button>
        <el-button v-if="1 === remindDetail.is_reminded" type="primary" @click="remindedAction">已提醒</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.remind_message_box_wrap {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  .remind_message_box_con {
    width: 520px;
    height: 256px;
    padding: 16px;
    border-radius: 16px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-260px, -128px);
    display: grid;
    grid-template-rows: 56px 1fr 48px;
    align-items: center;
    .remind_tit {
      position: relative;
      padding: 16px 0;
      font-size: 24px;
      line-height: 100%;
      .tit_close {
        position: absolute;
        top: 12px;
        right: 0;
        cursor: pointer;
        &:hover {
          color: black;
        }
      }
    }
    .remind_btn {
      padding-top: 16px;
      text-align: center;
    }
  }
}
.ellipsis {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
