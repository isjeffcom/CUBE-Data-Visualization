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
import { Water } from 'three/examples/jsm/objects/Water'

//import ui from '../ui'

import ThreeBasic from '../../utils/ThreeBasic'
import BuildModels from '../../utils/BuildModels'
import Coordinate from '../../utils/Coordinate'
import Request from '../../utils/Request'
import { Vector3 } from 'three'

import { getCenter } from 'geolib'

import * as GeoTIFF from "geotiff"

export default {
  name: 'space',
  props: {
    // Config Address
    //conf_Lights: {type: String, value: "./assets/config/lights.json"},
    Center: {type: Object, value: ""},
    GC_BUILDING: {type: String, value: ""},
    GC_ROAD: {type: String, value: ""},
    GC_WATER: {type: String, value: "."},
    GC_TERRAIN: {type: String, value: ""},
    BBOX_DEM: null,
    BBOX_GEO: null,
  },
  data(){
    return{

      // ENV
      publicPath: process.env.BASE_URL,

      // Map
      //Center: { longitude: -3.188822, latitude: 55.943686 },

      // Debug
      stats: null,

      // Flags
      FLAG_ROAD_ANI: true,

      // 3D Space
      clock: 0,
      time: 0,
      delta: 0,
      scene: null,
      renderer: null,
      camera: null,
      controls: null,
      ground: null,
      raycaster: null,
      loadManager: null,
      sun: null, // a light object

      // 3D Groups
      iR: null,
      iR_Building: null,
      iR_Road: null,
      iR_Line: null,
      iR_Water: null,

      // Terrain Data
      terrainData: null,

      // Information Colliders
      Collider_Building: [],

      // Aniamted Line
      //Animated_Lines: [],
      Animated_Line_Speed: 0.005,
      Animated_Line_Distances: [],

      //Animated_Line_ASpeed: THREE.Math.degToRad(20),
      
      // Test
      geometries: [],

      // 2D UI
      allDots:[],
      allDotsEl:[],

      // 3D Object
      MAT_BUILDING: null,
      MAT_ROAD: null,
      MAT_ANI_ROAD: null,
      MAT_WATER: null,
      MAT_WATER_NORMAL: null,

      // Current UI Reactive Vars
      Selected: null,

      // Config Address
      conf_Lights: "./assets/config/lights.json",
      // GC_BUILDING: "./assets/geo/test/building.geojson",
      // GC_ROAD: "./assets/geo/test/highway.geojson",
      // GC_WATER: "./assets/geo/test/water.geojson",
      // GC_TERRAIN: "./assets/geo/test/terrain.tif",
      // conf_GeoJSON: "./assets/geo/edinburgh_road.geojson",

      // BBOX
      // BBOX_DIS_DEM: 5000,
      // BBOX_DIS_GEO: 1000,
      
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

      // Init iR
      this.iR = ThreeBasic.AddGroup("iR", "Interactive-Root")
      this.iR_Building = ThreeBasic.AddGroup("IRB", "IR_Building")
      this.iR_Road = ThreeBasic.AddGroup("IRR", "IR_Road")
      this.iR_Line = ThreeBasic.AddGroup("IRL", "IR_Line")
      this.iR_Water = ThreeBasic.AddGroup("IRW", "IR_Water")

      // Sprate building and roads root
      this.$nextTick(()=>{
          this.iR.add(this.iR_Building)
          this.iR.add(this.iR_Road)
          this.iR.add(this.iR_Line)
          this.iR.add(this.iR_Water)
      })

      this.scene.add(this.iR)

      // Start
      this.LoadTerrain(this.GC_TERRAIN)
      

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

      this.UpdateAniLines()
      //this.UpdateWater()

      this.stats.update()
      // Triangles faces count
      //console.log(this.renderer.info.render.triangles)
    },

    addAnimatedLine(geometry, length){
      let animatedLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0x00FFFF }))
      animatedLine.material.transparent = true
      //animatedLine.position.y = 8
      animatedLine.material.dashSize = 0
      animatedLine.material.gapSize = 1000

      this.Animated_Line_Distances.push(length)

      return animatedLine

    },

    UpdateAniLines(){
      // If no animated line than do nothing
      if(this.iR_Line.children.length <= 0) return


      for(let i=0;i<this.iR_Line.children.length;i++){
        let line = this.iR_Line.children[i]

        let dash = parseInt(line.material.dashSize)
        let length = parseInt(this.Animated_Line_Distances[i])


        if (dash > length) {
          //console.log("b")
          line.material.dashSize = 0
          line.material.opacity = 1
        } else {
          //console.log("a")
          line.material.dashSize += this.Animated_Line_Speed
          line.material.opacity = line.material.opacity > 0 ? line.material.opacity - 0.002 : 0
        }
      }
    },


    async LoadTerrain(api){
      
      const rawTiff  = await GeoTIFF.fromUrl(Request.GetBase() + api)
      const tifImage = await rawTiff.getImage()

      const start = {latitude: this.BBOX_DEM.south.latitude, longitude: this.BBOX_DEM.west.longitude}
      const end = {latitude: this.BBOX_DEM.north.latitude, longitude: this.BBOX_DEM.east.longitude}

      let leftBottom = ThreeBasic.GPSRelativePosition(start, this.Center)
      let rightTop = ThreeBasic.GPSRelativePosition(end, this.Center)
      
      // Offset from center position
      let x = Math.abs(leftBottom[0] - rightTop[0])
      let y = Math.abs(leftBottom[1] - rightTop[1])


      // Initial plane geometry
      const geometry = new THREE.PlaneGeometry(
        x,
        y,
        x - 1,
        y - 1
      )

      // Read image pixel values that each pixel corresponding a height
      const data = await tifImage.readRasters({ width: Math.floor(x), height: Math.floor(y), resampleMethod: 'bilinear', interleave: true })

      // Fill z values of the geometry
      for(let i=0;i<data.length;i++){
        let el = data[i]

        if(geometry.vertices[i]){
          geometry.vertices[i].z = (el/30)
        } 
      }

      //geometry.verticesNeedUpdate = true

      // Rotate
      geometry.rotateX(Math.PI / 2)
      geometry.rotateY(Math.PI)
      geometry.rotateZ(Math.PI)


      let texture = new THREE.TextureLoader().load("./assets/textures/terrain.jpg", (onload)=>{
        console.log(onload)
      }, null, (err)=>{
        console.log(err)
      })

      // Create a plane mesh
      let plane = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color: 0x333333, side: THREE.DoubleSide, wireframe: true}) )
      

      // Add to global Var
      this.ground = plane

      plane.position.y = -1.5

      this.scene.add(plane)

      plane.updateMatrixWorld()
      plane.updateMatrix()

      //console.log(geometry.vertices[0])

      this.terrainData = geometry
      //console.log(this.OptiTerrainData(geometry.vertices))
      
      this.LoadBuildings(this.GC_BUILDING)

    },

    // ReMapBuildingHeight(heightData){
    //   for(let i=0;i<this.iR_Building.length;i++){
    //     let el = this.iR_Building[i]
    //     //this.ShortEst(el.position, heightData)
    //   }
      
    // },

    // Load all building by geojson, this part can connect to the remote source for tile data
    LoadBuildings(api){

      let that = this

      // Create MAT
      this.MAT_BUILDING = new THREE.MeshPhongMaterial({transparent: true, opacity: 0.95})

      // Get geo json data
      Request.Get(api, {}, false, (res)=>{
        
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
          if(info["tags"]["building"]){
            // Render building
            this.addBuilding(fel.geometry.coordinates, info, info["tags"]["building:levels"])
          }
        }

        this.$nextTick(()=>{
          let mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(that.geometries)
          let mesh = new THREE.Mesh(mergeGeometry, that.MAT_BUILDING)
          mesh.position.y = -1
          that.scene.add(mesh)

          //that.LoadRoads(this.GC_ROAD)
        })
      })
    },

    LoadRoads(api){
          
      let that = this
      // Create MAT
      this.MAT_ROAD = new THREE.LineBasicMaterial( { color: 0x1B4686 } )
      this.MAT_ANI_ROAD = new THREE.LineDashedMaterial({ color: 0xff9900 })

      // Get geo json data
      Request.Get(api, {}, false, (res)=>{
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
          if(info["tags"]["highway"]){
            // Render Roads
            if(fel.geometry.type == "LineString" && info.tags.highway != "pedestrian" && info.tags.highway != "footway" && info.tags.highway != "path"){
              this.addRoad(fel.geometry.coordinates, info)
            }
            
          }
        }

      })
    },

    LoadWaters(api){
      
      this.MAT_WATER_NORMAL = new THREE.TextureLoader().load( './assets/textures/waternormals.png', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      })

      this.MAT_WATER = {
        textureWidth: .5,
        textureHeight: .5,
        waterNormals: this.MAT_WATER_NORMAL,
        alpha: 1.0,
        sunDirection: this.sun.position.clone().normalize(),
        sunColor: 0xDDEBFF,
        waterColor: 0xA6C8FA,
        distortionScale: 2,
        fog: this.scene.fog !== undefined
      }

      Request.Get(api, {}, false, (res)=>{
        let features = res.data.features
        
        for(let i=0;i<features.length;i++){
          let fel = features[i]
          if(!fel['properties']) return

          if(fel.properties['tags']['natural'] == "water" && fel.geometry.type == "Polygon"){
            this.addWater(fel.geometry.coordinates, fel.properties)
          }
        }
      })
    },

    addWater(d, info){
      let holes = []
      let shape, geometry
      
      for(let i=0;i<d.length;i++){
        let el = d[i]
        if(i==0){
          shape = BuildModels.GenShape(el, this.Center)
        } else {
          holes.push(BuildModels.GenShape(el, this.Center))
        }
      }

      // Punch a hole
      for(let h=0;h<holes.length;h++){
        shape.holes.push(holes[h])
      }

      geometry = BuildModels.GenWaterGeometry(shape, {
          curveSegments: 2,  // curves
          steps: 1, // subdividing segments
          depth: 0.01, // Height
          bevelEnabled: false // Bevel (round corner)
      })

      //geometry.rotation.x = - Math.PI / 2;

      // Adjust geometry rotation
      geometry.rotateX(Math.PI / 2)
      geometry.rotateZ(Math.PI)
      
      let water = new Water(geometry, this.MAT_WATER)

      this.iR_Water.add(water)
      
      
    },

    UpdateWater(){
      for(let i=0;i<this.iR_Water.children.length;i++){
        
        this.iR_Water.children[i].material.uniforms[ 'time' ].value += 1.0 / 700
      }

    },

    // Render building by geojson->geometry->coordinates points data, a set 2-d array
    addBuilding(d, info, height=1){

      // default value for height
      if(!height) height = 1

      let holes = []
      let shape, geometry
      
      // Loop for all nodes
      for(let i=0;i<d.length;i++){

        let el = d[i]
        
        // Main
        if(i == 0){
          shape = BuildModels.GenShape(el, this.Center)
        } 
        
        // Hole
        else {
          holes.push(BuildModels.GenShape(el, this.Center))
        }
      }

      // Punch a hole
      for(let h=0;h<holes.length;h++){
        shape.holes.push(holes[h])
      }
      
      // Extrude Shape to Geometry
      geometry = BuildModels.GenBuildingGeometry(shape, {
          curveSegments: 2,  // curves
          steps: 1, // subdividing segments
          depth: 0.05 * height, // Height
          bevelEnabled: false // Bevel (round corner)
      })
      
      // Adjust geometry rotation
      geometry.rotateX(Math.PI / 2)
      geometry.rotateZ(Math.PI)


      let realPosi = ThreeBasic.GPSRelativePosition({ latitude: d[0][0][1], longitude: d[0][0][0] }, this.Center)

      // WAIT FOR MERGE adjust height according to terrain data
      // Rotate
      var vector = new THREE.Vector3( realPosi[0], 0, realPosi[1] )
      var axis = new THREE.Vector3( 0, 0, 1 )
      var angle = Math.PI

      vector.applyAxisAngle( axis, angle )

      let dem = this.ShortEst({x: vector.x, z: vector.z}, this.terrainData.vertices)

      if(dem) {geometry.translate(0, dem.y, 0)}
      

      // Push to array ready for merge
      this.geometries.push(geometry)

      // Add Helper for user interaction
      let helper = BuildModels.GenHelper(geometry)
      if(helper){
        // Attach info
        helper.name = info["name"] ? info["name"] : "Building"
        helper.infoType = "Building"
        helper.info = info

        //this.scene.add(helper)

        this.Collider_Building.push(helper)
      }

      
    },

    

    ShortEst(target, arr){
      let resDis = 100000 // Save distance
      let res = false // default return

      for(let i=0;i<arr.length;i++){ // loop all terrain data
      
        let dis = Math.sqrt(Math.pow((target.x - arr[i].x), 2) + Math.pow((target.z - arr[i].z), 2)) // get distance from target distance to terrain geometry data
        if(dis <= resDis){ // if distance less than resDis
          resDis = dis // save new distance
          res = arr[i] // save terrain geometry data
        }
      }

      return res
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
        elp = ThreeBasic.GPSRelativePosition({latitude: elp[1], longitude: elp[0]}, this.Center)

         // WAIT FOR MERGE adjust height according to terrain data
        // Rotate
        var vector = new THREE.Vector3( elp[0], 0, elp[1] )
        var axis = new THREE.Vector3( 0, 0, 1 )
        var angle = Math.PI

        vector.applyAxisAngle( axis, angle )

        let dem = this.ShortEst({x: vector.x, z: vector.z}, this.terrainData.vertices)
        
        //console.log(dem.y)
        let y
        if(dem) {y = -dem.y} else {y = 0.5}
        
        // Draw Line
        points.push( new THREE.Vector3( elp[0], y + 1, elp[1] ) )
      }

      let geometry = new THREE.BufferGeometry().setFromPoints( points )

      // Adjust geometry rotation
      geometry.rotateZ(Math.PI)

      let line = new THREE.Line( geometry, this.MAT_ROAD )
      line.info = info
      line.computeLineDistances()
      this.iR_Road.add(line)

      if(this.FLAG_ROAD_ANI){
        let lineLength = geometry.attributes.lineDistance.array[ geometry.attributes.lineDistance.count - 1]
        if(lineLength > 0.8){
          let aniLine = this.addAnimatedLine(geometry, lineLength)
          //this.Animated_Lines.push(aniLine)
          this.iR_Line.add(aniLine)
        }
        
      }
      

      // Adjust position
      //let finalPosi = ThreeBasic.GPSRelativePosition([d[parseInt(d.length / 2)][1], d[parseInt(d.length / 2)][0]], this.Center)
      line.position = new THREE.Vector3(line.position.x, 0, line.position.z)

      // Calculate Real Position
      //let realPosi = ThreeBasic.GPSRelativePosition({lat: d[parseInt(d.length / 2)][1], lon: d[parseInt(d.length / 2)][0]}, this.Center)
      //line.realPosi = new THREE.Vector3(realPosi[0], line.position.y, realPosi[1])


      // Disable matrix auto update for performance
      line.matrixAutoUpdate = false
      line.updateMatrix()

      return
    },

    // Load All Lights
    LoadLights (api) {

      let that = this

      Request.Get(api, {}, true, (res)=>{
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

          light.name = el.name
          //console.log(light)
          
          that.scene.add(light)
        })
      })
    },

    // Load all Models
    LoadModels(api, group){
      Request.Get(api, {}, false, (res)=>{
        
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
