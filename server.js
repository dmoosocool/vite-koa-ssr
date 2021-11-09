// import fs from 'fs'
// import path from 'path'
// import Koa from 'koa'
// import Router from '@koa/router'
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const connect = require('koa-connect')
const Router = require('@koa/router')


const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV === 'production') {
  const resolve = p => path.resolve(__dirname, p)
  const indexProd = isProd ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8') : ''
  const manifest = isProd ? require('./dist/client/ssr-mainifest.json') : {}
  const app = new Koa()
  const router = new Router()
  let vite;

  if(!isProd) {
    vite = await require('vite').createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enfore polling for consistency
          usePolling: true,
          interval: 100
        }
      }
    })

    app.use(connect(vite.middlewares))
  } else {
    app.use(require('koa-staitc')(resolve('dist/client'), {index: false}))
  }

  // router.get('/', (ctx, next)=> {
  //   ctx.body = 'hello world~';
  //   next && next();
  // })
  // inject routes.
  router.all('/(.*)', async (ctx, next)=> {
    try{
      const url = ctx.originalUrl
      let template, render
      if(!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        template = indexProd
        render = require('./dist/server/entry-server.js').render
      }

      const [appHtml, preloadLinks] = await render(url, manifest, __dirname)
      const html = template.replace(`<!--preload-links-->`, preloadLinks).replace(`<!--app-html-->`, appHtml)

      ctx.status = 200
      ctx.res.setHeader('Content-Type', 'text/html')

      ctx.body = html
    } catch(e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      ctx.status = 500
      ctx.body = e.stack
    }
  })

  app.use(router.routes(), router.allowedMethods());
  return { app, vite }
}

if(!isTest) {
  createServer().then(({app})=>{
    app.listen(3000, ()=>{
      console.log('server running on http://0.0.0.0:3000')
    })
  })
}

exports.createServer = createServer