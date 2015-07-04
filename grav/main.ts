/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>

/// <reference path="./util"/>
/// <reference path="./planet"/>
/// <reference path="./Relationship"/>
/// <reference path="./KeyManager"/>
/// <reference path="./SolarSystem"/>

interface IXY {
    x: number;
    y: number;
}

class Page {
    keyManger = new CMC.KeyManager();
    system = new SolarSystem();
    tickCount = 0;

    mouse = { startX: 0, startY: 0 };

    getMouseLocation(e: createjs.MouseEvent): IXY {
        let s = this.system;
        let o = s.offset;
        let z = Math.pow(2, s.zoom);

        return {
            x: (e.localX * z) + o.x,
            y: (e.localY * z) + o.y
        }
    }

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
                this.system.offset.x += (e.stageX - this.mouse.startX) * this.system.zoom;
                this.system.offset.y += (e.stageY - this.mouse.startY) * this.system.zoom;
            }
            else {
                this.createPlanet((this.mouse.startX - this.system.offset.x) - 5, (this.mouse.startY - this.system.offset.y) - 5, random(2, 5), e.stageX - this.mouse.startX, e.stageY - this.mouse.startY);
            }
            //
        });
        this.canvas.addEventListener('mousewheel', x=> {
            console.log('mousewheel', x);
            if (x.wheelDelta <= -1) {
                this.system.zoom++;
            } else if (x.wheelDelta >= 1) {
                if (this.system.zoom == 1) return;
                this.system.zoom--;
            }
        })

        createjs.Ticker.on("tick", () => {
            this.tickCount++;

            this.system.tick();

            if (this.tickCount % 60 == 0) {
                this.system.cleanup();
                this.updateFps();
                this.updateMass();
                this.updateBodyCount();
            }

        });
        createjs.Ticker.setFPS(60);
        this.fillWindow();

        this.fillRandom(1000, 2400);

        for (let i = 0; i < 800; i++) {
            this.createPlanet(this.canvas.width, this.canvas.height, 1);
        }

        this.keyManger.bind('1', (e) => { createjs.Ticker.setFPS(15); });
        this.keyManger.bind('2', (e) => { createjs.Ticker.setFPS(30); });
        this.keyManger.bind('3', (e) => { createjs.Ticker.setFPS(60); });
        this.keyManger.bind('4', (e) => { createjs.Ticker.setFPS(90); });
    }



    bodyCount: HTMLSpanElement = document.getElementById('bodyCount');
    mass: HTMLSpanElement = document.getElementById('mass');
    fpsCounter: HTMLSpanElement = document.getElementById('fps');
    relCount: HTMLSpanElement = document.getElementById('relCount');
    zoomDisplay: HTMLSpanElement = document.getElementById('zoom');
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
        this.zoomDisplay.innerText = this.system.zoom.toString();
    }

    updateMass() {
        let mass = 0
        this.system.objects.forEach(x=> mass += x.mass);
        this.mass.innerText = mass.toString();
    }
    updateBodyCount() {
        this.bodyCount.innerText = this.system.objects.length.toString();
        this.relCount.innerText = this.system.relationships.filter(x=> x.isActive).length.toString() + '/' + this.system.relationships.length.toString();
    }
}

function sortBy<T, Y>(array: T[], fn: (t: T) => Y) {
    return array.slice(0).sort(function(a, b) {
        return (fn(a) > fn(b)) ? 1 : (fn(a) < fn(b)) ? -1 : 0;
    });
}








var page = new Page();

$(document).ready(() => page.init());
