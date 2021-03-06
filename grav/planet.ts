/// <reference path="./util"/>

const speedModifier = 4;//25

class Planet {
    static totalIdx = 0;
    id = Planet.totalIdx++;


    shape: createjs.Shape = new createjs.Shape();
    mass: number;
    vX: number;
    vY: number;
    fX: number = 0;
    fY: number = 0;
    x: number;
    y: number;

    isDestroyed: boolean = false;

    color: Color = new Color(randColor());

    get width(): number {
        return this.radius * 2;
    }

    get height(): number {
        return this.radius * 2;
    }

    get radius() {
        return circlueRad(this.mass * 4);
    }

    constructor(private system: SolarSystem, x, y, mass, vx = 0, vy = 0) {
        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }
        this.shape.graphics.drawCircle(0, 0, 0).setStrokeStyle(1).beginStroke('white').beginFill(this.color.toCSS());
        system.stage.addChild(this.shape);
        let p = this;
        let obj = this.shape;
        obj.regX = obj.regY = -mass;
        obj.x = x;
        obj.y = y;
        p.mass = mass;

        this.x = x;
        this.y = y;
        p.vX = vx;
        p.vY = vy;
        //p.w = p.h = mass * 2;



        this.updateShapeGraphics();
    }



    tick() {
        let t = this;

        t.vX += t.fX / t.mass;
        t.vY += t.fY / t.mass;


        t.x += t.vX / speedModifier;
        t.y += t.vY / speedModifier;

        this.updateShape();

        t.fX = t.fY = 0;
    }

    private _lastZoom = 0;
    updateShape() {
        if (this._lastZoom != this.system.zoom) {
            this._lastZoom = this.system.zoom;
            this.updateShapeGraphics();
        }
        this.shape.x = (this.x + this.system.offset.x) / Math.pow(2, this.system.zoom - 1);
        this.shape.y = (this.y + this.system.offset.y) / Math.pow(2, this.system.zoom - 1);
    }

    updateShapeGraphics() {
        let obj = this.shape;
        obj.graphics.clear();
        let g = obj.graphics
        // .f(this.color.toCSS())
            .beginFill(this.color.toCSS())
            .drawCircle(0, 0, this.radius /  Math.pow(2, this.system.zoom - 1));//"#08F"
    }

    destroy() {
        // console.log('destroy', this.id);
        this.isDestroyed = true;
        this.mass = 0;
        this.system.stage.removeChild(this.shape);
    }

    toString(){
        return `{mass: ${this.mass}, x: ${this.x}, y: ${this.y}}`;
    }
}
