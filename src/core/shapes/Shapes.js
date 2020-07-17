import { Vector3 } from "three"
import * as THREE from 'three'

export class Shapes {
    constructor(name="shape", position=new Vector3(0,0,0)){
        this.name = name
        this.position = position
    }

    Box(size=1, color=0x00ff00){
        let geometry = new THREE.BoxBufferGeometry( size, size, size )
        let material = new THREE.MeshPhongMaterial( {color: color} )
        let cube = new THREE.Mesh( geometry, material )
        cube.position.set(this.position.x, this.position.y, this.position.z)
        return cube
    }
}