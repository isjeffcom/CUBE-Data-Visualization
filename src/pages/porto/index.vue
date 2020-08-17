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
        async Init(){
            let container = document.getElementById('cont')

            // Init CUBE Instance
            this.C = new CUBE.Space(container, {
                background: "333333", 
                center: this.Center, 
                scale: 10
            })

            // Init Animation Engine
            let aniEngine = new CUBE.AnimationEngine(this.C)
            this.C.SetAniEngine(aniEngine)

            //Add Geojson Building Layer
            let ed = await (await Request.AsyncGet('./assets/geo/porto/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer("city_buildings", ed).Buildings({merge: true})
            this.C.Add(buildings)

            // // Add a ground
            let ground = new CUBE.Terrain().Ground(800, 800, 8)
            this.C.Add(ground)
            ground.position.y = -2.4


            // porto Taxi
            let taxi = await Request.AsyncGet('./assets/geo/porto/taxi.json')
            taxi = await taxi.json()
            taxi.forEach((single, index) => {
                if(index % 50 == 0){
                    let path = JSON.parse(single["path"])
                    if(path.length < 1) return
                    let taxiSingle = new CUBE.Data().Sphere({latitude: path[0][0], longitude: path[0][1]}, 1, .03)
                    this.C.Add(taxiSingle)
                    
                    let aniPath = []
                    for(let ic=0;ic<path.length;ic++){
                        let ics = path[ic]
                        aniPath.push({latitude: ics[1], longitude: ics[0]}) // normally is 0 and 1, but it depended on data source
                    }

                    let mAni = new CUBE.Animation(single["id"], taxiSingle, "tween", {startNow: true, repeat: true}).GPSPath(aniPath, 100000)
                    this.C.GetAniEngine().Register(mAni)
                    
                }
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
                            let taxiSingle = new CUBE.Data().Sphere({latitude: path[0][0], longitude: path[0][1]}, 1, .03, 0xFFB800)

                            let dayStart = new Date(adate["date"] + ' ' + '00:00')
                            let pickup = new Date(adate["date"] + ' ' + single["pickup"])
                            let dropoff = new Date(adate["date"] + ' ' + single["dropoff"])
                            let aniTime = dropoff - pickup  // Calculate animation time
                            let aniDelay = pickup - dayStart // Calculate animation delay

                            let aniPath = []
                            for(let ic=0;ic<path.length;ic++){
                                let ics = path[ic]
                                aniPath.push({latitude: ics[1], longitude: ics[0]}) // normally is 0 and 1, but it depended on data source
                            }

                            let mAni = new CUBE.Animation(single["id"], taxiSingle, "tween", {startNow: true, delay: Math.abs(aniDelay / 1000), repeat: true}).GPSPath(aniPath, Math.abs(aniTime))
                            this.C.GetAniEngine().Register(mAni)
                        }
                    }
                }
            })

            
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