<template>
    <div id="coretest">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
import * as THREE from 'three'
import Request from '../../utils/Request'
//import { Coordinate } from '../../core/coordinate/Coordinate'

export default {
    name: "coretest",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            //Center: { latitude: 34.654818, longitude: 103.673262 },
            Center: {latitude: 55.943686, longitude: -3.188822},
            path: [
                {latitude: 55.942867, longitude: -3.186062},
                {latitude: 55.943104, longitude: -3.184601},
                {latitude: 55.943556, longitude: -3.184923},
                {latitude: 55.943879, longitude: -3.185246},
                {latitude: 55.944342, longitude: -3.185880}
            ]
        }
    },
    mounted(){
        this.Init()
        this.Update()

        // Add event listener for window resize
        window.addEventListener( 'resize', this.C.WindowResize(window), false )
    },
    methods: {
        async Init(){
            let container = document.getElementById('cont')

            // Init CUBE Instance
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 10
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            // Add a basic box
            this.C.Add(new CUBE.Shapes().Box())

            // Add Geojson Map Layer
            // this.C.AddGroup("china")
            // let china = await Request.AsyncGet('./assets/geo/china.geojson').json()
            // this.C.Add(new CUBE.GeoJsonLayer(china, "china").AdministrativeMap({border: true, height: 2}))

            // Add Geojson Building Layer
            // let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            // let buildings = new CUBE.GeoJsonLayer(ed, "edinburgh_building").Buildings({merge: true})
            // this.C.Add(buildings)

            // Load model, attach light and add animation
            // let posi = new CUBE.Coordinate("World", {x: 0, y: 6, z: 2})
            // let m = new CUBE.Model(posi)
            // m.LoadGLTF('./assets/models/satellite/scene.gltf').then(()=>{
            //     let light = new THREE.DirectionalLight(0xffffff, .8)
            //     light.position.set(0, 1, 0)

            //     m.Attach(light)

            //     this.C.Add(m.object)

            //     // let mAni = new CUBE.Animation("test", m.object, "tween", {repeat: true}).GPSPath(this.path, 4000)
            //     // this.C.GetAniEngine().Register(mAni)

            //     let mAni = new CUBE.Animation("test", m.object, "circular", {startNow: true, repeat: true})
            //     this.C.GetAniEngine().Register(mAni)
            // })

            // Add Bitmap Image as ground
            let map = new CUBE.BitmapLayer("main").TileMap()
            this.C.Add(map)

            // Point cloud layer
            // let arr = [
            //     {name: "a", location: { latitude: 55.953335, longitude: -3.189127 }},
            //     {name: "b", location: { latitude: 55.954579, longitude: -3.187315 }},
            //     {name: "c", location: { latitude: 55.956385, longitude: -3.186543 }}
            // ]

            // let cloud = new CUBE.Datasets("cloud", arr).PointCloud()
            // this.C.Add(cloud)

            
            // Add terrain
            // let edt = await Request.AsyncGet('./assets/geo/project/terrain.tif')
            // edt = await edt.arrayBuffer()
            // let terrain = await new CUBE.Terrain(edt, "edinburgh_terrain").GeoTiff()
            // this.C.Add(terrain)

        },

        AddModel(){
            let cube = new CUBE.Shapes().Box()
            this.C.Add(cube)
        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>