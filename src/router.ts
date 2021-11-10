import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
} from 'vue-router'

// Auto generates routes from vue files under ./pages
const pages = import.meta.glob('./pages/*.{vue,jsx,tsx}')

const routes = Object.keys(pages).map((path) => {
  const matched = path.match(/\.\/pages(.*).(vue|tsx|js)$/)
  const name = matched !== null ? matched[1].toLowerCase() : ''

  const result = {
    path: name === '/home' ? '/' : name,
    component: pages[path],
  }
  return result
})

export function createRouter() {
  return _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  })
}
