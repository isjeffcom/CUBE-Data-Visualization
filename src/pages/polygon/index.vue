<template>
    <div id="coretest">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'

export default {
    name: "coretest",
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
                camera:{
                    position: {x: 6, y:10, z:6}
                }
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            // // Add a ground
            let ground = new CUBE.Terrain().Ground(800, 800, 8)
            this.C.Add(ground)
            ground.position.y = -2.4

            // NYC NAT MAP
            let nyc = await (await Request.AsyncGet('./assets/geo/nyc/manhattan.geojson')).json()
            let nyc_geo = new CUBE.GeoJsonLayer(nyc, "manhattan").AdministrativeMap({border: true, height: .5})
            this.C.Add(nyc_geo)
            nyc_geo.position.y = -1.5

            // NYC NAT MAP

            let poverty = await (await Request.AsyncGet('./assets/geo/nyc/poverty.json')).json()
            poverty.forEach(area => {
                let color
                if(area.val >= 20) color = 0x826040
                if(area.val >= 10 && area.val < 20) color = 0x698240
                if(area.val < 10) color = 0xAA752A

                const amesh = new CUBE.Polygon(area.code, area.polygon).Ground({code: area.code, val: area.val}, {color: color, height: .5})
                this.C.Add(amesh)
                amesh.position.y = -1
            })
            



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