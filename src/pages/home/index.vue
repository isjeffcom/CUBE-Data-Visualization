<template>
    <div id="home">
        <space 
            :Center="CONF_CENTER"
            :GC_BUILDING="CONF_BUILDING"
            :GC_ROAD="CONF_ROAD"
            :GC_WATER="CONF_WATER"
            :GC_TERRAIN="CONF_TERRAIN"
            :BBOX_DEM="BBOX_DEM"
            :BBOX_GEO="BBOX_GEO"
            v-if="loaded">
        </space>
    </div>
</template>

<script>
import Request from '../../utils/Request'
import space from "../../components/space"

export default {
    name: "home",
    components: {
        space
    },
    data(){
        return{
            loaded: false,

            api: "/single",
            
            CONF_CENTER:"",
            CONF_BUILDING: "",
            CONF_WATER: "",
            CONF_ROAD: "",
            CONF_TERRAIN: "",
            BBOX_DEM: "",
            BBOX_GEO: "",
        }
    },
    created(){
        const STATIC_PATH="/assets/projects/"
        let pname = this.$route.query["project"]
        //console.log(Request.GetBase())
        if(pname){
            Request.Get(this.api, {name: pname},false, (res)=>{
                if(res.status){
                    if(res.data){
                        let that = this
                        this.CONF_CENTER = res.data['center']
                        this.CONF_BUILDING = STATIC_PATH + pname + '/building.geojson'
                        this.CONF_WATER = STATIC_PATH + pname + '/water.geojson'
                        this.CONF_ROAD = STATIC_PATH + pname + '/highway.geojson'
                        this.CONF_TERRAIN = STATIC_PATH + pname + '/terrain.tif'

                        if(res.data['dem_bbox'][0]) {
                            this.BBOX_DEM = res.data['dem_bbox'][0]
                            this.BBOX_GEO = res.data['geo_bbox'][0]
                        } else {
                            this.BBOX_DEM = res.data['dem_bbox']
                            this.BBOX_GEO = res.data['geo_bbox']
                        }
                        
                        this.$nextTick(()=>{
                            that.loaded = true
                        })
                        
                        //this.$router.push({name: "home", params:{pinfo: res.data, path: Request.GetBase() + STATIC_PATH + pname}})
                    }else{
                        alert("Project not existed")
                    }
                }else{
                    alert("Internet connection lost")
                }
            })
        }
    }
}
</script>

<style scoped>
#home{
    position: absolute;
    height: 100%;
    width: 100%;
}
</style>