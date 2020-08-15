import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from './pages/home'
import projects from './pages/projects'
import nyc from './pages/nyc'
import administrative from './pages/administrative' // check
import basic from './pages/basic' // check
import heatmap from './pages/heatmap' // check
import model from './pages/model'
import model_ani_tween from './pages/model/tween'
import model_ani_circular from './pages/model/circular'
import bitmap from './pages/bitmap'
import arc from './pages/arc'
import datas from './pages/datas'
import polygon from './pages/polygon'
import terrain from './pages/terrain'

//import bus from './pages/bus'


// Router, ready for multiple page
export default new VueRouter({
  mode: 'hash',
  base: "/",
  routes: [
    // Home
    { path:'/', name:'default', redirect: projects },
    { path:'/home', name:'home', component: home },
    { path:'/basic', name:'basic', component: basic },
    { path:'/administrative', name:'administrative', component: administrative },
    { path:'/nyc', name:'nyc', component: nyc },
    { path:'/heatmap', name:'heatmap', component: heatmap },
    { path:'/projects', name:'projects', component: projects },
    { path:'/bitmap', name:'bitmap', component: bitmap },
    { path:'/model', name:'model', component: model },
    { path:'/arc', name:'arc', component: arc },
    { path:'/polygon', name:'polygon', component: polygon },
    { path:'/datas', name:'datas', component: datas },
    { path:'/terrain', name:'terrain', component: terrain },
    { path:'/model_tween', name:'model', component: model_ani_tween },
    { path:'/model_circular', name:'model', component: model_ani_circular },
  ]
})