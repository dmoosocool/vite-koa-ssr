import config from './vite.config'

const noExternal = Object.assign(config, {
  ssr: {
    noExternal: /./,
  },
  resolve: {
    alias: [
      {
        find: '@vue/runtime-dom',
        replacement: '@vue/runtime-dom/dist/runtime-dom.cjs.js',
      },
      {
        find: '@vue/runtime-core',
        replacement: '@vue/runtime-core/dist/runtime-core.cjs.js',
      },
    ],
  },
})

export default noExternal
