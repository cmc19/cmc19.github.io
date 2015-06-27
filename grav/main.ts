/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>


const speedModifier = 5;//25


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function circleArea(r) {
    return Math.PI * r * r;
}

function circlueRad(a) {
    return Math.sqrt(a / Math.PI);
}

function findAllPossibleCombos<T>(a: T[], min: number, max: number = null): T[][] {
    if (max === null) max = a.length;
    max += 1;
    var fn = function(n, src, got, all) {
        if (n == 0) {
            if (got.length > 0) {
                all[all.length] = got;
            }
            return;
        }
        for (var j = 0; j < src.length; j++) {
            fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
    }
    var all = [];
    for (var i = min; i < max; i++) {
        fn(i, a, [], all);
    }
    //all.push(a);
    return all;
}

class Page {
    system = new SolarSystem();

    mouse = { startX: 0, startY: 0 };
    // planets: createjs.Shape[] = [];
    planets: Planet[] = [];
    get canvas(): HTMLCanvasElement {
        return <HTMLCanvasElement> this.system.stage.canvas;
    }

    fillWindow() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        let stage = this.system.stage;
        $(window).on('resize', () => this.fillWindow());

        stage.on("stagemousedown", (e: createjs.MouseEvent) => {
            // console.log('stagemousedown', e);
            this.mouse.startX = e.stageX;
            this.mouse.startY = e.stageY;
        });
        stage.on("stagemouseup", (e: createjs.MouseEvent) => {
            this.createPlanet(this.mouse.startX - 5, this.mouse.startY - 5, random(2, 5), e.stageX - this.mouse.startX, e.stageY - this.mouse.startY);
        });

        createjs.Ticker.on("tick", () => this.system.tick());
        createjs.Ticker.setFPS(60);

        this.fillRandom(10, 15);
        this.fillWindow();
    }



    bodyCount: HTMLSpanElement = document.getElementById('bodyCount');
    mass: HTMLSpanElement = document.getElementById('mass');
    fpsCounter: HTMLSpanElement = document.getElementById('fps');


    createPlanet(x, y, mass, vx = 0, vy = 0) {
        this.system.createPlanet(x, y, mass, vx, vy);
    }

    fillRandom(min, max) {
        for (let i = 0; i < random(min, max); i++) {
            this.createPlanet(random(0, window.innerWidth), random(0, window.innerHeight), 1, 0, 0);
        }

    }
}

function sortBy<T, Y>(array: T[], fn: (t: T) => Y) {
    return array.slice(0).sort(function(a, b) {
        return (fn(a) > fn(b)) ? 1 : (fn(a) < fn(b)) ? -1 : 0;
    });
}

class SolarSystem {
    objects: Planet[] = [];
    stage = new createjs.Stage("canvas");
    relationships: PlanetRelationship[] = [];

    createPlanet(x, y, mass, vx = 0, vy = 0) {
        let p = new Planet(this, x, y, mass, vx, vy);
        this.objects.forEach(p2=> {
            this.relationships.push(new PlanetRelationship(p2, p));
        });
        this.objects.push(p);
    }

    tickCount = 0;
    tick() {
        // console.log('system.tick ' + this.tickCount);
        this.tickCount++;
        let allObjs = this.objects;
        let stage = this.stage;
        let ignore = [];


        this.relationships.filter(x=>x.isDestroyed == false).forEach(c => {
            c.tick();
        });

        allObjs.forEach(x=> x.tick());
        // allObjs.forEach(function(obj1) {
        //
        //      obj1.shape.x += obj1.vX / 25;
        //      obj1.shape.y += obj1.vY / 25;
        // });

        this.objects = this.objects.filter(x=> x['ignore'] === undefined);
        this.stage.update();
    }
}


class PlanetRelationship {
    static totalIdx = 0;
    id = PlanetRelationship.totalIdx++;
    a: Planet;
    b: Planet;

    get isDestroyed(){
        return this.a.isDestroyed || this.b.isDestroyed || this.a.id == this.b.id;
    }

    get largest(): Planet {
        // console.log(` ${this.a.mass} > ${this.b.mass} = ${ this.a.mass > this.b.mass}`)
        if (this.a.mass == this.b.mass) return this.a;
        return this.a.mass < this.b.mass ? this.a : this.b;
    }

    get smallest(): Planet {
        if (this.a.mass == this.b.mass) return this.b;
        return this.b.mass < this.a.mass ? this.b : this.a;
    }

    constructor(a: Planet, b: Planet) {
        this.a = a;
        this.b = b;
    }

    tick() {
        if (this.a.isDestroyed || this.b.isDestroyed) return;

        let a = this.largest;
        let b = this.smallest;
        let r = PlanetRelationship.apply1(a, b);

        if (r) {
            let r2 = PlanetRelationship.apply1(b, a);
            if(r2==false) console.log('error');
        } else {
            console.log(this.toString())
        }
    }



    static apply1(a: Planet, b: Planet): boolean {

        let diffXab = b.x - a.x;
        let diffYab = b.y - a.y;
        var distSquareAb = diffXab * diffXab + diffYab * diffYab;
        var dist = Math.sqrt(distSquareAb);
        dist = dist / 2;

        if (dist > a.width / 2 + b.width / 2) {
            var totalForce = (a.mass * b.mass) / distSquareAb;
            a.fX += totalForce * diffXab / dist;
            a.fY += totalForce * diffYab / dist;

        } else {
            //colided
            // todo  this needs to be expanded on
            a.fX += b.vX / b.mass;
            a.fY += b.vY / b.mass;

            // var tempX = (a.vX + b.vX) / 2;
            // var tempY = (a.vY + b.vY) / 2;
            // a.vX = tempX; b.vX = tempX;
            // a.vY = tempY; b.vY = tempY;

            a.mass += b.mass;
            a.updateShapeGraphics();
            b.destroy();
            return false;
        }
        return true;
    }

    toString() {
        return `PlanetRelationship: ${this.id}, A:${this.a.id}, B:${this.b.id}`;
    }

}

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

        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }

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

    updateShape() {
        this.shape.x = this.x;
        this.shape.y = this.y;
    }

    updateShapeGraphics() {
        let obj = this.shape;
        obj.graphics
        // .f(this.color.toCSS())
            .beginFill(this.color.toCSS())
            .drawCircle(0, 0, this.radius);//"#08F"
    }

    destroy() {
        debugger;
        console.log('destroy', this.id);
        this.isDestroyed = true;
        this.mass = 0;
        this.system.stage.removeChild(this.shape);
    }
}


var page = new Page();

$(document).ready(() => page.init());
