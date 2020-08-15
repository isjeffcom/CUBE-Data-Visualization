<template>
    <div id="projects">
        <div id="p-list">
            <div id="p-list-cont">
                <div class="p-single" v-for="item in allProjects" :key="item.name" v-on:click="toProject(item.name)">
                    <div class="p-single-img">
                        <img :src="'./assets/imgs/project_icon.png'" alt="">
                    </div>

                    <div class="p-single-text">{{item.name}}</div>
                </div>
            </div>

        </div>

        <div id="p-list-new">
            <button v-on:click="addNew">New</button>
        </div>

        <div id="p-new-win-overlay" v-if="UI_New" v-on:click="addNew"></div>

        <div id="p-new-win" v-if="UI_New">

            <div id="p-new-win-left">
                <div class="p-input-single">
                    <span style="font-size: 32px;">New Project</span>
                </div>

                <div class="p-input-single">
                    <span>Name: </span>
                    <input type="text" v-model="inputForm.name">
                </div>

                <div class="p-input-single">
                    <span>Latitude: </span>
                    <input type="number" v-model="inputForm.center.latitude">
                </div>

                <div class="p-input-single">
                    <span>Longitude: </span>
                    <input type="number" v-model="inputForm.center.longitude">
                </div>

                <div class="p-input-single">
                    <span>Terrain Range(Meter): </span>
                    <input type="number" v-model="inputForm.dem_dis">
                </div>

                <div class="p-input-single">
                    <span>Geo Information Range(Meter): </span>
                    <input type="number" v-model="inputForm.geo_dis">
                </div>

                <div class="p-input-single">
                    <button v-on:click="toPreview" style="margin-right: 10px;">Preview</button>
                    <button v-on:click="newProject">Create</button>
                </div>
            </div>

            <div id="p-new-win-right">
                <l-map
                    style="height: 80%; width: 100%"
                    :zoom="preview_map_zoom"
                    :center="preview_map_center"
                    @update:center="toPreview">

                    <l-tile-layer :url="preview_map_tile"></l-tile-layer>

                    <l-circle
                        :lat-lng="preview_map_center"
                        :radius="preview_map_geo_radius"
                        :color="preview_map_geo_circle.color"
                        :fillColor="preview_map_geo_circle.fillColor"
                    />

                    <l-circle
                        :lat-lng="preview_map_center"
                        :radius="preview_map_dem_radius"
                        :color="preview_map_dem_circle.color"
                        :fillColor="preview_map_dem_circle.fillColor"
                    />

                    <l-marker :lat-lng="preview_map_center" :icon="marker_icon()"></l-marker>
                </l-map>
            </div>

            
        </div>

        <div id="projects-loading-overlay" v-if="UI_Creating">
            <div id="projects-loading-overlay-cont">
                <div class="loading-ani">
                    <img :src="'./assets/imgs/loading.png'" alt="loading">
                </div>
                
                <div style="margin-top: 20px; opacity: 0.5;">Creating new project...</div>
            </div>
            
        </div>
    </div>
</template>


<script>
import Request from '../../utils/Request'
import Coordinate from '../../utils/Coordinate'

// Map
import L from 'leaflet'
import { LMap, LTileLayer, LMarker, LCircle } from 'vue2-leaflet'

