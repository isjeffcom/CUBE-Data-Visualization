import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from './pages/home'


// Router, ready for multiple page
export default new VueRouter({
  mode: 'hash',
  base: "/",
  routes: [
    // Home
    { path:'/', name:'home', component: home },
    { path:'/index', name:'index', redirect: home },
  ]
})