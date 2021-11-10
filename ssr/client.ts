import { createApp } from '../src/main'
const { app, router } = createApp()

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  app.mount('#app')
})
