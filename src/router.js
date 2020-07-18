import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from './pages/home'
import projects from './pages/projects'
import coretest from './pages/coretest'
//import bus from './pages/bus'


// Router, ready for multiple page
export default new VueRouter({
  mode: 'hash',
  base: "/",
  routes: [
    // Home
    { path:'/', name:'default', redirect: projects },
    { path:'/home', name:'home', component: home },
    { path:'/coretest', name:'coretest', component: coretest },
    { path:'/projects', name:'projects', component: projects },
  ]
})