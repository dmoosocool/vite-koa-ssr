import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import styleImport from 'vite-plugin-style-import'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import components from 'unplugin-vue-components/vite'
import WindiCSS from 'vite-plugin-windicss'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{find: '@', replacement: path.resolve(__dirname, 'src')}]
  },
  optimizeDeps: {
    include: ['element-plus']
  },  
  plugins: [
    vue(), 
    components({ 
      extensions: ['vue', 'js', 'ts', 'jsx', 'tsx'],
      resolvers: [ElementPlusResolver()] 
    }),
    WindiCSS(),
    jsx(),
    styleImport({
      libs: [
        {
          libraryName: 'element-plus',
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: (name) => {
            name = name.slice(3)
            return `element-plus/theme-chalk/src/${name}.scss`
          },
          resolveComponent: (name) => {
            return `element-plus/lib/${name}`
          }
        }
      ]
    })
  ],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
})
