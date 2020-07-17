
class CoorinateCalculator {
    constructor(objPosi, centerPosi){
        let obj = Mercator(objPosi.latitude, objPosi.longitude)
        let center = Mercator(centerPosi.latitude, centerPosi.longitude)

        this.x = (center.x - obj.x) / 100
        this.y = (center.y - obj.y) / 100

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



