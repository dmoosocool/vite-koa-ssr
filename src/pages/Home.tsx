import { defineComponent, Suspense } from 'vue'
import mod from '@/assets/css/home.module.css'
export default defineComponent({
  render() {
    return (
      <>
        <h3 class={mod['titleColor']}>this is home page ya~</h3>
      </>
    )
  },
})
