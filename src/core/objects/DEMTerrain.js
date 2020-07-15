import * as GeoTIFF from "geotiff"
import * as THREE from 'three'

class DEMTerrain{

    constructor(geotiffURL, bbox, material, mapCenter){

        const rawTiff  = await GeoTIFF.fromUrl(geotiffURL)
        const tifImage = await rawTiff.getImage()

        const start = {latitude: bbox.south.latitude, longitude: bbox.west.longitude}
        const end = {latitude: bbox.north.latitude, longitude: bbox.east.longitude}

        let leftBottom = ThreeBasic.GPSRelativePosition(start, mapCenter)
        let rightTop = ThreeBasic.GPSRelativePosition(end, mapCenter)
        
        // Offset from center position
        let x = Math.abs(leftBottom[0] - rightTop[0])
        let y = Math.abs(leftBottom[1] - rightTop[1])

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
                geometry.vertices[i].z = (el/30)
            } 
        }

        // Rotate
        geometry.rotateX(Math.PI / 2)
        geometry.rotateY(Math.PI)
        geometry.rotateZ(Math.PI)

        // Create a plane mesh
        let plane = new THREE.Mesh( geometry, material )
        
        // Add to global Var
        this.ground = plane

        plane.position.y = -1.5

        this.terrainGeometry = geometry
        this.plane = plane

    }
}





