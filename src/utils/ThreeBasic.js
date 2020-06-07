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

// 计算3D坐标在2D画布上的映射
function WorldToScreenPosi (ca, cPObj) {
    
    var p = new THREE.Vector3()
    
    p.x = cPObj.position.x
    p.y = cPObj.position.y
    p.z = cPObj.position.z
    
    return p.project(ca)
}

module.exports = {
    AddGroup: AddGroup,
    GPSToVector3: GPSToVector3,
    Draw2DDot: Draw2DDot,
    Draw2DText: Draw2DText,
    WorldToScreenPosi: WorldToScreenPosi,
    GPSRelativePosition: GPSRelativePosition
}