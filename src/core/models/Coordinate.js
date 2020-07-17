class GPSCoordinate{
    constructor(latitude, longitude) {
        this.latitude = latitude
        this.longitude = longitude
    }
}

class WorldCoordinate{
    constructor(x, y){
        this.x = x
        this.y = y
    }
}

export { GPSCoordinate, WorldCoordinate }