const GEOLIB = require('geolib')


/**
 * Mercator projection WGS84 > X,Y
 * @param lat latitude
 * @param lon lontitude
 * @return {object} {x: x, y: y}
 * @public
 */

function GetXY(lat, lon) {//[114.32894, 30.585748]
    var mercator = {}
    var earthRad = 6378137.0
    // console.log("mercator-poi",poi)
    mercator.x = lon * Math.PI / 180 * earthRad
    var a = lat * Math.PI / 180
    mercator.y = earthRad / 2 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)))
    // console.log("mercator",mercator)
    return mercator //[12727039.383734727, 3579066.6894065146]
}

function GetDis(start, end){
    return GEOLIB.getDistance(start, end)
}


/**
 * Create a square by center and distance(-*-)
 * @param {object} center {lat: latitude, lon: lontitude}
 * @param {number} dis in meter
 * @returns {object} four direction coordinate {east: east, south: south, west: west, north: north, }
 * @public
 */
function MakeBBox(center, dis){
    let res = {}
    //console.log(center)
    res.east = GEOLIB.computeDestinationPoint(
        { latitude: center.latitude, longitude: center.longitude },
        dis,
        90
    )

    res.west = GEOLIB.computeDestinationPoint(
        { latitude: center.latitude, longitude: center.longitude },
        dis,
        270
    )

    res.north = GEOLIB.computeDestinationPoint(
        { latitude: center.latitude, longitude: center.longitude },
        dis,
        0
    )

    res.south = GEOLIB.computeDestinationPoint(
        { latitude: center.latitude, longitude: center.longitude },
        dis,
        180
    )

    return res
}



module.exports = {
    GetXY: GetXY,
    GetDis: GetDis,
    MakeBBox: MakeBBox
}