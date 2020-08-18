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
        }
    },
    mounted(){
        this.Init()
        this.Update()
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

            // Process Data
            let population = await (await Request.AsyncGet('./assets/geo/nyc/pop.json')).json()
            let pop = []
            for(let i=0;i<population.length;i++){
                pop.push({location: population[i].center, val: population[i].val / 550})
            }

            // Main Code
            let heat = new CUBE.Datasets("population", pop).Heatmap(70, 2.5)
            this.C.Add(heat)
            heat.position.set(0, 10, 0)
            this.C.GetShaderEngine().Register(heat.children[0], "uniforms", "heightColor", {max: 2, min: 1, step: 0.004})
            

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>