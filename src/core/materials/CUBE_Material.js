import * as THREE from 'three'

export default class CUBE_Material{
    constructor(type){
        this.type = type
    }

    GeoMap(){
        return new THREE.MeshPhongMaterial({transparent: true, opacity: 0.95, color: 0x2E3342, specular: 0x383D51, reflectivity: 0.6 })
    }

    GeoBorder(){
        return new THREE.LineBasicMaterial( { color: 0x49DEFF } )
    }
}