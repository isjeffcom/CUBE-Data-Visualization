import * as THREE from 'three'
import { Coordinate } from '../coordinate/Coordinate'
import {GenShape, GenBuildingGeometry } from '../utils/ModelBuilder'

import CUBE_Material from '../materials/CUBE_Material'

export class GeoJsonLayer{

    constructor(geojson, name, center){
        this.geojson = geojson
        this.name = name
        this.center = center

        // Main Layer
        this.layer = new THREE.Group()
        this.layer.name = name

        this.mat_map = new CUBE_Material().GeoMap()
        this.mat_line = new CUBE_Material().GeoBorder()

        // Object Layer
        this.layer_objects = new THREE.Group()
        this.layer_objects.name = name + "_objects"

        // Borders Layer
        this.layer_borders = new THREE.Group()
        this.layer_borders.name = name + "_borders"
    }

    AdministrativeMap(options){

        let features = this.geojson["features"]
        let height = options.height ? options.height : 2

        // Render all building
        for(let i=0;i<features.length;i++){

            let fel = features[i]

            // Just in case properties value does not exist
            if(!fel["properties"]) return

            let info = fel["properties"]
            
            // Only render when geometry is Polygon
            // Render building
            if(fel.geometry.coordinates){
                
                if(fel.geometry.type == "Polygon"){
                    let province = addProvince(fel.geometry.coordinates, this.mat_map, info, height, this.center)
                    if(province) this.layer_objects.add(province)
                    if(options.border) this.layer_borders.add(addBorder(fel.geometry.coordinates, this.mat_line, height+.01))
                }

                if(fel.geometry.type == "MultiPolygon"){
                    for(let i=0;i<fel.geometry.coordinates.length;i++){
                        let coor = fel.geometry.coordinates[i]
                        let province = addProvince(coor, this.mat_map, info, height, this.center)
                        if(province) this.layer_objects.add(province)
                        if(options.border) this.layer_borders.add(addBorder(coor, this.mat_line, height+.01))
                    }
                }

                
            }
        }

        this.layer.add(this.layer_objects)
        this.layer.add(this.layer_borders)

        return this.layer
        
        
    }

}



function addProvince(coordinates, material, info, height=1){
    let shape, geometry
    // Loop for all nodes
    for(let i=0;i<coordinates.length;i++){
        
        let el = coordinates[i]
        console.log(typeof el[0][0] != "number")
        if(typeof el[0][0] != "number"){
            shape = GenShape(el[0])
        }else{
            shape = GenShape(el)
        }

    }

    if(shape){
        // Extrude Shape to Geometry
        geometry = GenBuildingGeometry(shape, {
            curveSegments: 12,  // curves
            steps: 1, // subdividing segments
            depth: height, // Height
            bevelEnabled: false // Bevel (round corner)
        })
        
        // Adjust geometry rotation
        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        let mesh = new THREE.Mesh(geometry, material)
        //mesh.position.y = 0
        mesh.info = info

        return mesh
    }

    
}

function addBorder(coordinates, material, up){
    let points = []

    for(let i=0;i<coordinates.length;i++){
        if(i == 0){
            let el = coordinates[i]

            for(let ii=0;ii<el.length;ii++){
                let elp = el[ii]
                elp = new Coordinate("GPS", {latitude: elp[1], longitude: elp[0]}).ComputeWorldCoordinate()
                points.push( new THREE.Vector3( elp.world.x, elp.world.y, elp.world.z ) )
                
            }
        }
    }

    let geometry = new THREE.BufferGeometry().setFromPoints( points )
    geometry.rotateZ(Math.PI)

    let line = new THREE.Line(geometry, material)
    line.position.set(0, up, 0)
    line.material.transparent = true

    return line


}