<template>
    <div id="coretest">
        <div id="cont"></div>

        <div id="date-selector">
            <div class="ds-single" 
                :style="'background: ' + (currentTaxiDate == item ? '#FFB800;' : '#E4E4E4;')"
                v-for="item in taxisDate" 
                :key="item" 
                v-on:click="SwitchTaxi(item)">
                <div class="ds-single-btn">{{item}}</div>
            </div>
        </div>

        <div id="proverty" style="position: fixed; bottom: 40px; right: 60px;" v-on:click="SwitchProverty()">
            <button>Proverty</button> 
        </div>
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
import * as THREE from 'three'
//import { Coordinate } from '../../core/coordinate/Coordinate'

export default {
    name: "coretest",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            Center: {latitude: "40.760366", longitude: "-73.983888"}, // NYC
            taxiData: [],
            currentTaxiDate: "2020-05-25",
            taxisDate: [
                "2020-05-25",
                "2020-05-26",
                "2020-05-27",
                "2020-05-28",
                "2020-05-29",
                "2020-05-30"
            ],
            nycGround: null,
            activeAni: null,
            polyArr: [],
            provertyOpen: true,
            taxiMaterial: null
            
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
                scale: 10,
                camera: {
                    x: 20,
                    y: 8,
                    z: 20
                }
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            // Road
            let roadData = await (await Request.AsyncGet('./assets/geo/nyc/highway.geojson')).json()
            let roads = new CUBE.GeoJsonLayer(roadData, "nyc_road").Road({fat: false})
            this.C.Add(roads)

            //Add Geojson Building Layer
            let ed = await (await Request.AsyncGet('./assets/geo/nyc/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "city_buildings").Buildings({merge: true})
            this.C.Add(buildings)

            // let waterData = await (await Request.AsyncGet('./assets/geo/nyc/water.geojson')).json()
            // let water = new CUBE.GeoJsonLayer(waterData, "nyc_water").Water({merge: true})
            // this.C.Add(water)
            // water.position.y = -0.1

            // let seaData = await (await Request.AsyncGet('./assets/geo/nyc/sea.geojson')).json()
            // let sea = new CUBE.GeoJsonLayer(seaData, "nyc_sea").Water({merge: true})
            // this.C.Add(sea)
            // sea.position.y = -0.1

            this.taxiMaterial = new THREE.MeshBasicMaterial({color: 0x49DEFF})

            // // Add a ground
            let ground = new CUBE.Terrain().Ground(800, 800, 8)
            this.C.Add(ground)
            ground.position.y = -3

            // NYC NAT MAP
            let nyc = await (await Request.AsyncGet('./assets/geo/nyc/nta.geojson')).json()
            let nyc_geo = new CUBE.GeoJsonLayer(nyc, "nyc").AdministrativeMap({border: true, height: 2})
            this.C.Add(nyc_geo)
            nyc_geo.position.y = -2.8
            this.nycGround = nyc_geo

            // Population heatmap
            let population = await (await Request.AsyncGet('./assets/geo/nyc/pop.json')).json()
            let pop = []
            for(let i=0;i<population.length;i++){
                pop.push({location: population[i].center, val: population[i].val / 550})
            }
            let heat = new CUBE.Datasets("population", pop).Heatmap(70, 2.5)
            this.C.Add(heat)
            heat.position.set(0, 10, 0)

            //NYC Taxi
            let taxi = await Request.AsyncGet('./assets/geo/nyc/taxi.json')
            this.taxiData = await taxi.json()
            this.SwitchTaxi(this.taxisDate[0])

            // Poverty map by polygon geometry
            let poverty = await (await Request.AsyncGet('./assets/geo/nyc/poverty.json')).json()
            poverty.forEach(area => {
                let color
                if(area.val >= 20) color = 0x3C1D0C // Cool place
                if(area.val >= 10 && area.val < 20) color = 0x322D1F // Clean street
                if(area.val < 10) color = 0x2B3E18 // Green zone

                const mesh = new CUBE.Polygon(area.code, area.polygon).Ground({code: area.code, val: area.val}, {color: color, height: .5})
                this.C.Add(mesh)
                mesh.position.y = -0.8
                this.polyArr.push(mesh)
            })


        },

        SwitchTaxi(date){

            this.currentTaxiDate = date

            this.C.GetAniEngine().Clear()

            this.$nextTick(()=>{

                for(let i=0;i<this.taxiData.length;i++){
                    let adate = this.taxiData[i]
                    if(adate["date"] == date){
                        for(let ii=0;ii<adate["routes"].length;ii++){
                            let single = adate["routes"][ii]
                            
                            let path = single["path"]
                            let taxiSingle = new CUBE.Data().Sphere({latitude: path[0][0], longitude: path[0][1]}, 1, .03, 0x49DEFF, this.taxiMaterial)

                            let dayStart = new Date(adate["date"] + ' ' + '00:00')
                            let pickup = new Date(adate["date"] + ' ' + single["pickup"])
                            let dropoff = new Date(adate["date"] + ' ' + single["dropoff"])
                            let aniTime = dropoff - pickup  // Calculate animation time
                            let aniDelay = pickup - dayStart // Calculate animation delay
                            
                            if(aniDelay < 0 || aniTime < 0) continue

                            let aniPath = []
                            for(let ic=0;ic<path.length;ic++){
                                let ics = path[ic]
                                aniPath.push({latitude: ics[1], longitude: ics[0]}) // normally is 0 and 1, but it depended on data source
                            }

                            let mAni = new CUBE.Animation(single["id"], taxiSingle, "tween", {startNow: true, delay: aniDelay / 10, repeat: true}).GPSPath(aniPath, aniTime / 10)
                            this.C.GetAniEngine().Register(mAni)
                        }
                    }
                }
            })

            
        },

        SwitchProverty(){

            this.provertyOpen = !this.provertyOpen

            if(this.provertyOpen){
                this.polyArr.forEach(poly => {
                    poly.visible = true
                })
                this.nycGround.position.y = -2.8
            } else {
                this.polyArr.forEach(poly => {
                    poly.visible = false
                })
                this.nycGround.position.y = -2
            }

            
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