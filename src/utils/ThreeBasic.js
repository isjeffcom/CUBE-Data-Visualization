const THREE = require('three')
/**
 * Func: Create a THREE Group
 * 
 * @param {string} name Group Name
 * @param {string} displayName Display Name
 * 
 * @return {Object} THREE.Group Object
 */
function AddGroup(name, displayName){
    let g = new THREE.Group();g.name = name; g.displayName = displayName; return g;
}

module.exports = {
    AddGroup: AddGroup
}