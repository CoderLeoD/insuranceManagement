const router = require('koa-router')()
const { database } = require('../config/default')
const queryUtil = require('../service/query');

router.prefix(`${database.BASIC_URL}/users`)

router.get('/list', async function (ctx, next) {
  ctx.body = await queryUtil.getAllUsers(ctx.query);
})

router.get('/status_type', async function (ctx, next) {
  ctx.body = await queryUtil.getUsersStatus();
})

router.get('/grade_type', async function (ctx, next) {
  ctx.body = await queryUtil.getUsersGrades();
})

router.put('/delete/validate', async function (ctx, next) {
  ctx.body = await queryUtil.deleteUserValidate(ctx.request.body);
})

router.delete('/delete', async function (ctx, next) {
  ctx.body = await queryUtil.deleteUser(ctx.query);
})

router.post('/add', async (ctx, next) => {
  ctx.body = await queryUtil.addUser(ctx.request.body);
});

router.get('/detail', async function (ctx, next) {
  ctx.body = await queryUtil.getUserDetail(ctx.query);
})

router.put('/edit', async (ctx, next) => {
  ctx.body = await queryUtil.editUser(ctx.request.body);
});

module.exports = router
