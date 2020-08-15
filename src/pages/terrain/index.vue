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
                scale: 10
            })

            // Buildings
            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "ed_buildings").Buildings({merge: true})
            this.C.Add(buildings)

            // Add terrain
            let edt = await Request.AsyncGet('./assets/geo/project/terrain.tif')
            edt = await edt.arrayBuffer()
            let terrain = await new CUBE.Terrain(edt, "edinburgh_terrain").GeoTiff()
            this.C.Add(terrain)

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>