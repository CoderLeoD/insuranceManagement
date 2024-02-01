// remind
const router = require('koa-router')()
const { database } = require('../config/default')
const queryUtil = require('../service/query');

router.prefix(`${database.BASIC_URL}/remind`)

router.get('/list', async function (ctx, next) {
  ctx.body = await queryUtil.getRemindList();
})

router.get('/detail', async function (ctx, next) {
  ctx.body = await queryUtil.getRemindDetail(ctx.query);
})

router.put('/update', async function (ctx, next) {
  ctx.body = await queryUtil.updateRemind(ctx.request.body);
})

module.exports = router
