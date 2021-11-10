// Pre-render the app into static HTML
// run `npm run generate` and then `dist/static` can be served as a static site.

import fs from 'fs'
import path from 'path'

const toResolve = (p: string) => path.resolve(__dirname, p)
const distApp = toResolve(path.join(process.cwd(), 'dist', 'app'))

const manifest = require(`${distApp}/static/ssr-manifest.json`)
const template = fs.readFileSync(
  toResolve(`${distApp}/static/index.html`),
  'utf-8'
)
const { render } = require(`${distApp}/server/server.js`)

// determine routes to pre-render from src/pages
const routesToPrerender = fs
  .readdirSync(toResolve(`${process.cwd()}/src/pages`))
  .map((file) => {
    const name = file.replace(/\.vue$/, '').toLowerCase()
    return name === 'home' ? '/' : `/${name}`
  })

;(async () => {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const [appHtml, preloadLinks] = await render(url, manifest)

    const html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, appHtml)

    const filePath = `${distApp}/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(toResolve(filePath), html)
    console.log('pre-rendered:', filePath)
  }

  // done, delete ssr manifest

  fs.unlinkSync(toResolve(`${distApp}/static/ssr-manifest.json`))
})()
