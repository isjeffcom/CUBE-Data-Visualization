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
//import { Coordinate } from '../../core/coordinate/Coordinate'

export default {
    name: "porto",
    props: {
        // Config Address
        
    },
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
            let container = document.getElementById('cont')

            // Init CUBE Instance
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 10
            })

            //Point cloud layer
            let arr = [
                {name: "a", location: { latitude: 55.953335, longitude: -3.189127 }},
                {name: "b", location: { latitude: 55.954579, longitude: -3.187315 }},
                {name: "c", location: { latitude: 55.956385, longitude: -3.186543 }}
            ]

            let cloud = new CUBE.Datasets("cloud", arr).PointCloud()
            this.C.Add(cloud)

            

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>