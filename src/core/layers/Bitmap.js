import * as THREE from 'three'
import deepmerge from 'deepmerge'
import { Coordinate } from '../coordinate/Coordinate'

const tileDefaultOptions = {
    source: "https://b.tile.openstreetmap.org/",
    size: 10, // will size^2
    //url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}',
    copyright: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
}

/**
 * Create a bitmap layer
 * @class
*/

export class BitmapLayer {

    /**
     * Init layer
     * @param {String} name name of the layer
     * @public
    */

    constructor(name){
        this.center = window.CUBE_GLOBAL.CENTER
        this.layer = new THREE.Group()
        this.layer.name = name
    }

    /**
     * Tilemap layer, based on openstreetmap wrap by Leaflet.js
     * @param {Object} opt options to overwrite config
     * @public
    */

    TileMap(opt={}){

        let options = deepmerge(tileDefaultOptions, opt)

        let zoom = window.CUBE_GLOBAL.MAP_SCALE
        zoom = zoom > 1 ? zoom : 1

        let size = options.size

        let map = new THREE.Group()

        //let tile = deepmerge(tileDefaultOptions, options)
        let c = new Coordinate("GPS", this.center).ComputeTileCoordinate(zoom)

        // Get 9 mataix tiles
        let textures = []
        let m = [
            [-1, 1], [0, 1], [1, 1],
            [-1, 0],  [0, 0], [1, 0],
            [-1, -1], [0, -1], [1, -1],
        ]

        for(let i=0;i<9;i++){
            let x = c.tile.x - m[i][0]
            let y = c.tile.y - m[i][1]
            let req = options.source + zoom + "/" + x + "/" + y + ".png"
            let t = new THREE.TextureLoader().load( req )
            textures.push(t)
        }
        // let textureUrl = options.source + zoom + "/" + c.tile.x + "/" + c.tile.y + ".png"
        //let texture = new THREE.TextureLoader().load( textureUrl )
        // console.log(textureUrl)

        for(let t=0;t<textures.length;t++){
            let geometry = new THREE.PlaneBufferGeometry(size, size, 1, 1)
            let mat = new THREE.MeshBasicMaterial( { map: textures[t] } )
            geometry.rotateX(- Math.PI / 2)

            let ground = new THREE.Mesh(geometry, mat)
            ground.position.set(-m[t][0]*size, 0, -m[t][1]*size)
            map.add(ground)
        }
        
        // geometry.rotateY(Math.PI)
        // geometry.rotateZ(Math.PI)

        this.layer.add(map)
        return this.layer
    }
}