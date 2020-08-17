<template>
    <div id="porto">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'

export default {
    name: "porto",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            Center: {latitude: 41.157937, longitude: -8.629108}, // porto
        }
    },
    mounted(){
        this.Init()
        this.Update()

        // Add event listener for window resize
        window.addEventListener( 'resize', this.C.WindowResize(window), false )
    },
    methods: {
        Init(){
            let container = document.getElementById('cont')

            // Init CUBE Instance
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 10
            })

            //Add a basic box with wgs84 coordinate
            let posi = new CUBE.Coordinate("GPS", {latitude: 41.157937, longitude: -8.629108}).ComputeWorldCoordinate()
            this.C.Add(new CUBE.Shapes("Box", posi.world).Box(1))

            // Add Sphere
            this.C.Add(new CUBE.Shapes("Sphere", {x: 2, y: 0, z: 2}).Sphere(1, 0x00ffff))
            this.C.Add(new CUBE.Shapes("Cylinder", {x: -2, y: 0, z: -2}).Cylinder(1, 0xff0000))

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>