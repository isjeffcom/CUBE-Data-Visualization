import * as THREE from 'three'
import { Coordinate } from '../coordinate/Coordinate'
import {GenShape, GenGeometry, GenHelper, MergeGeometry } from '../utils/ModelBuilder'

import CUBE_Material from '../materials/CUBE_Material'


export class GeoJsonLayer{

    constructor(geojson, name){
        this.geojson = geojson
        this.name = name

        // Main Layer
        this.layer = new THREE.Group()
        this.layer.name = name

        this.mat_map = new CUBE_Material().GeoMap()
        this.mat_line = new CUBE_Material().GeoBorder()
        this.mat_building = new CUBE_Material().GeoBuilding()

        // Object Group
        this.layer_objects = new THREE.Group()
        this.layer_objects.name = name + "_objects"

        // Borders Group (if needed)
        this.layer_borders = new THREE.Group()
        this.layer_borders.name = name + "_borders"

        // Collider Group (if needed)
        this.layer_colliders = new THREE.Group()
        this.layer_colliders.name = name + "_collider"
    }


    /**
     * @param {Object} options {merge: Boolean, border: Boolean} merge: if use merge function to optimise performance, border: if generate border
     * @public
    */

    AdministrativeMap(options){

        let features = this.geojson["features"]
        let height = options.height ? options.height : 2

        let geometries = []

        // Render all building
        for(let i=0;i<features.length;i++){

            let fel = features[i]

            // Just in case properties value does not exist
            if(!fel["properties"]) return

            let info = fel["properties"]
            
            // Only render when geometry is Polygon
            // Render building
            if(fel.geometry.coordinates){

                let coors = []

                if(fel.geometry.type == "Polygon"){
                    coors.push(fel.geometry.coordinates)
                }

                if(fel.geometry.type == "MultiPolygon"){
                    coors = fel.geometry.coordinates
                }
                
                for(let i=0;i<coors.length;i++){

                    let coor = coors[i]
                    let province = addProvince(coor, info, height)
                    
                    if(province){
                        if(options.merge){
                            geometries.push(province.geometry)
                            this.layer_colliders.add(province.helper)
                        } else {
                            this.layer_objects.add(new THREE.Mesh(province.geometry, this.mat_map))
                        }

                    } 

                    if(options.border) this.layer_borders.add(addBorder(coor, this.mat_line, height+.01))
                }

            }
        }
        
        // Merge geometry for performance
        if(options.merge){
            let mergedGeometry = MergeGeometry(geometries)
            let provinceMesh = new THREE.Mesh(mergedGeometry, this.mat_map)
            this.layer_objects.add(provinceMesh)
        }
        
        this.layer.add(this.layer_objects)
        //this.layer.add(this.layer_colliders)
        this.layer.add(this.layer_borders)

        return this.layer
    }

    Buildings(options){

        let features = this.geojson["features"]

        let geometries = []
        
        // Max building number
        // let count = features.length
        // if(features.length > 1000){
        //     //count = 1000
        // }

        // Render all building
        for(let i=0;i<features.length;i++){

            let fel = features[i]

            // Just in case properties value does not exist
            if(!fel["properties"]) return

            let info = fel["properties"]
            
            // Only render when geometry is Polygon
            if(info["tags"]["building"] && fel.geometry.type == "Polygon"){

                let building = addBuilding(fel.geometry.coordinates, info, info["tags"]["building:levels"])

                if(building){
                    if(options.merge){
                        geometries.push(building.geometry)
                        this.layer_colliders.add(building.helper)
                    } else {
                        this.layer_objects.add(new THREE.Mesh(building.geometry, this.mat_building))
                    }
                }
            }
        }

        // Merge geometry for performance
        if(options.merge){
            let mergedGeometry = MergeGeometry(geometries)
            let buildingsMesh = new THREE.Mesh(mergedGeometry, this.mat_building)
            this.layer_objects.add(buildingsMesh)
        }

        this.layer.add(this.layer_objects)
        //this.layer.add(this.layer_colliders)

        return this.layer
    }

    Water(){

    }

}

function addBuilding(coordinates, info, height=1) {

    height = height ? height : 1
    let scale = window.CUBE_GLOBAL.MAP_SCALE || 0.05

    let shape, geometry
    let holes = []
  
    for(let i=0;i<coordinates.length;i++){
        let el = coordinates[i]
  
        if(i == 0){
            shape = GenShape(el)
        } else {
            holes.push(GenShape(el))
        }
    }
  
    for(let i=0;i<holes.length;i++){
        shape.holes.push(holes[i])
    }
    
    geometry = GenGeometry(shape, {curveSegments: 1, depth: 0.05 * height, bevelEnabled: false})
    geometry.rotateX(Math.PI / 2)
    geometry.rotateZ(Math.PI)
    
    let helper = GenHelper(geometry)

    if(helper){
        helper.name = info["name"] ? info["name"] : "Building"
        helper.info = info
    }

    return {geometry: geometry, helper: helper}
  
  
  }

function addProvince(coordinates, info, height=1){
    let shape, geometry
    // Loop for all nodes
    for(let i=0;i<coordinates.length;i++){
        
        let el = coordinates[i]
        if(typeof el[0][0] != "number"){
            shape = GenShape(el[0])
        }else{
            shape = GenShape(el)
        }

    }

    if(shape){
        // Extrude Shape to Geometry
        geometry = GenGeometry(shape, {
            curveSegments: 12,  // curves
            steps: 1, // subdividing segments
            depth: height, // Height
            bevelEnabled: false // Bevel (round corner)
        })
        
        // Adjust geometry rotation
        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)

        let helper = GenHelper(geometry)
        if(helper){
            helper.name = info["name"] ? info["name"] : "Building"
            helper.info = info
        }

        // let mesh = new THREE.Mesh(geometry, material)
        // //mesh.position.y = 0
        // mesh.info = info

        return {geometry: geometry, helper: helper}
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