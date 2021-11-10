import * as fs from 'fs'
import * as path from 'path'
import Koa from 'koa'
import connect from 'koa-connect'
import Router from '@koa/router'
import * as vite from 'vite'

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const distClient = path.join(process.cwd(), 'dist/app/client')
const distServer = path.join(process.cwd(), 'dist/app/server')

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production'
) {
  const resolve = (p: string) => path.resolve(__dirname, p)

  const indexProd = isProd
    ? fs.readFileSync(resolve(path.join(distClient, 'index.html')), 'utf-8')
    : ''
  const manifest = isProd ? require(`${distClient}/ssr-manifest.json`) : {}
  const app = new Koa()
  const router = new Router()

  let viteServer: vite.ViteDevServer | null = null

  if (!isProd) {
    // cover express middleware to koa middleware
    viteServer = await vite.createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: 'ssr',
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
      },
    })

    // use vite's connect instance as middleware
    // use koa-connect covert express's middleware to koa's middleware
    app.use(connect(viteServer.middlewares))
  } else {
    app.use(
      require('koa-static')(resolve(distClient), {
        index: false,
      })
    )
  }

  // inject routes.
  router.all('/(.*)', async (ctx, next) => {
    try {
      const url = ctx.originalUrl
      let template, render
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(
          resolve(path.join(root, 'index.html')),
          'utf-8'
        )

        template = await (viteServer as vite.ViteDevServer).transformIndexHtml(
          url,
          template
        )

        render = (
          await (viteServer as vite.ViteDevServer).ssrLoadModule(
            path.join(root, 'ssr', 'server.ts')
          )
        ).render
      } else {
        template = indexProd
        render = require(`${distServer}/server.js`).render
      }

      const [appHtml, preloadLinks] = await render(url, manifest, process.cwd())
      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)

      ctx.status = 200
      ctx.res.setHeader('Content-Type', 'text/html')

      ctx.body = html
    } catch (e) {
      viteServer && viteServer.ssrFixStacktrace(e as Error)
      // console.log(e.stack)
      ctx.status = 500
      ctx.body = (e as Error).stack
    }
  })

  app.use(router.routes())
  app.use(router.allowedMethods())

  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) => {
    app.listen(3000, () => {
      console.log('server running on http://0.0.0.0:3000')
    })
  })
}

exports.createServer = createServer
