const router = require('koa-router')()
const queryUtil = require('../service/query');

router.prefix('/insurance')

router.get('/type', async function (ctx, next) {
  ctx.body = await queryUtil.getInsuranceType();
});

router.post('/add', async (ctx, next) => {
  ctx.body = await queryUtil.addInsurance(ctx.request.body);
});

router.get('/list', async (ctx, next) => {
  ctx.body = await queryUtil.insuranceList(ctx.query);
});

router.put('/delete/validate', async function (ctx, next) {
  ctx.body = await queryUtil.deleteInsuranceValidate(ctx.request.body);
})

router.delete('/delete', async (ctx, next) => {
  ctx.body = await queryUtil.deleteInsurance(ctx.query);
});

router.get('/detail', async (ctx, next) => {
  ctx.body = await queryUtil.insuranceDetail(ctx.query);
});

router.put('/edit', async (ctx, next) => {
  ctx.body = await queryUtil.editInsurance(ctx.request.body);
});


module.exports = router
