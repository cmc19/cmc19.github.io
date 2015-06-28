/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>

/// <reference path="./util"/>
/// <reference path="./planet"/>
/// <reference path="./Relationship"/>

const speedModifier = 4;//25


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
            if (e.nativeEvent.button == 2) {
                e.preventDefault();
                e.nativeEvent.preventDefault();
                e.nativeEvent.cancelBubble = true;
            }
            if (e.nativeEvent.button == 1) {
                this.system.offset.x += (e.stageX - this.mouse.startX)* this.system.zoom;
                this.system.offset.y += (e.stageY - this.mouse.startY) * this.system.zoom;
            }
            else {
                this.createPlanet((this.mouse.startX - this.system.offset.x) - 5, (this.mouse.startY - this.system.offset.y) - 5, random(2, 5), e.stageX - this.mouse.startX, e.stageY - this.mouse.startY);
            }
            //
        });
this.canvas.addEventListener('mousewheel',x=>{
    console.log('mousewheel',x);
    if( x.wheelDelta <= -1){
        this.system.zoom++;
    }else if (x.wheelDelta >= 1){
        if(this.system.zoom == 1) return;
        this.system.zoom--;
    }
})

        createjs.Ticker.on("tick", () => {
            this.tickCount++;

            this.system.tick();

            if (this.tickCount % 60==0) {
                this.system.cleanup();
                this.updateFps();
                this.updateMass();
                this.updateBodyCount();
            }

        });
        createjs.Ticker.setFPS(60);
        this.fillWindow();

        this.fillRandom(1000, 1200);

        for (let i = 0; i < 50; i++) {
            this.createPlanet(this.canvas.width / 2, this.canvas.height / 2, 1);
        }

    }



    bodyCount: HTMLSpanElement = document.getElementById('bodyCount');
    mass: HTMLSpanElement = document.getElementById('mass');
    fpsCounter: HTMLSpanElement = document.getElementById('fps');
    relCount: HTMLSpanElement = document.getElementById('relCount');

    createPlanet(x, y, mass, vx = 0, vy = 0) {
        this.system.createPlanet(x, y, mass, vx, vy);
    }

    fillRandom(min, max) {
        for (let i = 0; i < random(min, max); i++) {
            this.createPlanet(random(0, window.innerWidth * 2), random(0, window.innerHeight * 2), 1, 0, 0);
        }
    }

    updateFps() {
        this.fpsCounter.innerText = Math.round(createjs.Ticker.getMeasuredFPS()).toString();
    }

    updateMass() {
        let mass = 0
        this.system.objects.forEach(x=> mass += x.mass);
        this.mass.innerText = mass.toString();
    }
    updateBodyCount() {
        this.bodyCount.innerText = this.system.objects.length.toString();
        this.relCount.innerText = this.system.relationships.filter(x=>x.isActive).length.toString() + '/' + this.system.relationships.length.toString()  ;
    }
}

function sortBy<T, Y>(array: T[], fn: (t: T) => Y) {
    return array.slice(0).sort(function(a, b) {
        return (fn(a) > fn(b)) ? 1 : (fn(a) < fn(b)) ? -1 : 0;
    });
}

class SolarSystem {

    offset = { x: 0, y: 0 };
    zoom:number = 1;

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

//.filter(x=> x.isDestroyed == false || x.isActive == false)
        this.relationships.forEach(c => {
            c.tick();
        });

        allObjs.forEach(x=> x.tick());
        this.stage.update();
    }

    cleanup() {
        this.objects = this.objects.filter(x=> x.isDestroyed == false);
        this.relationships = this.relationships.filter(x=> x.isDestroyed == false);
    }

}






var page = new Page();

$(document).ready(() => page.init());
