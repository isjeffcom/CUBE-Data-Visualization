<template>
    <div id="porto">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'
//import { Coordinate } from '../../core/coordinate/Coordinate'

export default {
    name: "porto",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            Center: {latitude: 55.943686, longitude: -3.188822}, // EDI
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
                debug: true
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer("ed_buildings", ed).Buildings({merge: true})
            this.C.Add(buildings)

            // Road
            let roadData = await (await Request.AsyncGet('./assets/geo/project/highway.geojson')).json()
            let roads = new CUBE.GeoJsonLayer("ed_road", roadData).RoadSp({animation: true, animationEngine: aniEngine})
            this.C.Add(roads)
            roads.position.y = -1

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>