import * as THREE from 'three'
import { Coordinate } from '../coordinate/Coordinate'
import {GenShape, GenGeometry, GenHelper, MergeGeometry, GenWaterGeometry } from '../utils/ModelBuilder'
import { Line2 } from 'three/examples/jsm/lines/Line2.js' // Fat Line
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { Water } from 'three/examples/jsm/objects/Water'

import CUBE_Material from '../materials/CUBE_Material'


export class GeoJsonLayer{

    constructor(geojson, name){
        this.geojson = geojson["features"]
        this.name = name

        // Main Layer
        this.layer = new THREE.Group()
        this.layer.name = name

        
        this.materials = []

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
     * @param {THREE.Material} mat_line replace line material
     * @param {THREE.Material} mat_map replace map main material
     * @public
    */

    AdministrativeMap(options, mat_map, mat_line){
        
        // Replace material 
        this.mat_map = mat_map ? mat_map : new CUBE_Material().GeoMap()
        this.mat_line = mat_line ? mat_line : new CUBE_Material().GeoBorder()

        // Register material
        this.materials.push(this.mat_map)
        this.materials.push(this.mat_line)

        let features = this.geojson
        let height = options.height ? options.height : 2

        let geometries = []

        // Render all buildings
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

    /**
     * @param {Object} options {merge: Boolean} merge: if use merge function to optimise performance
     * @param {THREE.Material} mat replace building material
     * @public
    */

    Buildings(options, mat){

        // Replace material
        this.mat_building = mat ? mat : new CUBE_Material().GeoBuilding()

        // Register material
        this.materials.push = this.mat_building

        let features = this.geojson

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

    Road(options, mat){

        //let geometries = []

        let features = this.geojson

        // Set material
        if(options.fat){
            this.mat_road = new CUBE_Material().GeoRoad()
        } else {
            this.mat_road = new CUBE_Material().GeoRoad2()
        }

        // Replace material interface
        this.mat_road = mat ? mat : this.mat_road

        // Register material
        this.materials.push(this.mat_road)

        // If merge, set material renderresolution
        if(options.fat) this.mat_road.resolution.set( window.innerWidth, window.innerHeight )

        //this.mat_road.resolution.set( window.innerWidth, window.innerHeight )

        for(let i=0;i<features.length;i++){
            let fel = features[i]

            // Just in case properties value does not exist
            if(!fel["properties"]) return

            let info = fel["properties"]
            //let selectTags = info.tags ? "tags" : "properties"
            // Only render when geometry is Polygon
            let tags = false
            if(info["highway"] != "undefined"){
                tags = info.highway
            }

            else if( info["tags"]["highway"] != "undefined"){
                tags = info.tags.highway
            }
            
            if(tags){
                // Render Roads
                if(fel.geometry.type == "LineString" && tags != "pedestrian" && tags != "footway" && tags != "path"){
                    let road = addRoad(fel.geometry.coordinates, options.fat)
                    if(road){
                        if(options.fat){
                            //geometries.push(road.geometry)
                            let line = new Line2( road.geometry, this.mat_road )
                            line.computeLineDistances()
                            this.layer.add(line)
                        }

                        else {
                            
                            let line = new THREE.Line( road.geometry, this.mat_road )
                            line.info = info
                            line.computeLineDistances()

                            // Adjust position
                            line.position.set(line.position.x, 1, line.position.z)

                            // Disable matrix auto update for performance
                            line.matrixAutoUpdate = false
                            line.updateMatrix()
                            this.layer.add(line)
                        }
                    }
                }
            }
        }

        // Merge geometry for performance
        // if(options.merge){
        //     let mergedGeometry = MergeLineGeometry(geometries)
        //     let roadMesh = new THREE.LineSegments(mergedGeometry, this.mat_road)
        //     roadMesh.position.set(roadMesh.position.x, 1.1, roadMesh.position.z)
        //     this.layer.add(roadMesh)
        //     //console.log(geometries[0])
        // }

        return this.layer
    }

    Water(options){

        let sun = new THREE.Light("#ffffff", .5)
        sun.position.set(0, 4, 0)
        let mat_water = new CUBE_Material().GeoWater(sun, true)

        let features = this.geojson

        let geometries = []

        for(let i=0;i<features.length;i++){
            let fel = features[i]
            if(!fel['properties']) return

            if(fel.properties['tags']['natural'] == "water" && fel.geometry.type == "Polygon"){
                let water = addWater(fel.geometry.coordinates, fel.properties)
                if(options.merge){
                    geometries.push(water.geometry)
                }else{
                    let mesh = new Water(water.geometry, mat_water)
                    this.layer.add(mesh)
                }
            }
        }

        if(options.merge){
            let merged = MergeGeometry(geometries)
            let mesh = new Water(merged, mat_water)
            this.layer.add(mesh)
        }

        return this.layer

        
    }

    GetMaterials(){
        return this.materials
    }

}

function addBuilding(coordinates, info, height=1) {

    height = height ? height : 1

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
    
    geometry = GenGeometry(shape, {curveSegments: 1, depth: 0.1 * height, bevelEnabled: false})
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

function addRoad(d, fat){

    // Init points array
    let points = []

    // Loop for all nodes
    for(let i=0;i<d.length;i++){
        
        if(!d[0][1]) return
        
        let el = d[i]

        //Just in case
        if(!el[0] || !el[1]) return
        
        let elp = [el[0], el[1]]

        //convert position from the center position
        elp = new Coordinate("GPS", {latitude: elp[1], longitude: elp[0]}).ComputeWorldCoordinate()
        //elp = ThreeBasic.GPSRelativePosition({latitude: elp[1], longitude: elp[0]}, this.Center)

        // WAIT FOR MERGE adjust height according to terrain data
        // Rotate
        var vector = new THREE.Vector3( elp.world.x, elp.world.y, elp.world.z )
        var axis = new THREE.Vector3( 0, 0, 1 )
        var angle = Math.PI

        vector.applyAxisAngle( axis, angle )
        
        // // Fit Terrain
        // let dem = this.ShortEst({x: vector.x, z: vector.z}, this.terrainData.vertices)
        
        // //console.log(dem.y)
        // let y
        // if(dem) {y = -dem.y} else {y = 0.5}
        
        // Draw Line
        if(fat){
            points.push(elp.world.x, elp.world.y + 1, elp.world.z)
        } else {
            points.push( new THREE.Vector3( elp.world.x, elp.world.y + 1, elp.world.z ) )
        }
        
    }
    let geometry
    if(fat){
        geometry = new LineGeometry()
        geometry.setPositions(points)
    } else {
        geometry = new THREE.BufferGeometry().setFromPoints( points )
    }
    

    // Adjust geometry rotation
    geometry.rotateZ(Math.PI)

    

    // if(this.FLAG_ROAD_ANI){
    //   let lineLength = geometry.attributes.lineDistance.array[ geometry.attributes.lineDistance.count - 1]
    //   if(lineLength > 0.8){
    //     let aniLine = this.addAnimatedLine(geometry, lineLength)
    //     //this.Animated_Lines.push(aniLine)
    //     this.iR_Line.add(aniLine)
    //   }
    // }

    // Calculate Real Position
    //let realPosi = ThreeBasic.GPSRelativePosition({lat: d[parseInt(d.length / 2)][1], lon: d[parseInt(d.length / 2)][0]}, this.Center)
    //line.realPosi = new THREE.Vector3(realPosi[0], line.position.y, realPosi[1])


    

    return {geometry: geometry}
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

function addWater(d){
    
    let holes = []
    let shape, geometry

    for(let i=0;i<d.length;i++){
        let el = d[i]
        if(i==0){
            shape = GenShape(el)
        } else {
            holes.push(GenShape(el))
        }
    }

    // Punch a hole
    for(let h=0;h<holes.length;h++){
        shape.holes.push(holes[h])
    }

    geometry = GenWaterGeometry(shape, {
        curveSegments: 2,  // curves
        steps: 1, // subdividing segments
        depth: 0.01, // Height
        bevelEnabled: false // Bevel (round corner)
    })

    //geometry.rotation.x = - Math.PI / 2;

    // Adjust geometry rotation
    geometry.rotateX(Math.PI / 2)
    geometry.rotateZ(Math.PI)

    return {geometry: geometry}
}