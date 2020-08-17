<template>
    <div id="coretest">
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
    name: "coretest",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            Center: {latitude: "40.760366", longitude: "-73.983888"}, // NYC
            taxiData: [],
            currentTaxiDate: "2020-05-25",
            taxisDate: [
                "2020-05-25",
                "2020-05-26",
                "2020-05-27",
                "2020-05-28",
                "2020-05-29",
                "2020-05-30"
            ],
            nycGround: null,
            activeAni: null,
            polyArr: [],
            provertyOpen: true,
            taxiMaterial: null
            
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

            // Add a ground
            let ground = new CUBE.Terrain().Ground(800, 800, 8)
            this.C.Add(ground)
            ground.position.y = -3

            // Custom
            let island = await (await Request.AsyncGet('./assets/geo/cubemark.json')).json()
            let custom = new CUBE.GeoJsonLayer("island", island).Polygon({merge: true})
            this.C.Add(custom)

            // NYC NAT MAP
            let nyc = await (await Request.AsyncGet('./assets/geo/nyc/nta.geojson')).json()
            let nyc_geo = new CUBE.GeoJsonLayer("nyc", nyc).AdministrativeMap({border: true, height: 2})
            this.C.Add(nyc_geo)
            nyc_geo.position.y = -2.8
            this.nycGround = nyc_geo

        },


        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>