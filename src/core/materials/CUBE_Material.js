import * as THREE from 'three'

export default class CUBE_Material{
    constructor(type){
        this.type = type
    }

    Point(property={ size: 4, color: 0xff0000, sizeAttenuation: false }){
        return new THREE.PointsMaterial( property )
    }

    Terrain(property={color: 0xfafafa, side: THREE.DoubleSide, wireframe: true}){
        return new THREE.MeshPhongMaterial(property)
    }

    GeoMap(property={transparent: true, opacity: 0.95, color: 0x2E3342, specular: 0x383D51, reflectivity: 0.6 }){
        return new THREE.MeshPhongMaterial(property)
    }

    GeoBuilding(property={transparent: true, opacity: 0.95}){
        return new THREE.MeshPhongMaterial(property)
    }

    GeoBorder(property={ color: 0x49DEFF }){
        return new THREE.LineBasicMaterial(property)
    }
}