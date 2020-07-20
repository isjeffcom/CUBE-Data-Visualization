
import * as THREE from 'three'
import { getCenter } from 'geolib'
import { Coordinate } from '../coordinate/Coordinate'

let HEIGHT_SCALE = .5
let SEGMENTS = 16

let axisX = new THREE.Vector3(1,0,0)
let axisY = new THREE.Vector3(0,1,0)
let axisZ = new THREE.Vector3(0,0,1)


// pass in an a single data
export default class Data {

    constructor(name){
        this.name = name
    }

    Bar(coordinate, value, size=.5, color=0xff6600){

        let height = HEIGHT_SCALE * value

        let local_coor = new Coordinate("GPS", coordinate)

        let geometry = new THREE.BoxBufferGeometry( size, size, height, SEGMENTS ) // top, bottom, height, segments

        let material = new THREE.MeshPhongMaterial( {color: color} )
        let bar = new THREE.Mesh( geometry, material )
        
        
        //Rotate around X 90deg 绕X轴旋转90度
        bar.rotateOnAxis(axisX, THREE.Math.degToRad(90))

        bar.position.set(-local_coor.x, 0.05+((height/2)), local_coor.z)
        //bar.rotateY(Math.PI / 2)

        return bar
    }

    Cylinder(coordinate, value, size=.5, color=0xff6600){

        let height = HEIGHT_SCALE * value

        let local_coor = new Coordinate("GPS", coordinate)

        let geometry = new THREE.CylinderBufferGeometry( size, size, height, SEGMENTS ) // top, bottom, height, segments

        let material = new THREE.MeshPhongMaterial( {color: color} )
        let cylinder = new THREE.Mesh( geometry, material )

        //Rotate around X 90deg 绕X轴旋转90度
        //cylinder.rotateOnAxis(axisX, THREE.Math.degToRad(90))

        cylinder.position.set(-local_coor.x, 0.05+((height/2)), local_coor.z)

        return cylinder
    }

    Arc(coorA, coorB, size=6, height=5, color=0xff6600){
        let localA = new Coordinate("GPS", coorA)
        let localB = new Coordinate("GPS", coorB)
        let localCenter = new Coordinate("GPS", getCenter([coorA, coorB]))

        let arcLine = new THREE.CatmullRomCurve3([
            new THREE.Vector3( -localA.x, 0, localA.z ),
            new THREE.Vector3( -localCenter.x, height, localCenter.z ),
            new THREE.Vector3( -localB.x, 0, localB.z )
        ], false,"catmullrom")
        
        var points = arcLine.getPoints( 50 )
        var geometry = new THREE.BufferGeometry().setFromPoints( points )
        geometry.computeBoundingSphere()
        geometry.boundingSphere.center = new THREE.Vector3(localCenter.x, 0, localCenter.z)
        console.log(geometry.boundingSphere.center)

        var material = new THREE.LineBasicMaterial( { color : color, linewidth: size } )
        var arc = new THREE.Line( geometry, material )


        //Rotate around X 90deg 绕X轴旋转90度
        //arc.rotateOnAxis(axisY, THREE.Math.degToRad(90))

        return arc
    }

}

export { Data }
