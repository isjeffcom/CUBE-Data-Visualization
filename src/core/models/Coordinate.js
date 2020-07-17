import { MAP_SCALE } from '../static/constants'

/**
 * @class Main constructor, provides main space runtime, allow limited config, insert animation engine and shader engine
 * @param {Object} options { latitude: Number, longitude: Number, altitude: Number, x: Number, y: Number, z: Number }
 * @public
 * 
 * Notice: Be aware that the altitude is not the real altitude, it is the y value, but it can be in the future
 */

export class Coordinate{

    constructor(type, options, center) {
        if(type == "gps"){
            this.world = null
            this.gps = new GPSCoordinate(options.latitude, options.longitude, options.altitude)
        }

        if(type == "world"){
            this.gps = null
            this.world = new WorldCoordinate(options.x, options.y, options.z)
        }
        
        this.center = center
    }

    computeWorldCoordinate(){
        let obj = Mercator(this.gps.latitude, this.gps.longitude)
        let center = Mercator(this.center.latitude, this.center.longitude)
    
        this.world.x = (center.x - obj.x) * MAP_SCALE
        this.world.z = (center.y - obj.y) * MAP_SCALE
        this.world.y = this.gps.altitude * MAP_SCALE
    }
}

/**
 * @class GPS coordination
 * @param {Number} latitude latitude
 * @param {Number} longitude longitude
 * @private
 */

class GPSCoordinate{
    constructor(latitude, longitude, altitude) {
        this.latitude = latitude
        this.longitude = longitude
        this.altitude = altitude
    }
}


/**
 * @class World coordination
 * @param {Number} x latitude
 * @param {Number} y longitude
 * @private
 */

class WorldCoordinate{
    constructor(x, y, z){
        this.x = x
        this.y = y
        this.z = z
    }

    computeGPSCoordinate(scale=100){
        // Reserved
    }
}

function Mercator(lat, lon) {
    var mercator = {}
    var earthRad = 6378137

    mercator.x = lon * Math.PI / 180 * earthRad
    var a = lat * Math.PI / 180
    mercator.y = earthRad / 2 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)))
    return mercator
}

function MercatorReverse(x, y) {
    // Reserved
}
