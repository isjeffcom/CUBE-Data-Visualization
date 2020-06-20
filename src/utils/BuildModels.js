// Import THREE
const THREE = require('three')
const BGU = require("three/examples/jsm/utils/BufferGeometryUtils.js")
const ThreeBasic = require('./ThreeBasic')
const { Path } = require('three')

const MAT_BUILDING = new THREE.MeshPhongMaterial({transparent: true, opacity: 0.95})
//const MAT_ROAD = new THREE.LineBasicMaterial( { color: 0x0000ff } )

let Building_Models = []
let Building_Colliders = []

function Init(features){

    // Max building number
    let count = features.length
    
    // Set limitation
    //if(features.length > 1000) count = 1000

    // Render all building
    for(let i=0;i<count;i++){
        
        let fel = features[i]

        // Just in case properties value does not exist
        if(!fel["properties"]) return

        let info = fel["properties"]

        // If is building
        if(info["building"]){
            // Render building
            let building = SingleBuilding(fel.geometry.coordinates, info, info["building:levels"])
            Building_Models = Building_Models.concat(building.geometries)
            Building_Colliders = Building_Colliders.concat(building.helpers)
        }
        
        // If is road
        else if(info["highway"]){
            
            // Render Roads
            //if(fel.geometry.type == "LineString" && info.highway != "pedestrian" && info.highway != "footway") this.addRoad(fel.geometry.coordinates, info)
        }
    }
    let mergeGeometry = BGU.BufferGeometryUtils.mergeBufferGeometries(Building_Models)
    let mesh = new THREE.Mesh(mergeGeometry, MAT_BUILDING)
    //console.log(mesh)
    return mesh
    //return {building: mesh}
    
}

function SingleBuilding(d, info, height=1){

    let geometries = []
    let helpers = []

    // default height
    height = height ? height : 1
      
    // Loop for all nodes
    for(let i=0;i<d.length;i++){

      let el = d[i]

      let geometry = GenBuilding(el, this.Center, height)

      // Adjust geometry rotation
      geometry.rotateX(Math.PI / 2)
      geometry.rotateZ(Math.PI)

      // Push to array ready for merge
      geometries.push(geometry)

      // Add Helper for user interaction
      let helper = GenHelper(geometry)

      // Attach info
      helper.name = info["name"] ? info["name"] : "Building"
      helper.infoType = "Building"
      helper.info = info

      helpers.push(helper)

    }

    return { geometries: geometries, helpers: helpers }
}

function GenBuilding(coordinates, center, height){
    // // Create Shape
    let shape = GenShape(coordinates, center)

    // Extrude Shape to Geometry
    let geometry = GenBuildingGeometry(shape, {
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
function GenBuildingGeometry(shape, extrudeSettings){

    let geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings )
    geometry.computeBoundingBox()

    return geometry
}



function GenShape(points, center){
    // Create a shape object for create model after
    let shape = new THREE.Shape()

    

    // Get deeper layer of point data
    for(let ii=0;ii<points.length;ii++){
        let elp = points[ii]

        //convert position from the center position
        elp = ThreeBasic.GPSRelativePosition({ lat: elp[1], lon: elp[0] }, center)

        // Draw shape
        if(ii == 0){
            shape.moveTo(elp[0], elp[1])
        } else {
            shape.lineTo(elp[0], elp[1])
        }
    }

    return shape
}

function GenHelper(geometry){

    if(!geometry.boundingBox){
        geometry.computeBoundingBox()
    }

    let box3 = geometry.boundingBox
    let helper = new THREE.Box3Helper( box3, 0xffff00 )
    return helper
}

function GenAnimatedLine(data=[[0,0], [4,4]]){

    let mat = new THREE.LineDashedMaterial({ color: 0xff9900 })

    let points = []
    points.push( new THREE.Vector3( data[0][0], 0.1, data[0][1] ) )
    points.push( new THREE.Vector3( data[1][0], 0.1, data[1][1] ) )
    
    let geometry = new THREE.BufferGeometry().setFromPoints( points )
    let line = new THREE.Line( geometry, mat )

    
}

function GenLine(data){
    let points = GenLinePoints(data)
    return new THREE.BufferGeometry().setFromPoints( points )
}

function GenLinePoints(data, center){
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
      elp = ThreeBasic.GPSRelativePosition({ lat: elp[1], lon: elp[0] }, center)
      console.log(elp)
      
      // Draw Line
      points.push( new THREE.Vector3( elp[0], 0.1, elp[1] ) )
    }

    return points
}

function GenWaterGeometry(shape, config){
    let geometry = new THREE.ExtrudeBufferGeometry( shape, config )
    geometry.computeBoundingBox()

    return geometry
    //return new THREE.PlaneBufferGeometry(shape)
}


module.exports = {
    Init: Init,
    GenLine: GenLine,
    GenShape: GenShape,
    GenBuildingGeometry: GenBuildingGeometry,
    GenWaterGeometry: GenWaterGeometry,
    GenBuilding: GenBuilding,
    GenHelper: GenHelper
}