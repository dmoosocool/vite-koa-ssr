import { defineComponent, Suspense } from 'vue'
import mod from '@/assets/css/about.module.css'
export default defineComponent({
  render() {
    console.log(mod)
    return (
      <>
        <h3 class={mod['titleColor']}>this is about page~</h3>
      </>
    )
  },
})
