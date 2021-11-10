{
  /* <template>
  <div>
    <h1> Hello Vite & Koa & Vue ~</h1>
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
      </Suspense>
    </router-view>
  </div>
</template>

<style>

</style> */
}

import { defineComponent, Suspense } from 'vue'

export default defineComponent({
  render() {
    return (
      <>
        <h1>Hello Vite & Koa & Vue</h1>
        <router-link to="/">Home</router-link>
        <router-link to="/about">About</router-link>
        <Suspense>
          <router-view
            v-slots={{
              default: (Component: any) => Component.Component,
            }}
          ></router-view>
        </Suspense>
      </>
    )
  },
})
