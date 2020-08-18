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
            let china = await (await Request.AsyncGet('./assets/geo/china.geojson')).json()
            this.C.Add(new CUBE.GeoJsonLayer("china", china).AdministrativeMap({border: true, height: .5}))
            
            // Example datasets
            const greaterBayGDP = [
                {name: "HongKong", coor: {latitude: 22.319349, longitude:  114.169437}, val: 285},
                {name: "ShenZhen", coor: {latitude: 22.540368, longitude: 113.934476}, val: 229},
                {name: "DongGuan", coor: {latitude: 23.020272, longitude: 113.751685}, val: 94.8},
                {name: "GuangZhou", coor: {latitude: 23.127405, longitude: 113.264323}, val: 236},
                {name: "FoShan", coor: {latitude: 23.021804, longitude: 113.122012}, val: 99.7},
                {name: "ZhongShan", coor: {latitude: 22.516968, longitude: 113.392800}, val: 36.3},
                {name: "JiangMen", coor: {latitude: 22.579459, longitude: 113.083074}, val: 31.4},
                {name: "ZhuHai", coor: {latitude: 22.270696, longitude: 113.577136}, val: 34.3},
                {name: "Macau", coor: {latitude: 22.198107, longitude: 113.543553}, val: 38.8},
                {name: "HuiZhou", coor: {latitude: 23.112448, longitude: 114.415631}, val: 41}
            ]

            // Generate All Cylinder
            greaterBayGDP.forEach(city => {
                let cylinder = new CUBE.Data(city.name).Cylinder(city.coor, city.val * 1.6, 20, .5, 0xff6600)
                this.C.Add(cylinder)
            })

            // Example for bar
            const shanghai = {latitude: 31.230689, longitude: 121.473723}
            const bar = new CUBE.Data("shanghai").Bar(shanghai, 150, 40, .5, 0xff6600)
            this.C.Add(bar)
            

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>