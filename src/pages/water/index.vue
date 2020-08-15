<template>
    <div id="water">
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
//import { Coordinate } from '../../core/coordinate/Coordinate'

export default {
    name: "water",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            Center: {latitude: "40.760366", longitude: "-73.983888"}, // NYC
            
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
                scale: 1,
                camera: {
                    x: 20,
                    y: 8,
                    z: 20
                }
            })

            // NYC NAT MAP
            let nyc = await (await Request.AsyncGet('./assets/geo/nyc/nta.geojson')).json()
            let nyc_geo = new CUBE.GeoJsonLayer(nyc, "nyc").AdministrativeMap({border: true, height: 2})
            this.C.Add(nyc_geo)
            nyc_geo.position.y = -2.8
            this.nycGround = nyc_geo

            let waterData = await (await Request.AsyncGet('./assets/geo/nyc/water.geojson')).json()
            let water = new CUBE.GeoJsonLayer(waterData, "nyc_water").Water({merge: true})
            this.C.Add(water)
            water.position.y = -1

            let seaData = await (await Request.AsyncGet('./assets/geo/nyc/sea.geojson')).json()
            let sea = new CUBE.GeoJsonLayer(seaData, "nyc_sea").Water({merge: true})
            this.C.Add(sea)
            sea.position.y = -1

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>