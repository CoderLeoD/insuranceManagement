const schedule = require('node-schedule');
const queryUtil = require('../service/query');

const REFRESH_REMIND = 'refresh_remind';

function refreshRemind() {
  // 重复
  const rule2 = new schedule.RecurrenceRule();
  // [0,1,2],表示周天、周一、周二都会执行
  rule2.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
  rule2.hour = 0;
  rule2.minute = 30;
  rule2.second = 0;
  schedule.scheduleJob(REFRESH_REMIND, rule2, async function() {
    // 每天 00:30:00 刷新 is_remind 数据
    const refreshResults = await queryUtil.refreshReminded();
    console.log('更新 is_remind 结果', refreshResults);
  });
}

module.exports = { refreshRemind }
