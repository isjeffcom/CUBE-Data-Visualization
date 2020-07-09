const { construct } = require("core-js/fn/reflect")

class Rectangle {
    constructor(x,y,w,h){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }
}

class QuadTree{
    constructor(boundary){
        this.boundary = boundary
    }

}