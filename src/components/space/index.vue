<template>
  <div id="space">
    <div id="cont"></div>
  </div>
</template>

<script>

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import ThreeBasic from '../../utils/ThreeBasic'
import Request from '../../utils/Request'

export default {
  name: 'space',
  props: {
    msg: String
  },
  data(){
    return{

      // ENV
      publicPath: process.env.BASE_URL,

      // 3D Space
      scene: null,
      renderer: null,
      camera: null,
      controls: null,
      raycaster: null,
      loadManager: null,
      iR: null,

      // Config Address
      Conf_Lights: "./assets/config/lights.json",
      Cont_Models: "./assets/config/models.json"
    }
  },
  mounted(){
    let that = this
    this.Init()
    this.Update()

    // 监听resize事件，当窗口尺寸改变的时候更新渲染
    window.addEventListener( 'resize', onWindowResize, false )

    function onWindowResize() {
      that.camera.aspect = window.innerWidth / window.innerHeight
      that.camera.updateProjectionMatrix()
      that.renderer.setSize( window.innerWidth, window.innerHeight )
    }

    // 监听点击事件，打印被选中物体
    document.getElementById('cont').addEventListener("mousedown", (evt) => {
      let mouse = {
        x: ( evt.clientX / window.innerWidth ) * 2 - 1,
        y: - ( evt.clientY / window.innerHeight ) * 2 + 1
      }
        that.checkIntersection(mouse)
    }, false);
  },
  methods:{
    Init(){

      let cont = document.getElementById('cont')

      // Init Camera
      this.camera = new THREE.PerspectiveCamera(25, cont.clientWidth/cont.clientHeight, 1, 2000)
      this.camera.position.x = 90
      this.camera.position.y = 100
      this.camera.position.z = 250
      this.camera.name = "Main-Camera"

      // Init Scene
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color( 0x111111 )

      // Init iR
      this.iR = ThreeBasic.AddGroup("IR", "Interacitve-Root")
      this.scene.add(this.iR)

      // Init Light
      this.LoadLights(this.Conf_Lights)

      // Init Models Loading Manager
      this.loadManager = new THREE.LoadingManager()
      this.loadManager.onProgress = (item, loaded, total) => {
        if(loaded == total){
          console.log("Loading Finished")
        } else{
          console.log(loaded, total)
        }
      }

      // Init Loading Models
      this.LoadModels(this.Cont_Models, this.scene)

      // Init Ray Caster
      this.raycaster = new THREE.Raycaster

      // Init render
      // 初始化渲染管
      this.renderer = new THREE.WebGLRenderer({antialias: true})
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.setPixelRatio( window.devicePixelRatio )
      this.renderer.setSize(window.innerWidth, window.innerHeight)

      // Print render result to canvas container
      // 将渲染内容打印到画布容器
      cont.appendChild(this.renderer.domElement)

      // Init Control
      // 初始化控制器
      this.controls = new OrbitControls( this.camera, this.renderer.domElement )
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.25
      this.controls.screenSpacePanning = true
      this.controls.maxDistance = 400
      this.controls.minDistance = 80
      this.controls.rotateSpeed = 0.2

      this.controls.update()

    },

    // Render frame (Update)
    Update(){
      this.renderer.render(this.scene, this.camera)
      this.controls.update()
      requestAnimationFrame(this.Update)
    },

    LoadLights (api) {

      let that = this

      Request.Get(api, [], false, (res)=>{
        let light
        
        let arr = res.data
        arr.forEach(el => {
          
          if(el.type == "Ambient"){
            light = new THREE.AmbientLight ( new THREE.Color(parseInt("0x" + el.color)) , el.opacity)
            
          }

          else if(el.type == "Point") {
            light = new THREE.PointLight( new THREE.Color(parseInt("0x" + el.color)), el.opacity)
            light.position.set(el.position.x, el.position.y, el.position.z)
          }

          /*if (el.shadow) {
            // 改这个参数能缓解疙瘩点
            //light.shadow.bias = 0
            light.castShadow = true
            light.shadow.mapSize.width = 512
            light.shadow.mapSize.height = 512
            light.shadow.camera.near = 0.5
            light.shadow.camera.far = 500 
          }*/
          light.name = el.name
          //console.log(light)
          
          that.scene.add(light)
        })
      })
    },

    // Load all Models
    LoadModels(api, group){
      Request.Get(api, [], false, (res)=>{
        
        res.data.forEach(el => {
          this.addModel(this.publicPath + el.obj, el.name, el.displayName, el.position, el.scale, group)
        })
      })
    },

    // Void: Load Obj and add to certain group
    // 方法：加载obj并添加到制定组
    addModel (objPath, objName, objDName, objPosi, objScale, group) {
      //let that = this
      let loader = new GLTFLoader(this.loadManager)
      
      loader.load( 
        objPath, 

        // Handle Add Process
        (obj) => {
          
          // console.log(obj)
          
          obj.scene.position.x = objPosi.x
          obj.scene.position.y = objPosi.y
          obj.scene.position.z = objPosi.z
          obj.scene.name = objName
          obj.scene.displayName = objDName

          if(objScale){
            obj.scene.scale.x = objScale
            obj.scene.scale.y = objScale
            obj.scene.scale.z = objScale
          }

          group.add( obj.scene )

          /*that.$nextTick( () =>{
            obj.children[0].geometry.computeBoundingSphere()
          })*/

        },
      
        // Handle Progress
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        }, 
        
        // Handle Error
        (error) => {
         console.log('Obj Loading Error: ' + error)
        }
      )
    },

    // 2D画布上点击，返回选中的目标
    // 向屏幕发射一条射线，返回触碰到的所有物体，返回第一个物体
    checkIntersection(pointer) {
        this.raycaster.setFromCamera( pointer, this.camera )
        let intersects = this.raycaster.intersectObjects( [ this.iR ], true )
        if ( intersects.length > 0 ) {
          let selectedObject = intersects[0].object
          return selectedObject.parent
        } else {
            return false
        }
    },


    // Void: Set selected object not transparent(== highlight) and others transparent
    // 反向设置透明，（仅IsolateObj，即被选中物体不透明，其他设置为透明）
    reverseTransObj (group, isolateObj, opa) {
      group = group.children

      if(!group){
          return
      }
      for(var i=0;i<group.length;i++){

        if(group[i].name == isolateObj.name){
          this.setObjectTransparent(group[i], 1, false)
          this.setObjShadow(group[i], true)
        } else {
          this.setObjectTransparent(group[i], opa, true)
          this.setObjShadow(group[i], false)
        }
      }
    },

    // Void: Deep copy a position value of a 3D object
    // 方法：将某物设置成透明
    // Input: 物体(object), 透明值(opa), 设置透明/取消透明(boolean) Return: 无所谓
    setObjectTransparent (obj, opa, bol) {
      for(var i=0;i<obj.children.length;i++){
          // If obj contain children
          if(opa == 0){
              obj.visible = false
          }else{
            obj.visible = true
            obj.children[i].material.transparent = bol
            obj.children[i].material.opacity = opa
          }
      }
      return obj
    },


    // 设置物体是否生成投影和是否接收投影
    setObjShadow (obj, bol) {
      obj.children[0].castShadow = bol
      obj.children[0].receiveShadow = bol
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#space{
  position: absolute;
  height: 100%;
  width: 100%;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
