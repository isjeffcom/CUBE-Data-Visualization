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
            Center: { latitude: 34.654818, longitude: 103.673262 },
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
            this.C = new CUBE.Space(container, {background: "fafafa", center: this.Center, scale: .01})

            this.C.Add(new CUBE.Shapes().Box())

            this.C.AddGroup("England")
            let england = await Request.AsyncGet('./assets/geo/china.geojson')
            this.C.Add(new CUBE.GeoJsonLayer(england, "england", this.Center).AdministrativeMap({border: true, height: 2}))
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