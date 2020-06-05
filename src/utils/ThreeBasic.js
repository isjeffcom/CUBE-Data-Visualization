const THREE = require('three')

/**
 * Func: Create a THREE Group
 * 
 * @param {String} name Group Name
 * @param {String} displayName Display Name
 * 
 * @return {Object} THREE.Group Object
 */
function AddGroup(name, displayName){
    let g = new THREE.Group();g.name = name; g.displayName = displayName; return g;
}

/**
 * Func: GPS to Three World
 * 
 * @param {Number} lat Latitude
 * @param {Number} lon Longtitude
 * @param {Number} radius Radius
 * 
 * @return {THREE.Vector3} THREE.Vector3
 */
function GPSToVector3(lat,lon,radius){

    let phi   = (90-lat)*(Math.PI/180)
    let theta = (lon+180)*(Math.PI/180)

    let x = -((radius) * Math.sin(phi)*Math.cos(theta))
    let z = ((radius) * Math.sin(phi)*Math.sin(theta))
    let y = ((radius) * Math.cos(phi))

    return new THREE.Vector3(x,y,z)
}

/**
 * Func: GPS to Three World
 * 
 * @param {Array} objPosi [lat, lon]
 * @param {Array} centerPosi [lat, lon]
 * 
 * @return {Array} THREE.Vector3
 */

function GPSRelativePosition(objPosi = [0,0], centerPosi = [0,0]){
    //console.log(objPosi)
    //console.log(centerPosi)
    return [(objPosi[0]-centerPosi[0])*1000, (objPosi[1]-centerPosi[1])*1000]
}

module.exports = {
    AddGroup: AddGroup,
    GPSToVector3: GPSToVector3,
    GPSRelativePosition: GPSRelativePosition
}