import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {GPSRelativePosition} from '../utils/geotools/GeoCalculator'

let GLTF = new GLTFLoader()

export default class Model{

    constructor(center){
        this.center = center
    }

    Update(position){
        this.position = position
    }

    LoadGLTF(url, name ,displayName, world_posi, gps_posi, gps_y, scale){
        
        return new Promise((resolve, reject) => {
            
            GLTF.load(url, obj => {
                let object = obj.scene.children[0]
                if(world_posi){
                    object.position.set(world_posi.x, world_posi.y, world_posi.z)
                }

                if(gps_posi){
                    // Fill in later
                    let local_posi = GPSRelativePosition(gps_posi, this.center)
                    let y = gps_y || 1
                    object.position.set(local_posi.x, y, local_posi.y)
                }
            
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