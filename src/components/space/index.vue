<template>
    <div id="space">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'

export default {
    name: "space",
    props: {
        // Config Address
        //conf_Lights: {type: String, value: "./assets/config/lights.json"},
        Center: {type: Object, value: ""},
        GC_BUILDING: {type: String, value: ""},
        GC_ROAD: {type: String, value: ""},
        GC_WATER: {type: String, value: "."},
        GC_TERRAIN: {type: String, value: ""},
        BBOX_DEM: null,
        BBOX_GEO: null,
    },
    data(){
        return{
            C: null
        }
    },
    mounted(){
        this.Init()
        this.Update()
    },
    methods: {
        Init(){
            let container = document.getElementById('cont')
            this.C = new CUBE.Scene(container, this.Center, {background: "fafafa"})

            this.C.AddGroup("iR_Building")
        },

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>