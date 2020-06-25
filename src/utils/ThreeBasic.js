const THREE = require('three')

const Coordinate = require('./Coordinate')

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
function GPSToVector3(lat,lon,radius=6371){

    let phi   = (90-lat)*(Math.PI/180)
    let theta = (lon+180)*(Math.PI/180)

    let x = -((radius) * Math.sin(phi)*Math.cos(theta))
    let z = ((radius) * Math.sin(phi)*Math.sin(theta))
    let y = ((radius) * Math.cos(phi))

    return [x, z]

}

/**
 * Func: GPS to Three World
 * 
 * @param {Object} objPosi {lat: Latitude, lon: Longitude}
 * @param {Object} centerPosi {lat: Latitude, lon: Longitude}
 * 
 * @return {Array} THREE.Vector3
 */

// 地图投影世界上没有完美计算方法，数字地图通用的是墨卡托投影法，但墨卡托投影法计算消耗太高。1和3都能用，3不精确，1比较均衡

// 1. WGS84 通过距离和角度，三角函数计算三角边，稍微快点
// function GPSRelativePosition(objPosi, centerPosi){

//     // Get GPS distance
//     let dis = GEOLIB.getDistance({ latitude: objPosi.lat, longitude: objPosi.lon}, {latitude: centerPosi.lat, longitude: centerPosi.lon})

//     // Get bearing angle
//     let bearing = GEOLIB.getRhumbLineBearing({ latitude: objPosi.lat, longitude: objPosi.lon}, {latitude: centerPosi.lat, longitude: centerPosi.lon})

//     // Calculate X by centerPosi.x + distance * cos(rad)
//     let x = centerPosi.lon + (dis * Math.cos(bearing * Math.PI / 180))

//     // Calculate Y by centerPosi.y + distance * sin(rad)
//     let y = centerPosi.lat + (dis * Math.sin(bearing * Math.PI / 180))

//     // Reverse X (it work) 
//     return [x/100, y/100]
// }

// 2. 墨卡托投影计算法 性能消耗极高，精确
function GPSRelativePosition(objPosi, centerPosi){
    let obj = Coordinate.GetXY(objPosi.lat, objPosi.lon)
    let center = Coordinate.GetXY(centerPosi.lat, centerPosi.lon)
    //console.log([(centerPosi.x - objPosi.x)/100, (centerPosi.y - objPosi.y)/100])
    return [(center.x - obj.x)/100, (center.y - obj.y)/100]
}

// 3. 直接相对位置计算法，忽略弧度不做投影，能用，整个斜的
// function GPSRelativePosition(objPosi = [0,0], centerPosi = [0,0]){
//     return [(centerPosi[0] - objPosi[0])*1000, (centerPosi[1] - objPosi[1])*1000]
//     //return [(objPosi[0]-centerPosi[0])*1000, (objPosi[1]-centerPosi[1])*1000]
// }


function GPSCoorDistance(lat1, lon1, lat2, lon2, unit) {
	const R = 6371e3 // earth radius
    const φ1 = lat1 * Math.PI/180 // φ, λ in radians
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // in metres
}

function EPSG3857meters2degress(x,y) {
    var lon = x *  180 / 20037508.34
    //thanks magichim @ github for the correction
    var lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90; 
    return [parseFloat(lat.toFixed(6)), parseFloat(lon.toFixed(6))]
}

// 绘制一个2D的锚点
function Draw2DDot (ca, obj, canvas) {
    let x,y
    //var canvas = this.renderer.domElement
    let dotEl = document.createElement('div')
    
    dotEl.style.height = "10px"
    dotEl.style.width="10px"
    dotEl.style.background = "rgba(66,135,245,1)"
    dotEl.style.borderRadius = "100px"
    dotEl.style.position = "absolute"
    dotEl.style.opacity = 1
    dotEl.style.animationName = "dotAni"
    dotEl.style.animationDuration = "2s"
    dotEl.style.animationIteration = "3"
    
    let point = WorldToScreenPosi (ca, obj)

    x = Math.round(( 0.5 + point.x / 2 ) * ( canvas.width / window.devicePixelRatio ));
    y = Math.round(( 0.5 + -(point.y) / 2 ) * ( canvas.height / window.devicePixelRatio ));
    
    dotEl.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px) rotate(0deg)'
    dotEl.style.zIndex = 1001

    let res = {
        el: dotEl,
        x: x,
        y: y
    }

    return res
}

// 绘制一个2D的文字
function Draw2DText (left, top, deg, align, str) {
    let a = document.createElement('div')

    // Text
    let t = document.createElement('a')
    a.appendChild(t)
    t.innerHTML = str

    // Text Container
    a.style.color = "#ffffff"
    a.style.width = 16 * str.length + "px"
    a.style.marginLeft = left + "px"
    a.style.marginTop = top + "px"
    a.style.textAlign = align
    a.style.transform = 'rotate(' + deg + 'deg)'
    a.style.webkitTransform = 'rotate(' + deg + 'deg)'
    a.style.background = "rgba(66,135,245,1)"
    a.style.borderRadius = "2px"
    a.style.paddingLeft = "7px"
    a.style.paddingRight = "7px"
    a.style.paddingTop = "7px"
    a.style.paddingBottom = "7px"
    a.style.boxShadow = "0px 3px 8px 0px rgba(66, 135, 245, 0.25)"
    
    return a
}

// 计算3D坐标在2D画布上的映射, 真实位置
function WorldToScreenPosiReal (ca, cPObj) {
    
    var p = new THREE.Vector3(cPObj.realPosi.x, cPObj.realPosi.y, cPObj.realPosi.z)
    
    return p.project(ca)
}

// 计算3D坐标在2D画布上的映射
function WorldToScreenPosi (ca, cPObj) {
    
    var p = new THREE.Vector3(cPObj.position.x, cPObj.position.y, cPObj.position.z)
    
    return p.project(ca)
}

module.exports = {
    AddGroup: AddGroup,
    GPSToVector3: GPSToVector3,
    EPSG3857meters2degress: EPSG3857meters2degress,
    Draw2DDot: Draw2DDot,
    Draw2DText: Draw2DText,
    WorldToScreenPosi: WorldToScreenPosi,
    WorldToScreenPosiReal: WorldToScreenPosiReal,
    GPSRelativePosition: GPSRelativePosition
}