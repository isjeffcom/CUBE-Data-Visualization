import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from './pages/home'
import projects from './pages/projects'
//import bus from './pages/bus'


// Router, ready for multiple page
export default new VueRouter({
  mode: 'hash',
  base: "/",
  routes: [
    // Home
    { path:'/', name:'default', redirect: projects },
    { path:'/home', name:'home', component: home },
    //{ path:'/bus', name:'bus', component: bus },
    { path:'/projects', name:'projects', component: projects },
  ]
})