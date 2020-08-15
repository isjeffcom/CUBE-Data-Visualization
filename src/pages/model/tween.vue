<template>
    <div id="ani_tween">
        <div id="cont"></div>
    </div>
</template>

<script>
import * as THREE from 'three'
import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'

export default {
    name: "ani_tween",
    data(){
        return{
            C: null,
            Center: {latitude: 55.943686, longitude: -3.188822}, // EDI
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
                scale: 10,
                camera:{
                    position: {x: 6, y: 14, z: 6}
                }
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            // Load Edinburgh Buildings
            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "ed_buildings").Buildings({merge: true})
            this.C.Add(buildings)

            // Load model, attach light and add animation
            let posi = new CUBE.Coordinate("GPS", {latitude: 55.942867, longitude: -3.186062, altitude: 3}).ComputeWorldCoordinate()
            let m = new CUBE.Model(posi.world)
            
            m.LoadGLTF('./assets/models/satellite/scene.gltf').then(()=>{
                let light = new THREE.DirectionalLight(0xffffff, 1)
                light.position.set(1, 1, 1)

                m.Attach(light)

                this.C.Add(m.object)

                let mAni = new CUBE.Animation("test", m.object, "tween", {repeat: true}).GPSPath(this.path, 4000)
                this.C.GetAniEngine().Register(mAni)

            })



            

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>