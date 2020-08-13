<template>
    <div id="coretest">
        <div id="cont"></div>
    </div>
</template>

<script>

import * as CUBE from '../../core/Main'
import Request from '../../utils/Request'
//import { Coordinate } from '../../core/coordinate/Coordinate'

export default {
    name: "coretest",
    props: {
        // Config Address
        
    },
    data(){
        return{
            C: null,
            //Center: {latitude: 55.943686, longitude: -3.188822}, // EDI
            Center: {latitude: 40.709028, longitude: -73.956928}, // NYC
            //Center: {latitude: 41.157937, longitude: -8.629108} // porto
            // path: [
            //     {latitude: 55.942867, longitude: -3.186062},
            //     {latitude: 55.943104, longitude: -3.184601},
            //     {latitude: 55.943556, longitude: -3.184923},
            //     {latitude: 55.943879, longitude: -3.185246},
            //     {latitude: 55.944342, longitude: -3.185880}
            // ]
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

            let roadData = await (await Request.AsyncGet('./assets/geo/nyc/highway.geojson')).json()
            let roads = new CUBE.GeoJsonLayer(roadData, "nyc_road").Road({fat: false})
            this.C.Add(roads)

            //Add Geojson Building Layer
            let ed = await (await Request.AsyncGet('./assets/geo/nyc/building.geojson')).json()
            let buildings = new CUBE.GeoJsonLayer(ed, "city_buildings").Buildings({merge: true})
            this.C.Add(buildings)

            let waterData = await (await Request.AsyncGet('./assets/geo/nyc/water.geojson')).json()
            let water = new CUBE.GeoJsonLayer(waterData, "nyc_water").Water({merge: true})
            this.C.Add(water)
            water.position.y = -0.1

            let seaData = await (await Request.AsyncGet('./assets/geo/nyc/sea.geojson')).json()
            let sea = new CUBE.GeoJsonLayer(seaData, "nyc_sea").Water({merge: true})
            this.C.Add(sea)
            sea.position.y = -0.1

            // // Add a ground
            // let ground = new CUBE.Terrain().Ground(800, 800, 8)
            // this.C.Add(ground)
            // ground.position.y = -2.4

            // // NYC NAT MAP
            // this.C.AddGroup("nyc_nta")
            // let nyc = await (await Request.AsyncGet('./assets/geo/nyc/nta.geojson')).json()
            // let nyc_geo = new CUBE.GeoJsonLayer(nyc, "nyc").AdministrativeMap({border: true, height: 2})
            // this.C.Add(nyc_geo)
            // nyc_geo.position.y = -2.2

            // // Population heatmap
            // let population = await (await Request.AsyncGet('./assets/geo/nyc/pop.json')).json()
            // let pop = []
            // for(let i=0;i<population.length;i++){
            //     pop.push({location: population[i].center, val: population[i].val / 550})
            // }
            // let heat = new CUBE.Datasets("population", pop).Heatmap(600, 25)
            // this.C.Add(heat)
            // heat.position.set(0, 7, 0)

            // //NYC Taxi
            // let taxi = await Request.AsyncGet('./assets/geo/nyc/taxi.json')
            // taxi = await taxi.json()
            // for(let i=0;i<taxi.length;i++){
            //     let adate = taxi[i]
            //     if(adate["date"] == "2020-05-25"){
            //         for(let ii=0;ii<adate["routes"].length;ii++){
            //             let single = adate["routes"][ii]
                        
            //             let path = single["path"]
            //             let taxiSingle = new CUBE.Data().Sphere({latitude: path[0][0], longitude: path[0][1]}, 1, .03, 0xFFB800)
            //             this.C.Add(taxiSingle)

            //             let aniPath = []
            //             for(let ic=0;ic<path.length;ic++){
            //                 let ics = path[ic]
            //                 aniPath.push({latitude: ics[1], longitude: ics[0]}) // normally is 0 and 1, but it depended on data source
            //             }

            //             let mAni = new CUBE.Animation(single["id"], taxiSingle, "tween", {startNow: true, repeat: true}).GPSPath(aniPath, 100000)
            //             this.C.GetAniEngine().Register(mAni)
            //         }
            //     }
                
            // }

            // // porto Taxi
            // let taxi = await Request.AsyncGet('./assets/geo/porto/taxi.json')
            // taxi = await taxi.json()
            // taxi.forEach((single, index) => {
            //     if(index % 50 == 0){
            //         let path = JSON.parse(single["path"])
            //         if(path.length < 1) return
            //         let taxiSingle = new CUBE.Data().Sphere({latitude: path[0][0], longitude: path[0][1]}, 1, .03)
            //         this.C.Add(taxiSingle)
                    
            //         let aniPath = []
            //         for(let ic=0;ic<path.length;ic++){
            //             let ics = path[ic]
            //             aniPath.push({latitude: ics[1], longitude: ics[0]}) // normally is 0 and 1, but it depended on data source
            //         }

            //         let mAni = new CUBE.Animation(single["id"], taxiSingle, "tween", {startNow: true, repeat: true}).GPSPath(aniPath, 100000)
            //         this.C.GetAniEngine().Register(mAni)
                    
            //     }
            // })


            // Add a basic box
            //this.C.Add(new CUBE.Shapes().Box())

            // Add Geojson Map Layer
            // this.C.AddGroup("china")
            // let china = await Request.AsyncGet('./assets/geo/china.geojson').json()
            // this.C.Add(new CUBE.GeoJsonLayer(china, "china").AdministrativeMap({border: true, height: 2}))

            // let ed = await (await Request.AsyncGet('./assets/geo/project/building.geojson')).json()
            // let buildings = new CUBE.GeoJsonLayer(ed, "ed_buildings").Buildings({merge: true})
            // this.C.Add(buildings)

            // Add Bitmap Image as ground
            // let map = new CUBE.BitmapLayer("main").TileMap()
            // this.C.Add(map)

            // Load model, attach light and add animation
            // let posi = new CUBE.Coordinate("World", {x: 0, y: 6, z: 2})
            // let m = new CUBE.Model(posi)
            // m.LoadGLTF('./assets/models/satellite/scene.gltf').then(()=>{
            //     let light = new THREE.DirectionalLight(0xffffff, .8)
            //     light.position.set(0, 1, 0)

            //     m.Attach(light)

            //     this.C.Add(m.object)

            //     // let mAni = new CUBE.Animation("test", m.object, "tween", {repeat: true}).GPSPath(this.path, 4000)
            //     // this.C.GetAniEngine().Register(mAni)

            //     let mAni = new CUBE.Animation("test", m.object, "circular", {startNow: true, repeat: true})
            //     this.C.GetAniEngine().Register(mAni)
            // })

            
            

            // Point cloud layer
            // let arr = [
            //     {name: "a", location: { latitude: 55.953335, longitude: -3.189127 }},
            //     {name: "b", location: { latitude: 55.954579, longitude: -3.187315 }},
            //     {name: "c", location: { latitude: 55.956385, longitude: -3.186543 }}
            // ]

            // let cloud = new CUBE.Datasets("cloud", arr).PointCloud()
            // this.C.Add(cloud)

            
            // Add terrain
            // let edt = await Request.AsyncGet('./assets/geo/project/terrain.tif')
            // edt = await edt.arrayBuffer()
            // let terrain = await new CUBE.Terrain(edt, "edinburgh_terrain").GeoTiff()
            // this.C.Add(terrain)

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