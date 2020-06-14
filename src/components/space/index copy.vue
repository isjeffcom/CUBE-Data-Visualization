<template>
  <div id="space">
    <div id="building-info"></div>
    <div id="cont"></div>
  </div>
</template>

<script>

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module.js'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

//import ui from '../ui'

import ThreeBasic from '../../utils/ThreeBasic'
import BuildModels from '../../utils/BuildModels'
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

      // Map
      Center: [-3.188822, 55.943686],

      // Debug
      stats: null,

      // 3D Space
      clock: 0,
      time: 0,
      delta: 0,
      scene: null,
      renderer: null,
      camera: null,
      controls: null,
      raycaster: null,
      loadManager: null,
      iR: null,
      iR_Building: null,
      iR_Road: null,
      iR_Line: null,

      // Information Colliders
      Collider_Building: [],

      // Line Speed
      Animated_Line_Speed: 0.1,
      Animated_Line_ASpeed: THREE.Math.degToRad(20),
      Animated_Line_Distances: [],

      // Test
      geometries: [],

      // 2D UI
      allDots:[],
      allDotsEl:[],

      // 3D Object
      MAT_BUILDING: null,
      MAT_ROAD: null,

      // Current UI Reactive Vars
      Selected: null,

      // Config Address
      conf_Lights: "./assets/config/lights.json",
      cont_Models: "./assets/config/models.json",
      conf_GeoJSON: "./assets/geo/edinburgh_road.geojson"
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

      // Save detection result
      let hitted = that.checkIntersection(mouse)
      console.log(hitted)
      // If clicked and hit something
      // if(hitted){
        
      //   if(hitted.infoType == "Building") this.SelectBuilding(hitted)
      // } else {
      //   //this.RemoveAllDots()
      // }
    }, false)
  },

  methods:{

    Init(){

      let cont = document.getElementById('cont')

      // Init Clock
      this.clock = new THREE.Clock()

      // Init Camera
      this.camera = new THREE.PerspectiveCamera(25, window.clientWidth/window.clientHeight, 1, 100)
      this.camera.position.set( 8, 4, 0 );
      this.camera.name = "Main-Camera"

      // Init Scene
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color( 0x222222 )
      this.scene.fog = new THREE.Fog( 0x444444, 10, 60 )

      // Init iR
      this.iR = ThreeBasic.AddGroup("iR", "Interactive-Root")
      this.iR_Building = ThreeBasic.AddGroup("IRB", "IR_Building")
      this.iR_Road = ThreeBasic.AddGroup("IRR", "IR_Road")
      this.iR_Line = ThreeBasic.AddGroup("IRL", "IR_Line")
      this.scene.add(this.iR)

      // Sprate building and roads root
      this.$nextTick(()=>{
        this.iR.add(this.iR_Building)
        this.iR.add(this.iR_Road)
        this.iR.add(this.iR_Line)
      })

      // Init Light
      this.LoadLights(this.conf_Lights)

      // Init Gird Helper
      let gridHelper = new THREE.GridHelper( 60, 160, new THREE.Color( 0x555555 ), new THREE.Color( 0x333333 ) )
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
      this.LoadElements(this.conf_GeoJSON, this.scene)

      // Init Ray Caster
      this.raycaster = new THREE.Raycaster

      // Init render
      // 初始化渲染
      this.renderer = new THREE.WebGLRenderer({antialias: true, precision: "lowp", powerPreference: "low-power"})
      this.renderer.shadowMap.enabled = false
      //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.setPixelRatio( window.devicePixelRatio )
      this.renderer.setSize(window.innerWidth, window.innerHeight)

      // Print render result to canvas container
      // 将渲染内容打印到画布容器
      cont.appendChild(this.renderer.domElement)

      // Init Control
      // 初始化控制器
      this.controls = new MapControls( this.camera, this.renderer.domElement )
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.25
      this.controls.screenSpacePanning = false
      this.controls.maxDistance = 800

      // Limit how much user can see by polar angle(vertical)
      this.controls.maxPolarAngle = Math.PI / 2.4
      
      // Auto Rotate
      this.controls.autoRotate = false
      this.controls.autoRotateSpeed = 1
      //this.controls.minDistance = 10
      //this.controls.maxPolarAngle = Math.PI / 2
      this.controls.rotateSpeed = 0.7

      // Init Controls Update
      this.controls.update()

      //this.controls.addEventListener( 'change', this.Update() ); 

      // Init status monitor window
      this.stats = new Stats()
      cont.appendChild( this.stats.dom )
      
      this.TestAnimatedLine([[0,0], [20, 20]])

    },

    // Render frame (Tick)
    Update(){
      // Limit 60 FPS
      // let that = this
      // setTimeout( function() {
      //   requestAnimationFrame(that.Update)
      // }, 1000 / 62 )

      requestAnimationFrame(this.Update)
      
      this.delta = this.clock.getDelta()
      this.time += this.delta

      this.renderer.render(this.scene, this.camera)
      this.controls.update()
      this.UpdateDots(this.camera, this.allDots)

      this.UpdateAnimatedLine()

      this.stats.update()
      // Triangles faces count
      //console.log(this.renderer.info.render.triangles)
    },

    TestAnimatedLine(data){
      let mat = new THREE.LineDashedMaterial({ color: 0xff9900 })

      let points = []
      points.push( new THREE.Vector3( data[0][0], 2, data[0][1] ) )
      points.push( new THREE.Vector3( data[1][0], 2, data[1][1] ) )
      
      let geometry = new THREE.BufferGeometry().setFromPoints( points )
      let line = new THREE.Line( geometry, mat )

      line.computeLineDistances()

      line.material.dashSize = 0
      line.material.gapSize = 1000
      line.scale.setScalar(0.1)
      this.Animated_Line_Distances[0] = geometry.attributes.lineDistance.array[ geometry.attributes.lineDistance.count - 1]
      this.iR_Line.add(line)

    },

    UpdateAnimatedLine(){
      let arr = this.iR_Line.children

      for(let i=0;i<arr.length;i++){
        let line = arr[i]

        let dash 
        let length = parseInt(this.Animated_Line_Distances[i])

        
        
        if (parseInt(line.material.dashSize) > length) {
          console.log("b")
          line.material.dashSize = 0
          //line.material.gapSize -= this.Animated_Line_Speed
          //line.material.gapSize = line.material.gapSize - 1
        } else {
          console.log("a")
          line.material.dashSize += this.Animated_Line_Speed
        }
      }
    },

    // Load all building by geojson, this part can connect to the remote source for tile data
    LoadElements(api){
      let that = this
      // Create MAT
      this.MAT_BUILDING = new THREE.MeshPhongMaterial()
      this.MAT_ROAD = new THREE.LineBasicMaterial( { color: 0x4F80FF } )

      // Get geo json data
      Request.Get(api, [], false, (res)=>{
        let features = res.data["features"]
        
        // Max building number
        let count = features.length
        if(features.length > 1000){
          //count = 1000
        }

        // Render all building
        for(let i=0;i<count;i++){

          let fel = features[i]

          // Just in case properties value does not exist
          if(!fel["properties"]) return

          let info = fel["properties"]
          // Only render when geometry is Polygon
          if(info["building"]){
            // Render building
            this.addBuilding(fel.geometry.coordinates, info, info["building:levels"])
          }

          else if(info["highway"]){
            
            // Render Roads
            if(fel.geometry.type == "LineString" && info.highway != "pedestrian" && info.highway != "footway") this.addRoad(fel.geometry.coordinates, info)
          }
        }

        // this.$nextTick(()=>{
        //   let mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(that.geometries)
        //   let mesh = new THREE.Mesh(mergeGeometry, that.MAT_BUILDING)
        //   that.scene.add(mesh)
        // })
      })
    },

    // Render building by geojson->geometry->coordinates points data, a set 2-d array
    addBuilding(d, info, height=1){

      // default value for height
      if(!height) height = 1
      
      // Loop for all nodes
      for(let i=0;i<d.length;i++){

        let el = d[i]

        let geometry = BuildModels.GenBuilding(el, this.Center, height)

        // Adjust geometry rotation
        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        // Push to array ready for merge
        //this.geometries.push(geometry)
        let mesh = new THREE.Mesh(geometry, this.MAT_BUILDING)
        this.scene.add(mesh)

        // Add Helper for user interaction
        let helper = BuildModels.GenHelper(geometry)

        // Attach info
        helper.name = info["name"] ? info["name"] : "Building"
        helper.infoType = "Building"
        helper.info = info

        this.Collider_Building.push(helper)
        //this.scene.add( helper )

      }
    },

    addRoad(d, info){

      // Init points array
      let points = []

      // Loop for all nodes
      for(let i=0;i<d.length;i++){
        
        if(!d[0][1]) return
        
        let el = d[i]

        //Just in case
        if(!el[0] || !el[1]) return
        
        let elp = [el[0], el[1]]

        //convert position from the center position
        elp = ThreeBasic.GPSRelativePosition([elp[0], elp[1]], this.Center)
        
        // Draw Line
        points.push( new THREE.Vector3( elp[0], 0.1, elp[1] ) )
      }

      let geometry = new THREE.BufferGeometry().setFromPoints( points )

      // Adjust geometry rotation
      geometry.rotateZ(Math.PI)

      let line = new THREE.Line( geometry, this.MAT_ROAD )
      line.info = info
      this.iR_Road.add(line)

      // Adjust position
      //let finalPosi = ThreeBasic.GPSRelativePosition([d[parseInt(d.length / 2)][1], d[parseInt(d.length / 2)][0]], this.Center)
      line.position = new THREE.Vector3(line.position.x, 0.1, line.position.z)

      // Calculate Real Position
      let realPosi = ThreeBasic.GPSRelativePosition([d[parseInt(d.length / 2)][0], d[parseInt(d.length / 2)][1]], this.Center)
      line.realPosi = new THREE.Vector3(realPosi[0], line.position.y, realPosi[1])

      // Disable matrix auto update for performance
      line.matrixAutoUpdate = false
      line.updateMatrix()

      return
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

          light.castShadow = false

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

    // Switch Room
    // 点击房间
    SelectBuilding (obj) {

      // If None selected
      if(!this.Selected || this.Selected["id"] != obj["id"]){
        // Save selected
        this.Selected = obj.id

        // Remove others
        this.RemoveAllDots()

        // Push to point array (allow multiple in principle)
        let arr = []
        arr.push(obj)

        // Create Dots
        this.LoadAllDots(this.camera, arr)
        return
      }

      // If Same as last one
      else if(this.Selected["id"] == obj["id"]) {
        this.Selected = null
        this.RemoveAllDots()
        return
      }

      else {
        this.RemoveAllDots()
        return
      }
    },

    // 加载所有的信息锚点
    LoadAllDots (ca, obj){
        for(var i = 0; i < obj.length; i++){
            var thisDot = obj[i]
            this.allDots.push(thisDot)
            this.allDotsEl.push(this.addDot(thisDot, ca))
        }
        return
    },

    // 添加单个信息锚点
    addDot (infoObj, ca) {

      /* CREATE IN 2D*/
      let d = ThreeBasic.Draw2DDot(ca, infoObj, this.renderer.domElement).el
      document.getElementById('building-info').appendChild(d)

      if(infoObj.position.x > 0){
          d.appendChild(ThreeBasic.Draw2DText(-(infoObj.name.length * 9), 16, 0, 'center', infoObj.name))
      }else{
          d.appendChild(ThreeBasic.Draw2DText(-(infoObj.name.length * 9), 16, 180, 'center', infoObj.name))
      }
      
      return d
        
    },

    // 更新所有信息锚点，在animate()函数中循环fire
    UpdateDots (ca, obj) {
      if(!obj){
        return
      }

      let canvas = this.renderer.domElement
      let thisDot, dotPosi, x, y,deg

      for(let i = 0; i < obj.length; i++){
          thisDot = obj[i]
          dotPosi = ThreeBasic.WorldToScreenPosi(ca, thisDot)
          x = Math.round(( 0.5 + dotPosi.x / 2 ) * ( canvas.width / window.devicePixelRatio ))
          y = Math.round(( 0.5 + -(dotPosi.y) / 2 ) * ( canvas.height / window.devicePixelRatio ))

          deg = -180

          // if(thisDot.position.x<0){
          //   deg = -180
          // }else{
          //   deg = -180
          // }

          this.allDotsEl[i].style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px) rotate(' + deg + 'deg)'
          
      }
      return
    },

    // 移除所有信息锚点
    RemoveAllDots() {
        this.allDots.length = 0
        this.allDotsEl.length = 0
        document.getElementById('building-info').innerHTML = ""
    },

    // 2D画布上点击，返回选中的目标
    // 向屏幕发射一条射线，返回触碰到的所有物体，返回第一个物体
    checkIntersection(pointer) {

        this.raycaster.setFromCamera( pointer, this.camera )
        
        let intersects = this.raycaster.intersectObjects( this.Collider_Building , true )
        if ( intersects.length > 0 ) {
          let selectedObject = intersects[0].object
          return selectedObject
        } else {
            return false
        }
    },


    /**
     * Void: Set selected object not transparent(== highlight) and others transparent
     * 反向设置透明，（仅IsolateObj，即被选中物体不透明，其他设置为透明）
     * 
     * @param {THREE.Group} group A group of objects
     * @param {THREE.Object3D} isolateObj object mean to be highlight
     * @param {Number} highlight highlight opacity value, default 1
     * @param {Number} others others opacity value, default .3
     * 
    */
    reverseTransObj (group, isolateObj, highlight=1, others=.3) {
      group = group.children

      if(!group){
          return
      }
      for(var i=0;i<group.length;i++){

        if(group[i].name == isolateObj.name){
          this.setObjectTransparent(group[i], highlight, false)
          this.setObjShadow(group[i], true)
        } else {
          this.setObjectTransparent(group[i], others, true)
          this.setObjShadow(group[i], false)
        }
      }
    },

    // Void: All back to normal from reverse transparent
    // 反向设置透明，（仅IsolateObj，即被选中物体不透明，其他设置为透明）
    recoverTransObj (group, opa=1) {
      group = group.children

      if(!group){
          return
      }
      for(var i=0;i<group.length;i++){
        this.setObjectTransparent(group[i], 1, false)
        this.setObjShadow(group[i], true)
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
