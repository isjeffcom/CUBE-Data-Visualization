<template>
    <div id="coretest">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
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
            dem_bbox: {
                "east": {
                    "latitude": 55.943659895856825,
                    "longitude": -3.1085265344946214
                },
                "north": {
                    "latitude": 55.98865208029593,
                    "longitude": -3.1888220000000005
                },
                "south": {
                    "latitude": 55.89871991970406,
                    "longitude": -3.1888220000000005
                },
                "west": {
                    "latitude": 55.943659895856825,
                    "longitude": -3.2691174655053783
                }
            }
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
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 10
            })

            //this.C.Add(new CUBE.Shapes().Box())

            // this.C.AddGroup("England")
            // let england = await Request.AsyncGet('./assets/geo/china.geojson').json()
            // this.C.Add(new CUBE.GeoJsonLayer(england, "england").AdministrativeMap({border: true, height: 2}))

            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "edinburgh_building").Buildings({merge: true})
            this.C.Add(buildings)

            let arr = [
                {name: "a", location: { latitude: 55.953335, longitude: -3.189127 }},
                {name: "b", location: { latitude: 55.954579, longitude: -3.187315 }},
                {name: "c", location: { latitude: 55.956385, longitude: -3.186543 }}
            ]

            let cloud = new CUBE.Datasets("cloud", arr).PointCloud()
            this.C.Add(cloud)

            // let edt = await Request.AsyncGet('./assets/geo/project/terrain.tif')
            // edt = await edt.arrayBuffer()
            // let terrain = await new CUBE.Terrain(edt, "edinburgh_terrain", this.dem_bbox).GeoTiff()
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