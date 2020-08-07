
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

    Point(coordinate, value, size=.5, color=0xff6600){

    }

    Sphere(coordinate, value=1, size=2, color=0xff6600){

        let local_coor = new Coordinate("GPS", coordinate).ComputeWorldCoordinate()

        let geometry = new THREE.SphereBufferGeometry( size*3, value*size, value*size )
        let material = new THREE.MeshBasicMaterial( {color: color} )
        let sphere = new THREE.Mesh( geometry, material )

        sphere.position.set(-local_coor.world.x, 0, local_coor.world.z)
        return sphere
    }

    Bar(coordinate, value, size=.5, color=0xff6600){

        let height = HEIGHT_SCALE * value

        let local_coor = new Coordinate("GPS", coordinate).ComputeWorldCoordinate()

        let geometry = new THREE.BoxBufferGeometry( size, size, height, SEGMENTS ) // top, bottom, height, segments

        let material = new THREE.MeshPhongMaterial( {color: color} )
        let bar = new THREE.Mesh( geometry, material )
        
        
        //Rotate around X 90deg 绕X轴旋转90度
        bar.rotateOnAxis(axisX, THREE.Math.degToRad(90))

        bar.position.set(-local_coor.world.x, 0.05+((height/2)), local_coor.world.z)
        //bar.rotateY(Math.PI / 2)

        return bar
    }

    Cylinder(coordinate, value, size=.5, color=0xff6600){

        let height = HEIGHT_SCALE * value

        let local_coor = new Coordinate("GPS", coordinate).ComputeWorldCoordinate()

        let geometry = new THREE.CylinderBufferGeometry( size, size, height, SEGMENTS ) // top, bottom, height, segments

        let material = new THREE.MeshPhongMaterial( {color: color} )
        let cylinder = new THREE.Mesh( geometry, material )

        //Rotate around X 90deg 绕X轴旋转90度
        //cylinder.rotateOnAxis(axisX, THREE.Math.degToRad(90))

        cylinder.position.set(-local_coor.world.x, 0.05+((height/2)), local_coor.world.z)

        return cylinder
    }

    Arc(coorA, coorB, size=6, height=5, color=0xff6600){
        let localA = new Coordinate("GPS", coorA).ComputeWorldCoordinate()
        let localB = new Coordinate("GPS", coorB).ComputeWorldCoordinate()
        let localCenter = new Coordinate("GPS", getCenter([coorA, coorB])).ComputeWorldCoordinate()

        let arcLine = new THREE.CatmullRomCurve3([
            new THREE.Vector3( -localA.world.x, 0, localA.world.z ),
            new THREE.Vector3( -localCenter.world.x, height, localCenter.world.z ),
            new THREE.Vector3( -localB.world.x, 0, localB.world.z )
        ], false,"catmullrom")
        
        var points = arcLine.getPoints( 50 )
        var geometry = new THREE.BufferGeometry().setFromPoints( points )
        geometry.computeBoundingSphere()
        geometry.boundingSphere.center = new THREE.Vector3(localCenter.world.x, 0, localCenter.world.z)
        console.log(geometry.boundingSphere.center)

        var material = new THREE.LineBasicMaterial( { color : color, linewidth: size } )
        var arc = new THREE.Line( geometry, material )


        //Rotate around X 90deg 绕X轴旋转90度
        //arc.rotateOnAxis(axisY, THREE.Math.degToRad(90))

        return arc
    }

}

export { Data }
