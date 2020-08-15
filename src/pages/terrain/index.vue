<template>
    <div id="porto">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'

export default {
    name: "porto",
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
            // Container
            let container = document.getElementById('cont')

            // Init CUBE Instance
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 5,
                camera: {
                    position: {x: 5, y: 5, z: 5}
                }
            })

            // Add terrain
            let edt = await Request.AsyncGet('./assets/geo/project/terrain.tif')
            let buf = await edt.arrayBuffer()
            let terrain = await new CUBE.Terrain("edinburgh_terrain").GeoTiff(buf)
            this.C.Add(terrain)

            // Buildings
            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "ed_buildings").Buildings({merge: true, color: 0xE5E5E5, terrain})
            this.C.Add(buildings)

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>