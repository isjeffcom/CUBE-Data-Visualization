import * as GeoTIFF from "geotiff"
import * as THREE from 'three'
import { Coordinate } from '../coordinate/Coordinate'
import CUBE_Material from '../materials/CUBE_Material'
import { Water } from 'three/examples/jsm/objects/Water'

export class Terrain{

    constructor(name){
        // this.bbox = bbox ? bbox : window.CUBE_GLOBAL.bbox

        // if(!this.bbox){
        //     console.error("Boundary box parameter is essential and must pass in")
        // }

        this.mat_terrain = new CUBE_Material().Terrain()
        this.geometry = null

        // Main Layer
        this.layer = new THREE.Group()
        this.layer.name = name
    }

    Ground(sizeX=20, sizeY=20, segments=32){
        let geometry = new THREE.PlaneBufferGeometry( sizeX, sizeY, segments )
        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)
        let ground = new THREE.Mesh( geometry, new CUBE_Material().Ground() )
        
        this.layer.add(ground)
        return this.layer
    }

    WaterGround(sizeX=20, sizeY=20, segments=32){
        let sun = new THREE.Light("#ffffff", .5)
        sun.position.set(0, 4, 0)
        let mat_water = new CUBE_Material().GeoWater(sun, true)

        let geometry = new THREE.PlaneBufferGeometry( sizeX, sizeY, segments )
        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        let mesh = new Water(geometry, mat_water)
        this.layer.add(mesh)
        return this.layer
    }

    async GeoTiff(tiffData, heightScale=30, overwrite){
        const rawTiff  = await GeoTIFF.fromArrayBuffer(tiffData)
        const tifImage = await rawTiff.getImage()

        let bbox = tifImage.getBoundingBox() // 0: west Longitude, 1: south latitude, 2: east longitude, 3: north latitude

        // const start = {latitude: this.bbox.south.latitude, longitude: this.bbox.west.longitude}
        // const end = {latitude: this.bbox.north.latitude, longitude: this.bbox.east.longitude}

        const start = { longitude: bbox[0], latitude: bbox[1] }
        const end = { longitude: bbox[2], latitude: bbox[3] }

        const leftBottom = new Coordinate("GPS", start).ComputeWorldCoordinate()
        const rightTop = new Coordinate("GPS", end).ComputeWorldCoordinate()
        
        // Offset from center position
        const x = Math.abs(leftBottom.world.x - rightTop.world.x)
        const y = Math.abs(leftBottom.world.z - rightTop.world.z)

        // Initial plane geometry
        const geometry = new THREE.PlaneGeometry(
            x,
            y,
            x - 1,
            y - 1
        )

        // Read image pixel values that each pixel corresponding a height
        const data = await tifImage.readRasters({ width: Math.floor(x), height: Math.floor(y), resampleMethod: 'bilinear', interleave: true })

        // Fill z values of the geometry
        for(let i=0;i<data.length;i++){
            let el = data[i]

            if(geometry.vertices[i]){
                geometry.vertices[i].z = (el/heightScale)
            } 
        }

        // Rotate
        geometry.rotateX(Math.PI / 2)
        geometry.rotateY(Math.PI)
        geometry.rotateZ(Math.PI)

        // Create a plane mesh
        let plane = new THREE.Mesh( geometry, this.mat_terrain )
        this.layer.add(plane)

        return this.layer

    }
}





