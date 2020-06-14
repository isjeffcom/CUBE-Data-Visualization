
/**
 * Mercator projection WGS84 > X,Y
 * @param lat latitude
 * @param lon lontitude
 * @returns {{}}
 * @private
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
/**
 * Mercator projection X,Y > WGS84
 * @param poi 墨卡托
 * @returns {{}}
 * @private
 */
function GetWGS84(poi){
    var lnglat = {}
    lnglat.lng = poi.x/20037508.34*180
    var mmy = poi.y/20037508.34*180
    lnglat.lat = 180/Math.PI*(2*Math.atan(Math.exp(mmy*Math.PI/180))-Math.PI/2)
    return lnglat
}

module.exports = {
    GetXY: GetXY,
    GetWGS84: GetWGS84
}