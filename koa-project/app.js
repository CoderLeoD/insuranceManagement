const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

// 跨域相关配置
const cors = require('koa2-cors') //引入koa2-cors
 
app.use(cors()); //后端允许跨域访问

const index = require('./routes/index')
const users = require('./routes/users')
const insurance = require('./routes/insurance')

// // 自定义跨域中间件
// var allowCORS = function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', req.headers.origin);
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   res.header('Access-Control-Allow-Credentials', 'true');

//   next();
// }
// // 使用跨域中间件
// app.use(allowCORS);


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(insurance.routes(), insurance.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
