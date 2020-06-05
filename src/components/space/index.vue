<template>
  <div id="space">
    <div id="cont"></div>
  </div>
</template>

<script>

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


import ThreeBasic from '../../utils/ThreeBasic'
import Request from '../../utils/Request'
import { Vector3 } from 'three'

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
      conf_Lights: "./assets/config/lights.json",
      cont_Models: "./assets/config/models.json",
      conf_GeoJSON: "./assets/geo/edinburgh.geojson"
    }
  },
  mounted(){
    let that = this

    this.Init()
    this.Update()

    // 监听resize事件，当窗口尺寸改变的时候更新渲染
    window.addEventListener( 'resize', onWindowResize, false )

    function onWindowResize(){
      that.camera.aspect = window.innerWidth / window.innerHeight
      that.camera.updateProjectionMatrix()
      that.renderer.setSize( window.innerWidth, window.innerHeight )
    }

    onWindowResize()

    // 监听点击事件，打印被选中物体
    document.getElementById('cont').addEventListener("mousedown", (evt) => {
      let mouse = {
        x: ( evt.clientX / window.innerWidth ) * 2 - 1,
        y: - ( evt.clientY / window.innerHeight ) * 2 + 1
      }
        that.checkIntersection(mouse)
    }, false)
  },

  methods:{

    Init(){

      let cont = document.getElementById('cont')

      // Init Camera
      this.camera = new THREE.PerspectiveCamera(25, window.clientWidth/window.clientHeight, 1, 2000)
      this.camera.position.x = 0
      this.camera.position.y = 5

      this.camera.position.z = 0
      this.camera.name = "Main-Camera"

      // Init Scene
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color( 0xa0a0a0 )
      this.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 300 )

      // Init iR
      this.iR = ThreeBasic.AddGroup("IR", "Interacitve-Root")
      this.scene.add(this.iR)

      // Init Light
      this.LoadLights(this.conf_Lights)

      let gridHelper = new THREE.GridHelper( 10, 10 )
      this.scene.add( gridHelper )

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
      //this.LoadModels(this.cont_Models, this.scene)
      this.LoadBuildings(this.conf_GeoJSON, this.scene)
      //this.addBuilding()

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
      this.controls.maxDistance = 800
      this.controls.minDistance = 10
      this.controls.rotateSpeed = 0.7

      // Init Controls Update
      this.controls.update()

    },

    // Render frame (Tick)
    Update(){
      requestAnimationFrame(this.Update)
      this.renderer.render(this.scene, this.camera)
      this.controls.update()
    },

    // Load all building by geojson, this part can connect to the remote source for tile data
    LoadBuildings(api){
      // Get geo json data
      Request.Get(api, [], false, (res)=>{
        let geojson = res.data
        let features = geojson["features"]

        // Max number, however has no order !!
        let count = features.length
        if(features.length > 600){
          count = 600
        }

        // Render all building
        for(let i=0;i<count;i++){
          let fel = features[i]
          // Only render when geometry is Polygon
          if(fel.geometry.type == "Polygon"){
            // Render building
            this.addBuilding(fel.geometry.coordinates, fel.properties["addr:housename"])
          }
        }

      })
    },

    // Render building by geojson->geometry->coordinates points data, a set 2-d array
    addBuilding(d, name){

      for(let i=0;i<d.length;i++){

        let el = d[i]

        // Create a shape object for create model after
        let shape = new THREE.Shape()

        // Get deeper layer of point data
        for(let ii=0;ii<el.length;ii++){
          let elp = el[ii]

          //convert position from the center position
          elp = ThreeBasic.GPSRelativePosition([elp[1], elp[0]], [55.943686, -3.188822])

          // Draw shape
          if(ii == 0){
            shape.moveTo(elp[1], elp[0])
          } else {
            shape.lineTo(elp[1], elp[0])
          }
        }

        // Extrude Shape to Geometry
        let extrudeSettings = { depth: 0.1, bevelEnabled: false, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
        let geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
        geometry.computeBoundingBox()

        // Create Mesh
        let mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() )

        // Name by building name (if exist)
        mesh.name = name ? name : "Building"

        // Add to interactive root group
        this.iR.add(mesh)

        // Adjust position
        let finalPosi = ThreeBasic.GPSRelativePosition([el[parseInt(el.length / 2)][1], el[parseInt(el.length / 2)][0]], [55.943686, -3.188822])
        mesh.position = new THREE.Vector3(finalPosi[1], 0.1, finalPosi[0])
        
        // Rescale
        //mesh.scale = new THREE.Vector3(0.8,0.8,0.8)

        // Rotate by 90 Degree (causing by lineTo only support x and y)
        mesh.rotation.x = Math.PI / 2
        
      }
    },

    // Load All Lights
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
            // 改这个参数能缓解阴影制造的疙瘩点
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
      return true
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
