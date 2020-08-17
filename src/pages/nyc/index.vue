<template>
    <div id="nyc">
        
        <div id="cont"></div>

        <div id="loading" style="position: fixed; width: 100%; height: 100%; background: rgba(0,0,0,1); top: 0px; left: 0px; z-index: 1000;" v-if="!loaded">
            <div style="text-align: center; position: absolute; top: 50%; transform: translateY(-50%); width: 100%; font-weight: lighter;">
                LOADING
            </div>
        </div>

        <div id="city" style="position: fixed; top: 60%; left: 50px; transform: translateY(-40%); line-height: 24px; pointer-events:none;">
            <div id="city-name">
                <div style="font-size: 44px;font-weight:bold;">MANHATTAN</div>
                <div style="font-size: 16px;font-weight:light;margin-top:12px;">COVID-19 BIG DATA</div>
            </div>

            <div id="city-data" style="margin-top: 25px;display: flex;">
                <div 
                    v-for="(val, key) in overall" 
                    :key="key"
                    :style="'text-align: left;margin-right: 40px; text-transform: uppercase; color:' + (key != 'prate' ? '#FF655B;' : '#FFB800;')">

                    <div>
                        <div style="font-size: 22px; font-weight: bold;">{{key != "prate" ? val : val + "%"}}</div>
                        <div style="font-size: 12px; font-weight:light;">{{key != "prate" ? key : "positive"}}</div>
                    </div>

                </div>
            </div>

            <div id="selected-data" style="margin-top: 30px;display: flex; font-size: 12px; font-weight:light;color:#49DEFF;">
                <div>{{ s_name }} <br> PostCode: {{s_po}} <br> Cases: {{ s_cases }} <br>  Positive Rate: {{ s_prate }}% </div>
            </div>
        </div>

        <div id="date-selector">
            <div class="ds-single" 
                :style="'background: ' + (currentTaxiDate == item ? '#FFB800;' : 'rgba(0,0,0,0);')  + 'box-shadow:' + (currentTaxiDate == item ? '0 6px 12px rgba(255,184,0,0.23);' : 'none;')"
                v-for="item in taxisDate" 
                :key="item"
                v-on:click="SwitchDate(item)">

                <div 
                    class="ds-single-btn" 
                    :style="'color: ' + (currentTaxiDate == item ? '#000000;' : '#FFB800;') + 'font-weight:' + (currentTaxiDate == item ? 'bold' : 'normal')">

                    {{item}}
                </div>
            </div>
        </div>

        <div id="proverty" style="position: fixed; bottom: 40px; right: 60px; cursor: pointer;" v-on:click="SwitchProverty()">
            <div :style="'padding:12px; border: 1px solid #FFB800; border-radius: 100px; font-size: 14px; font-weight: lighter; background:' + (provertyOpen ? 'rgba(255,184,0,1);' : 'rgba(0,0,0,0);') + 'color: ' + (provertyOpen ? '#000000;' : '#FFB800;')">
                Poverty Map
            </div>
        </div>

        <div id="arc" style="position: fixed; bottom: 40px; right: 180px; cursor: pointer;" v-on:click="Arc()">
            <div :style="'padding:12px; border: 1px solid #FFB800; border-radius: 100px; font-size: 14px; font-weight: lighter; background:' + (arcOpen ? 'rgba(255,184,0,1);' : 'rgba(0,0,0,0);') + 'color: ' + (arcOpen ? '#000000;' : '#FFB800;')">
                Main Trip
            </div>
        </div>
    </div>
</template>

<style scoped>
#date-selector{
    position: fixed;
    bottom: 5%;
    left: 30px;
    display:flex;
    border: 1px solid #FFB800;
    border-radius: 100px;
    padding: 6px;
    font-size: 12px;
}

