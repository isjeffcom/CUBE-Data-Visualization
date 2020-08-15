<template>
    <div id="porto">
        <div id="cont"></div>
    </div>
</template>

<style scoped>
#date-selector{
    position: fixed;
    bottom: 5%;
    display:flex;
}

.ds-single{
    color: #000;
    cursor: pointer;
}
</style>

<script>

import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'
import * as THREE from 'three'

export default {
    name: "porto",
    props: {
        // Config Address
        
        
        
    },
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
                    position: {x: 6, y: 10, z: 6}
                }
            })

            // Load Edinburgh Buildings
            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "ed_buildings").Buildings({merge: true})
            this.C.Add(buildings)

            // Load model
            let posi = new CUBE.Coordinate("GPS", {latitude: 55.943686, longitude: -3.188822, altitude: 3}).ComputeWorldCoordinate()
            let m = new CUBE.Model(posi.world)
            m.LoadGLTF('./assets/models/satellite/scene.gltf').then(()=>{
                let light = new THREE.DirectionalLight(0xffffff, 1)
                light.position.set(2, 2, 2)
                m.Attach(light)
                this.C.Add(m.object)
            })

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>