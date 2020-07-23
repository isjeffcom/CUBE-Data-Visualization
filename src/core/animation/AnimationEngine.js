import TWEEN from '@tweenjs/tween.js'

export class AnimationEngine{

    constructor(ins){
        this.ins = ins
        this.allTween = []
        this.allCircular = []
    }

    Register(animation){
        if(animation.type == "tween"){
            this.allTween.push(animation)
            this.ins.Add(animation.object)
        }

        if(animation.type == "circular"){
            this.allCircular.push(animation)
            this.ins.Add(animation.object)
        }
    }

    Update(){
        if(this.allCircular.length > 0){

            this.allCircular.forEach(ani => {

                // if(ani.state != 1) return

                ani.angle += 0.005
    
                let x = 3 * Math.sin(ani.angle)
    
                let z = 3 * Math.cos(ani.angle)
    
                ani.object.position.set(x, 5, z)
            })
        }

        if(this.allTween.length > 0){
    
            TWEEN.update()
        }

    }
}