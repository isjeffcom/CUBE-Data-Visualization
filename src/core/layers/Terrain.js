import * as GeoTIFF from "geotiff"
import * as THREE from 'three'
import { Coordinate } from '../coordinate/Coordinate'
import CUBE_Material from '../materials/CUBE_Material'

export class Terrain{

    constructor(data, name){
        this.data = data
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

    async GeoTiff(heightScale=30, overwrite){
        const rawTiff  = await GeoTIFF.fromArrayBuffer(this.data)
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





