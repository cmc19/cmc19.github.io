/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>

/// <reference path="./util"/>
/// <reference path="./planet"/>

const speedModifier = 1;//25


class Page {
    system = new SolarSystem();
    tickCount = 0;

    mouse = { startX: 0, startY: 0 };

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
            this.mouse.startX = e.stageX;
            this.mouse.startY = e.stageY;
        });
        stage.on("stagemouseup", (e: createjs.MouseEvent) => {
            this.createPlanet(this.mouse.startX - 5, this.mouse.startY - 5, random(2, 5), e.stageX - this.mouse.startX, e.stageY - this.mouse.startY);
        });

        createjs.Ticker.on("tick", () => {
            this.tickCount++;

            this.system.tick();

            if (this.tickCount % 60) {
                this.system.cleanup();
                this.updateFps();
            }

        });
        createjs.Ticker.setFPS(60);

        this.fillRandom(50, 100);
        this.fillWindow();

        this.createPlanet(this.canvas.width /2, this.canvas.height /2, 50);

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

    updateFps(){
        this.fpsCounter.innerText = Math.round( createjs.Ticker.getMeasuredFPS()).toString();
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

    tick() {
        let allObjs = this.objects;
        let stage = this.stage;
        let ignore = [];


        this.relationships.filter(x=> x.isDestroyed == false).forEach(c => {
            c.tick();
        });

        allObjs.forEach(x=> x.tick());

        this.objects = this.objects.filter(x=> x['ignore'] === undefined);
        this.stage.update();



    }

    cleanup() {
        this.objects = this.objects.filter(x=> x.isDestroyed == false);
        this.relationships = this.relationships.filter(x=> x.isDestroyed == false);
    }

}


class PlanetRelationship {
    static totalIdx = 0;
    id = PlanetRelationship.totalIdx++;
    a: Planet;
    b: Planet;

    get isDestroyed() {
        return this.a.isDestroyed || this.b.isDestroyed || this.a.id == this.b.id;
    }

    get largest(): Planet {
        // console.log(` ${this.a.mass} > ${this.b.mass} = ${ this.a.mass > this.b.mass}`)
        let a = this.a;
        let b = this.b;
        if (a.mass == b.mass) return a;
        return a.mass > b.mass ? a : b;
    }

    get smallest(): Planet {
        let a = this.a;
        let b = this.b;
        if (a.mass == b.mass) return b;
        return b.mass > a.mass ? a : b;
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
            if (r2 == false) console.log('error');
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

        if (dist > a.radius + b.radius) {
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



var page = new Page();

$(document).ready(() => page.init());
