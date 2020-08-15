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
                scale: .002
            })

            // Add Geojson Map Layer
            let china = await (await Request.AsyncGet('./assets/geo/china.geojson')).json()
            this.C.Add(new CUBE.GeoJsonLayer(china, "china").AdministrativeMap({border: true, height: .5}))


        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>