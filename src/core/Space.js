import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DefaultConfig } from './static/Config.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import merge from 'deepmerge'
import { Clone } from '../utils/Clone'

// Global Config
import './static/Global'
/**
 * @class Main constructor, provides main space runtime, allow limited config, insert animation engine and shader engine
 * @param container DOM Element, DOM <div> element for render
 * @param center GPSCoordinate(), Geolocation center
 * @public
*/

export class Space {
    constructor(container, opt){

        // Update Global Config
        window.CUBE_GLOBAL.CENTER = opt.center ? Clone(opt.center) : window.CUBE_GLOBAL.CENTER
        window.CUBE_GLOBAL.MAP_SCALE = opt.scale ? opt.scale : window.CUBE_GLOBAL.MAP_SCALE

        // Merge or overwrite options 
        let DefaultOptions = DefaultConfig()
        let options = opt ? merge(DefaultOptions, opt) : DefaultOptions

        // Map Center 
        this.center = options.center

        // Init Clock
        this.clock = new THREE.Clock()

        // Init Camera
        this.camera = new THREE.PerspectiveCamera(25, window.clientWidth/window.clientHeight, 1, 200)
        this.camera.position.set( options.camera.position.x, options.camera.position.y, options.camera.position.z )
        this.camera.name = options.camera.name ? options.camera.name : "Main-Camera"

        // Init Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color( parseInt("0x" + options.background))
        if(options.fog.enabled){
            this.scene.fog = new THREE.Fog( parseInt("0x" + options.fog.color), options.fog.near, options.fog.far )
        }

        // Init Light
        this.LoadLights(options.lights)

        // Init Ray Caster
        this.raycaster = new THREE.Raycaster()

        // Init render
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.shadowMap.enabled = true
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        // Print render result to canvas container
        container.appendChild(this.renderer.domElement)


        // Init Control
        this.controls = new MapControls( this.camera, this.renderer.domElement )
        this.controls.rotateSpeed = options.controls.rotateSpeed || 0.7 
        this.controls.enableDamping = options.controls.damping.enabled || true 
        this.controls.dampingFactor = options.controls.damping.factor || .25
        this.controls.minDistance = options.controls.minDistance || 10 
        this.controls.maxDistance = options.controls.maxDistance || 1000 
        
        // Auto Rotation
        this.controls.autoRotate = options.controls.autoRotate.enabled || false 
        this.controls.autoRotateSpeed = options.controls.autoRotate.speed || 1

        // Init Controls Update
        this.controls.update()

        //this.controls.addEventListener( 'change', this.Update() ); 

        // Debug Mode 
        // 调试模式
        if(options.debug){
            this.stats = new Stats()
            container.appendChild( this.stats.dom )
        }
    }

    Runtime(){
        this.delta = this.clock.getDelta()
        this.time += this.delta

        this.renderer.render(this.scene, this.camera)
        this.controls.update()

        if(this.AniEngine) this.AniEngine.Update()
        if(this.ShaderEngine) this.ShaderEngine.Update()
        
        this.stats.update()
    }

    // Add and 3D Object to a group 添加一个3D物体进入场景
    Add(object3D, group){

        if(!group) group = this.scene

        // Support add to group by group name, add to scene if doesn't existed
        // 支持由组名搜索，如果组不存在则加到scene根层级中

        if(typeof group == "string"){
            group = this.FindGroup(group)
            group = group ? group : this.scene
        }

        group.add(object3D)
        return object3D
    }

    // Add a group 添加组
    AddGroup(name){
        
        let group = new THREE.Group()
        group.name = name
        this.scene.add(group)
        return group
    }

    // Find a group 找到组
    FindGroup(name){

        let res = null
        let groups = this.scene.children

        for(let i=0;i<groups.length;i++){
            if(groups[i].name == name){
                res = groups[i]
            }
        }

        return res
    }

    GetCenter(){
        return this.center
    }

    GetScene(){
        return this.scene
    }

    GetAniEngine(){
        return this.AniEngine
    }

    SetAniEngine(aniEngine){
        this.AniEngine = aniEngine
    }

    GetShaderEngine(){
        return this.ShaderEngine
    }

    SetShaderEngine(shaderEngine){
        this.ShaderEngine = shaderEngine
    }

    // Init lights 初始化灯光
    LoadLights(lights){

        lights.forEach(el => {

            let light
        
            if(el.type == "Ambient"){
                light = new THREE.AmbientLight ( new THREE.Color(parseInt("0x" + el.color)) , el.opacity)
            }

            else if(el.type == "Point") {
                light = new THREE.PointLight( new THREE.Color(parseInt("0x" + el.color)), el.opacity)
                light.position.set(el.position.x, el.position.y, el.position.z)
            }

            light.castShadow = false

            light.name = el.name
            
            this.scene.add(light)
        })
        
    }

    WindowResize(window){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( window.innerWidth, window.innerHeight )
    }
}