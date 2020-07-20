import * as THREE from 'three'
import Data from './Data'
import PS_Heatmap from '../shader/PS_Heatmap'
import CUBE_Material from '../materials/CUBE_Material'
import { Coordinate } from '../coordinate/Coordinate'

// Pass in an array of data
export class Datasets extends Data{
    constructor(name, data){
        super()
        this.name = name
        this.data = data
        this.mat_point = new CUBE_Material().Point()
        this.center = window.CUBE_GLOBAL.CENTER

        // New Layer
        this.layer = new THREE.Group()
        this.layer.name = name
    }

    PointCloud(){
        for(let i=0;i<this.data.length;i++){

            // Position
            let posi = new Coordinate("GPS", this.data[i].location).ComputeWorldCoordinate()

            // Geometry
            var geometry = new THREE.Geometry()
            geometry.vertices.push(new THREE.Vector3( 0, 0, 0))

            // Point mesh
            let mesh = new THREE.Points(geometry, this.mat_point)
            mesh.position.set(posi.world.x, posi.world.y, posi.world.z)

            // Add to layer
            this.layer.add(mesh)

        }

        return this.layer
    }

    Heatmap(size=256, radius=50){
        let shader = new PS_Heatmap()

        let heightMap = HeightMap(size, radius)

        let planeGeometry = new THREE.PlaneBufferGeometry(size, size, 1000, 1000)
        planeGeometry.rotateX(-Math.PI * 0.5)

        let heat = new THREE.Mesh(planeGeometry, new THREE.ShaderMaterial({
            uniforms: {
                heightMap: {value: heightMap},
                heightRatio: {value: Math.floor(size / 10)},
                heightColor: {value: 1}
            },
            vertexShader: shader.GetVertex(),
            fragmentShader: shader.GetFragment(),
            transparent: true,
            opacity: 0.95
        }))


        heat.scale.set(0.08, 0.08, 0.08)
        heat.position.y = 0.5

        return heat
    }
    
}

function HeightMap(size=256, radius=50){

    let canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    let ctx = canvas.getContext("2d")
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, size, size)
    for(let i = 0; i < 100; i++){
        let x = Math.floor(Math.random() * 255)
        let y = Math.floor(Math.random() * 255)
        let grd = ctx.createRadialGradient(x, y, 1, x, y, radius)
        let h8 = Math.floor(Math.random() * 255)
        grd.addColorStop(0, "rgb("+ h8 + "," + h8 + "," + h8 +")")
        grd.addColorStop(1, "transparent")
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, size, size)
    }
    return new THREE.CanvasTexture(canvas)
}