.ds-single{
    color: #000;
    padding: 12px;
    margin: 4px;
    border-radius: 100px;
    cursor: pointer;
}
</style>

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
            loaded: false,
            C: null,
            Center: {latitude: "40.760366", longitude: "-73.983888"}, // NYC
            taxiData: [],
            covidData: [],
            arcData: [],
            arcLayer: null,
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
            arcOpen: false,
            polyArr: [],
            cyLayer: null,
            txtArr: [],
            provertyOpen: true,
            taxiMaterial: null,
            cyMaterial: null,
            overall: {
                cases: 162,
                prate: 12.4
            },
            s_name: "Manhattan",
            s_cases: 23277,
            s_prate: 12.88,
            s_po: 10000,
            color:[
                "#FF6600",
                "#FFE600"
            ]
            
        }
    },
    mounted(){
        
        this.Init()
        this.Update()

        window.addEventListener( 'click', (evt)=>{
            if(this.C){
                let int = this.C.Ray(evt, this.cyLayer.layer.children)
                
                if(int.length > 0){
                    let target = int[0].object
                    this.FindCovidData(target["name"])
                }
                
            }
        }, false )
    },
    methods: {
        async Init(){
            let container = document.getElementById('cont')

            // Init CUBE Instance
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 10,
                fog:{
                    far: 200
                },
                camera: {
                    position: {
                        x: 30,
                        y: 30,
                        z: 30
                    }
                }
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            // Road
            let roadData = await (await Request.AsyncGet('./assets/geo/nyc/highway.geojson')).json()
            let roads = new CUBE.GeoJsonLayer("nyc_road", roadData).Road()
            this.C.Add(roads)
            roads.position.y = -1

            //Add Geojson Building Layer
            let ed = await (await Request.AsyncGet('./assets/geo/nyc/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer("city_buildings", ed).Buildings({merge: true})
            this.C.Add(buildings)

            // let waterData = await (await Request.AsyncGet('./assets/geo/nyc/water.geojson')).json()
            // let water = new CUBE.GeoJsonLayer("nyc_water", waterData).Water({merge: true})
            // this.C.Add(water)
            // water.position.y = -0.1

            // let seaData = await (await Request.AsyncGet('./assets/geo/nyc/sea.geojson')).json()
            // let sea = new CUBE.GeoJsonLayer("nyc_sea", seaData).Water({merge: true})
            // this.C.Add(sea)
            // sea.position.y = -0.1

            this.taxiMaterial = new this.C.three.MeshBasicMaterial({color: 0x49DEFF})

            // Add a ground
            let ground = new CUBE.Terrain().Ground(800, 800, 8)
            this.C.Add(ground)
            ground.position.y = -3

            // NYC NAT MAP
            let nyc = await (await Request.AsyncGet('./assets/geo/nyc/nta.geojson')).json()
            let nyc_geo = new CUBE.GeoJsonLayer("nyc", nyc).AdministrativeMap({border: true, height: 2, collider: true})
            this.C.Add(nyc_geo)
            nyc_geo.position.y = -2.6
            this.nycGround = nyc_geo

            // Population heatmap
            let population = await (await Request.AsyncGet('./assets/geo/nyc/pop.json')).json()
            let pop = []
            for(let i=0;i<population.length;i++){
                pop.push({location: population[i].center, val: population[i].val / 550})
            }
            let heat = new CUBE.Datasets("population", pop).Heatmap(70, 2.5)
            this.C.Add(heat)
            heat.position.y = 25

            // NYC Taxi
            this.taxiData = await (await Request.AsyncGet('./assets/geo/nyc/taxi.json')).json()
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
                mesh.position.y = -0.6
                this.polyArr.push(mesh)
            })

            // Setup layer for COVID-19 Data
            this.cyLayer = new CUBE.Layer()
            this.C.Add(this.cyLayer.Layer())

            // Get COVID-19 Data
            this.covidData = await (await Request.AsyncGet('./assets/geo/nyc/covid.json')).json()
            this.SwitchDate(this.taxisDate[0]) // Data processor

            this.loaded = true

            // Ready for arc
            this.arcData = await (await Request.AsyncGet('./assets/geo/nyc/crossfire.json')).json()
            this.arcLayer = new CUBE.Layer("arc")
            this.C.Add(this.arcLayer.layer)
        },

        Arc(){
            this.arcOpen = !this.arcOpen
            if(this.arcOpen === false){
                this.arcLayer.Clear()
            } else {
                // NYC Taxi Arc line
                this.arcData.forEach((el,idx) => {
                    let coorA = {latitude: el[0][1], longitude: el[0][0]}
                    let coorB = {latitude: el[1][1], longitude: el[1][0]}
                    let arc = new CUBE.Data().Arc(coorA, coorB, 2)
                    this.arcLayer.Add(arc)
                })
            }
            
            
        },

        // Data processor
        SwitchDate(date){

            this.currentTaxiDate = date

            this.ClearCy()
            
            // Generate bar chart
            for(let i=0;i<this.covidData.length;i++){
                let el = this.covidData[i]
                if(date == el.date){

                    let allCases = 0
                    let allPRate = []

                    for(let ii=0;ii<el.all.length;ii++){
                        let area = el.all[ii]

                        let cyc = new CUBE.Data(area.area + "," + area.zcta).Cylinder(area.coor, area.case / 1000, .05, 0, 0xff6600)
                        let cyp = new CUBE.Data(area.area + "," + area.zcta).Cylinder(area.coor, area.prate / 100, .05, 0, 0xFFE600)
                        cyp.position.x += 1

                        let txt = new CUBE.Data().Text(area.coor, area.case + " Cases / " + area.prate + "%", .3, 0xFF6600, 0.01)
                        txt.position.y = ((area.case / 1000) * this.C.scale) + 2
                        this.C.SetLookAt(txt)
                        
                        this.cyLayer.Add(cyc)
                        this.cyLayer.Add(cyp)

                        this.C.Add(txt)
                        this.txtArr.push(txt)

                        allCases += area.case
                        allPRate.push(area.prate)
                    }

                    this.overall.cases = allCases
                    this.overall.prate = parseFloat(allPRate.reduce((a, b) => a + b) / allPRate.length).toFixed(2)
                }
            }

            this.SwitchTaxi(date)
            this.FindCovidData(this.s_name)

        },

        // Clear bar
        ClearCy(){

            this.cyLayer.Clear()

            if(this.txtArr.length > 0){
                for(let cc=0;cc<this.txtArr.length;cc++){
                    this.C.RemoveLookAt(this.txtArr[cc])
                    this.C.Delete(this.txtArr[cc])
                }
            }
            

            this.cyArr = []
            
            
        },

        // Taxi by date
        SwitchTaxi(date){

            this.currentTaxiDate = date

            this.C.AniEngine.Clear()

            this.$nextTick(()=>{

                for(let i=0;i<this.taxiData.length;i++){
                    let adate = this.taxiData[i]
                    if(adate["date"] == date){
                        for(let ii=0;ii<adate["routes"].length;ii++){
                            let single = adate["routes"][ii]
                            
                            let path = single["path"]
                            let taxiSingle = new CUBE.Data().Sphere({latitude: path[0][0], longitude: path[0][1]}, 1, .03, .5, 0xFFB800, this.taxiMaterial)
                            taxiSingle.position.y = .1

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

                            let mAni = new CUBE.Animation(single["id"], taxiSingle, "tween", {startNow: true, delay: aniDelay / 40, repeat: true}).GPSPath(aniPath, aniTime / 40)
                            this.C.AniEngine.Register(mAni)
                        }
                    }
                }
            })

            
        },

        // Data Processor
        FindCovidData(name){
            if(!name || name === "Manhattan") return

            let areaName = name.split(",")[0]
            let areaPO = name.split(",")[1]

            for(let i=0;i<this.covidData.length;i++){
                let single = this.covidData[i]
                if(single.date === this.currentTaxiDate){
                    for(let ii=0;ii<single.all.length;ii++){
                        let area = single.all[ii]
                        if(area.area === areaName){
                            this.s_name = name
                            this.s_po = areaPO
                            this.s_cases = area.case
                            this.s_prate = area.prate
                        }
                    }
                }
            }


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

        Update(){
            requestAnimationFrame(this.Update)
            this.C.Runtime()
        }
    }
}
</script>