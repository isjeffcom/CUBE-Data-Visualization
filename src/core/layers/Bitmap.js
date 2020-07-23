import * as THREE from 'three'
import deepmerge from 'deepmerge'
import { Coordinate } from '../coordinate/Coordinate'

const tileDefaultOptions = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}',
    copyright: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
}

export class BitmapLayer {

    constructor(name){
        this.center = window.CUBE_GLOBAL.CENTER

        this.layer = new THREE.Group()
        this.layer.name = name

        
    }

    TileMap(options={}){

        let zoom = window.CUBE_GLOBAL.MAP_SCALE
        zoom = zoom > 1 ? zoom : 1

        //let tile = deepmerge(tileDefaultOptions, options)
        let c = new Coordinate("GPS", this.center).ComputeTileCoordinate(zoom)
        console.log(c)
        let textureUrl = "https://b.tile.openstreetmap.org/" + zoom + "/" + c.tile.x + "/" + c.tile.y + ".png"
        let texture = new THREE.TextureLoader().load( textureUrl )

        let geometry = new THREE.PlaneBufferGeometry(10, 10, 1, 1)
        let mat = new THREE.MeshBasicMaterial( { map: texture } )
        let ground = new THREE.Mesh(geometry, mat)

        geometry.rotateX(- Math.PI / 2)
        // geometry.rotateY(Math.PI)
        // geometry.rotateZ(Math.PI)

        this.layer.add(ground)
        return this.layer
    }
}