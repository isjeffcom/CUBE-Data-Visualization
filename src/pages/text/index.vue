<template>
    <div id="heatmap">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'

export default {
    name: "heatmap",
    data(){
        return{
            C: null,
            Center: {latitude: 40.760366, longitude: -73.983888}, // NYC
            txt: null,
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
                scale: 5,
                camera:{
                    position: {x: 0, y: 8, z: 20}
                }
            })

            let shaderEngine = new CUBE.ShaderEngine(this.C)
            this.C.SetShaderEngine(shaderEngine)

            // NYC NAT MAP
            let nyc = await (await Request.AsyncGet('./assets/geo/nyc/manhattan.geojson')).json()
            let nyc_geo = new CUBE.GeoJsonLayer("nyc", nyc).AdministrativeMap({border: true, height: 2})
            this.C.Add(nyc_geo)
            nyc_geo.position.y = 0

            // Add Text
            let txt = new CUBE.Data().Text({latitude: 40.760366, longitude: -73.983888}, "New York", 5)
            txt.position.set(0,6,6)
            this.C.Add(txt)
            this.C.SetLookAt(txt)

        },

        Update(){
            requestAnimationFrame(this.Update)
            //if(this.txt) this.txt.lookAt(this.C.GetCamera().position)
            
            this.C.Runtime()
            
        }
    }
}
</script>