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
    data(){
        return{
            C: null,
            Center: {latitude: 55.943686, longitude: -3.188822}, // EDI
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
                scale: 10,
                camera:{
                    position: {x: 6, y: 10, z: 6}
                }
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            // Load Edinburgh Buildings
            let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer("ed_buildings", ed).Buildings({merge: true})
            this.C.Add(buildings)

            // Load model, attach light and add animation
            let posi = new CUBE.Coordinate("World", {x: 0, y: 6, z: 2})
            let m = new CUBE.Model(posi)
            m.LoadGLTF('./assets/models/satellite/scene.gltf').then(()=>{
                let light = new this.C.three.DirectionalLight(0xffffff, 1)
                light.position.set(0, 1, 0)

                m.Attach(light)

                this.C.Add(m.object)

                let mAni = new CUBE.Animation("test", m.object, "circular", {startNow: true, repeat: true}).Circular(1,1)
                this.C.GetAniEngine().Register(mAni)

            })



            

        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>