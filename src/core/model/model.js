import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

let GLTF = new GLTFLoader()

export default class Model{

    constructor(coordinate){
        // If no world coordinate than computed
        if(!coordinate.world) coordinate.computeWorldCoordinate()
        this.position = new THREE.Vector3(coordinate.world.x, coordinate.world.y, coordinate.world.z)
    }

    Update(position){
        this.position = position
    }

    LoadGLTF(url, name, displayName, scale){
        
        return new Promise((resolve, reject) => {
            
            GLTF.load(url, obj => {
                let object = obj.scene.children[0]
                object.position.set(this.position.x, 0, this.position.z)

            
                object.name = name
                object.displayName = displayName

                if(scale){
                    object.scale.x = scale
                    object.scale.y = scale
                    object.scale.z = scale
                }

                resolve(object)

            }, null, reject)
          })
    }
}