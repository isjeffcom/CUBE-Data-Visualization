// Import
import * as THREE from 'three'
import { GPSRelativePosition } from './geotools/GeoCalculator'


export function GenBuilding(coordinates, center, height){
    // // Create Shape
    let shape = this.GenShape(coordinates, center)

    // Extrude Shape to Geometry
    let geometry = this.GenBuildingGeometry(shape, {
        curveSegments: 2,  // curves
        steps: 1, // subdividing segments
        depth: 0.05 * height, // Height
        bevelEnabled: false // Bevel (round corner)
    })

    // var geometry = new THREE.ShapeBufferGeometry( shape )
    // console.log(geometry)

    return geometry
}

// Render building by geojson->geometry->coordinates points data, a set 2-d array
export function GenBuildingGeometry(shape, extrudeSettings){

    let geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
    geometry.computeBoundingBox()

    return geometry
}

export function GenShape(points, center){
    // Create a shape object for create model after
    let shape = new THREE.Shape()

    // Get deeper layer of point data
    for(let ii=0;ii<points.length;ii++){
        let elp = points[ii]

        //convert position from the center position
        elp = GPSRelativePosition({ latitude: elp[1], longitude: elp[0] }, center)

        // Draw shape
        if(ii == 0){
            shape.moveTo(elp.x, elp.y)
        } else {
            shape.lineTo(elp.x, elp.y)
        }
    }

    return shape
}

export function GenHelper(geometry){

    if(!geometry.boundingBox){
        geometry.computeBoundingBox()
    }

    let box3 = geometry.boundingBox

    if(!isFinite(box3.max.x)){
        return false
    }

    let helper = new THREE.Box3Helper( box3, 0xffff00 )
    // Project new position
    helper.updateMatrixWorld()

    return helper
}

export function GenLine(data){
    let points = this.GenLinePoints(data)
    return new THREE.BufferGeometry().setFromPoints( points )
}

export function GenLinePoints(data, center){
    // Init points array
    let points = []

    // Loop for all nodes
    for(let i=0;i<data.length;i++){
        
        if(!data[0][1]) return
        
        let el = data[i]

        //Just in case
        if(!el[0] || !el[1]) return
        
        let elp = [el[0], el[1]]

        //convert position from the center position
        elp = GPSRelativePosition({ latitude: elp[1], longitude: elp[0] }, center)
        
        // Draw Line
        points.push( new THREE.Vector3( elp.x, 0.1, elp.y ) )
    }

    return points
}

export function GenWaterGeometry(shape, config){
    let geometry = new THREE.ExtrudeBufferGeometry( shape, config )
    geometry.computeBoundingBox()

    return geometry
    //return new THREE.PlaneBufferGeometry(shape)
}