export default {
    name: "projects",
    components: {
        LMap,
        LTileLayer,
        LCircle,
        LMarker
    },
    data(){
        return{
            api_all: "/all",
            api_new: "/new",
            allProjects: [],

            UI_New: false,
            UI_Creating: false,

            inputForm: {
                name: "",
                center: {
                    latitude: 51.509539,
                    longitude: -0.091988,
                },
                dem_dis: 5000,
                geo_dis: 1000,
                author: "Jeff Wu",
            },
            createForm: {
                name: "",
                center:{
                    latitude: 51.509539,
                    longitude: -0.091988,
                },
                dem_bbox:{},
                geo_bbox:{},
                author: "Jeff Wu"
            },

            preview_map_tile: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            preview_map_zoom: 12,
            preview_map_center:[51.509539, -0.091988],
            preview_map_dem_radius: 5000,
            preview_map_geo_radius: 1000,
            preview_map_dem_circle: {
                color: '#FFF852',
                fillColor: 'rgba(159, 156, 69, 0.5)'
            },
            preview_map_geo_circle: {
                color: '#127FFF',
                fillColor: 'rgba(32, 172, 97, 0.5)'
            },
            preview_map_bounds: null,
            needUpdate: false,
        }
    },
    created(){
        this.getData(this.api_all)
    },
    methods:{
        getData(api){
            Request.Get(api, {}, false, (res)=>{
                if(res.status){
                    this.allProjects = res["data"]["projects"]
                }
                
            })
        },

        addNew(){
            this.UI_New = !this.UI_New
        },

        newProject(){
            this.createForm.name = this.inputForm.name
            this.createForm.center = this.inputForm.center
            this.createForm.dem_bbox = Coordinate.MakeBBox(this.inputForm.center, this.inputForm.dem_dis)
            this.createForm.geo_bbox = Coordinate.MakeBBox(this.inputForm.center, this.inputForm.geo_dis)

            this.UI_Creating = true

            Request.PostJSON(this.api_new, this.createForm, false, (res)=>{
                if(res.status){
                    this.$router.push({name: 'home', query:{ project: this.createForm.name }})
                } else {
                    alert("Fail to create project " + this.inputForm.name)
                }
            })

            //console.log(this.createForm)
        },

        marker_icon(){
            return L.icon({
                iconUrl: './assets/imgs/location.png',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            })
        },

        toPreview(){
            this.preview_map_center = [this.inputForm.center.latitude, this.inputForm.center.longitude]
            this.preview_map_dem_circle.center = this.preview_map_center
            this.preview_map_dem_radius = parseInt(this.inputForm.dem_dis)
            this.preview_map_geo_radius = parseInt(this.inputForm.geo_dis)
            console.log(this.preview_map_dem_radius)
            this.needUpdate = !this.needUpdate
        },

        toProject(name){
            this.$router.push({name: 'home', query:{ project: name }})
        }
    }
}
</script>

<style scoped>

@keyframes spin {
  0% {transform: rotate(0deg)}
  100% {transform: rotate(360deg)}
}

.loading-ani img{
  animation-name: spin;
  animation-fill-mode: forwards;
  animation-duration: 1.6s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

#projects{
    width: 100%;
    background: #1D2128;
    margin-top: 40px;
    padding-bottom: 40px;
}

#p-list{
    width: 100%;
    padding: 20px;
}

#p-list-cont{
    width: 80%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-wrap: wrap;
    text-align: center;
}

#p-new-win-overlay{
    position: fixed;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 1;
}

#p-new-win{
    background: #272C33;
    position: fixed;
    display: flex;
    width: 70%;
    height: 700px;
    top: 50%;
    left: 50%;
    padding: 24px;
    transform: translate(-50%, -50%);
    z-index: 2;
}

#p-new-win-left{
    width: 40%;
}

#p-new-win-right{
    width: 60%;
}

.p-input-single{
    font-size: 20px;
    font-weight: bold;
    margin-top: 32px;
    margin-bottom: 32px;
}

.p-input-single input{
    margin-left: 10px;
}

#projects-loading-overlay{
    background: #272C33;
    position: fixed;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: 999;
}

#projects-loading-overlay-cont{
    width: 100%;
    margin-top: 200px;
    text-align: center;
}

.p-single{
    background: #272C33;
    border: 4px solid rgba(255, 255, 255, 0.1);
    padding: 44px;
    margin: 20px;
    opacity: .5;
    cursor: pointer;
    transition: all .5s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.p-single:hover{
    opacity: 1;
}

.p-single-text{
    margin-top: 8px;
    text-transform: uppercase;
}

#p-list-new{
    position: relative;
    width: 100%;
    height: auto;
    text-align: center;
}

#p-list-new button{
    width: 50%;
    margin-left: auto;
    margin-right: auto;
}


</style>