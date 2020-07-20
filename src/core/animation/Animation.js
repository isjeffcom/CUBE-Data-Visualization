import * as THREE from 'three'
import { GPSRelativePosition } from '../utils/geotools/GeoCalculator'
import TWEEN from '@tweenjs/tween.js'


export default class Animation {
    // State 0: stop, 1: playing, 2: paused, 99: infinite
    constructor(name, object, type, center){
        this.name = name
        this.object = object
        this.center = center
        this.type = type
        
        // Storage state
        this.state = 0
        this.angle = 0

        // Tween objects
        this.tweens = []
    }

    GPSPath(path, duration){

        let paths = []

        for(let i=0;i<path.length;i++){
            let posi = GPSRelativePosition(path[i], this.center)
            paths.push(posi)
        }

        paths.forEach(el => {
            for(let i=0;i<el.path.length;i++){
                let tween = new TWEEN.Tween( el.obj.position ).to( new THREE.Vector3(-el.path[i][0], el.obj.position.y, el.path[i][1]), duration )
                //console.log(el.obj.position, new THREE.Vector3(-el.path[i][0], el.obj.position.y, el.path[i][1]))
                this.tweens.push(tween)
            }
    
            for(let t=0;t<this.tweens.length;t++){
                if(t+1 < this.tweens.length){
                    this.tweens[t].chain(this.tweens[t+1])
                }
            }
        })

        return this
    }

    Play(){
        this.state = 1
    }

    Stop(){
        this.state = 0
    }

    Pause(){
        this.state = 2
    }

    Loop(){
        this.state = 99
    }
}