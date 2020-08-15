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
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            Center: {latitude: 34.710554, longitude: 103.699520}, // China
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
                scale: .002,
                camera: {
                    position: {x: 5, y: 5, z: 5}
                }
            })

            // Add Geojson Map Layer
            const china = await (await Request.AsyncGet('./assets/geo/china.geojson')).json()
            this.C.Add(new CUBE.GeoJsonLayer(china, "china").AdministrativeMap({border: true, height: .5}))
            
            // Defind wgs84 coors for 3 place
            // Remember to set y value for Arc as the administrative map has extruded 0.5 in height
            const shanghai = {latitude: 31.230689, longitude: 121.473723}
            const shenzhen = {latitude: 22.540368, longitude: 113.934476, altitude: .5}
            const beijing = {latitude: 39.907787, longitude: 116.397875}

            // Set arc lines
            const arc1 = new CUBE.Data("shanghaiToShenzhen").Arc(shanghai, shenzhen, 500, .5)
            const arc2 = new CUBE.Data("shanghaiToBeijing").Arc(shanghai, beijing, 500, 0) // you can either set yOffset value or change altitude value of the coordinate in this case
            const arc3 = new CUBE.Data("BeijingToShenzhen").Arc(beijing, shenzhen, 500, .5)

            // Add to scene
            this.C.Add(arc1)
            this.C.Add(arc2)
            this.C.Add(arc3)

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>