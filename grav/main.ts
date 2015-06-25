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
    stage = new createjs.Stage("canvas");
    mouse = { startX: 0, startY: 0 };
    // planets: createjs.Shape[] = [];
    planets: Planet[] = [];
    get canvas(): HTMLCanvasElement {
        return <HTMLCanvasElement> this.stage.canvas;
    }

    fillWindow() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        let stage = this.stage;
        $(window).on('resize', () => this.fillWindow());

        stage.on("stagemousedown", (e: createjs.MouseEvent) => {
            console.log('stagemousedown', e);
            this.mouse.startX = e.stageX;
            this.mouse.startY = e.stageY;
        });
        stage.on("stagemouseup", (e: createjs.MouseEvent) => {
            this.createPlanet(this.mouse.startX - 5, this.mouse.startY - 5, random(2, 5), e.stageX - this.mouse.startX, e.stageY - this.mouse.startY);
        });

        createjs.Ticker.on("tick", () => this.tick());
        createjs.Ticker.setFPS(60);

        this.fillRandom();
        this.fillWindow();
    }

    tickCount = 0;
    tick() {
        this.tickCount++;
        let allObjs = this.planets;
        let stage = this.stage;
        let ignore = [];
        // allObjs.forEach(function(obj1) {
        //     return;
        //     if (ignore.indexOf(obj1) !== -1) return;
        //     allObjs.forEach(function(obj2) {
        //         let diffX = obj2.shape.x - obj1.shape.x;
        //         let diffY = obj2.shape.y - obj1.shape.y;
        //         var distSquare = diffX * diffX + diffY * diffY;
        //         var dist = Math.sqrt(distSquare);
        //         if (obj1 != obj2) {
        //             if (dist > obj1.w / 2 + obj2.w / 2) {
        //                 //If you add mass to the objects change to obj1.mass * obj2.mass instead of 50
        //                 // var totalForce = 50 / distSquare;
        //                 var totalForce = (obj2.mass * obj1.mass) / distSquare;
        //                 obj1.vX += totalForce * diffX / dist;
        //                 obj1.vY += totalForce * diffY / dist;
        //             } else {
        //                 //Collision has occurred
        //                 //If you add mass to the objects change to
        //                 //tempX = (obj1.mass*obj1.vx + obj2.mass*obj2.vx)/(obj1.mass+obj2.mass);
        //                 //tempY = (obj1.mass*obj1.vy + obj2.mass*obj2.vy)/(obj1.mass+obj2.mass);
        //                 var tempX = (obj1.vX + obj2.vX) / 2;
        //                 var tempY = (obj1.vY + obj2.vY) / 2;
        //                 obj1.vX = tempX; obj2.vX = tempX;
        //                 obj1.vY = tempY; obj2.vY = tempY;
        //
        //                 obj1.mass += obj2.mass;
        //                 obj1.update();
        //
        //                 stage.removeChild(obj2.shape);
        //                 ignore.push(obj2);
        //                 obj2['ignore'] = true;
        //             }
        //         }
        //     });
        // });


        let combos = findAllPossibleCombos(allObjs, 2, 2);

        combos.forEach(comb=> {
            comb = sortBy(comb, x=> x.mass).reverse();
            function apply(a: Planet, b: Planet) {

                let diffXab = b.shape.x - a.shape.x;
                let diffYab = b.shape.y - a.shape.y;
                var distSquareAb = diffXab * diffXab + diffYab * diffYab;
                var dist = Math.sqrt(distSquareAb);
                dist = dist / 2;

                if (dist > a.w / 2 + b.w / 2) {
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
                    a.update();

                    stage.removeChild(b.shape);
                    ignore.push(b);
                    b['ignore'] = true;
                }
            }

            apply(comb[0], comb[1]);
            if (comb[1]['ignore'] == undefined) {
                apply(comb[1], comb[0]);
            }

        });

        allObjs.forEach(x=> x.tick());
        // allObjs.forEach(function(obj1) {
        //
        //      obj1.shape.x += obj1.vX / 25;
        //      obj1.shape.y += obj1.vY / 25;
        // });

        this.planets = this.planets.filter(x=> x['ignore'] === undefined);
        this.stage.update();

        if (this.tickCount % 60 == 0) {
            this.bodyCount.innerText = this.planets.length.toString();
            let mass = 0;
            this.planets.forEach(x=> mass += x.mass);
            this.mass.innerText = mass.toString();
        }
    }

    bodyCount: HTMLSpanElement = document.getElementById('bodyCount');
    mass: HTMLSpanElement = document.getElementById('mass');

    createPlanet(x, y, mass, vx = 0, vy = 0) {
        let p = new Planet(this.stage, x, y, mass, vx, vy);

        this.planets.push(p);
        this.stage.addChild(p.shape);


        // var obj = new createjs.Shape();
        // obj.graphics.f(randColor()).dc(0, 0, r);//"#08F"
        // obj.regX = obj.regY = -r;
        // obj.x = x;
        // obj.y = y;
        // obj.m = r / 100;
        // obj.vx = vx;
        // obj.vy = vy;
        // obj.fx = obj.fy = obj.a = 0;
        // obj.w = obj.h = r * 2;
        // this.planets.push(obj);
        // this.stage.addChild(obj);
    }

    fillRandom() {
        for (let i = 0; i < random(100, 300); i++) {
            this.createPlanet(random(0, window.innerWidth), random(0, window.innerHeight), 1, 0, 0);
        }

    }
}

function sortBy<T, Y>(array: T[], fn: (t: T) => Y) {
    return array.slice(0).sort(function(a, b) {
        return (fn(a) > fn(b)) ? 1 : (fn(a) < fn(b)) ? -1 : 0;
    });
}

class Planet {
    shape: createjs.Shape = new createjs.Shape();
    mass: number;
    vX: number;
    vY: number;
    a: number = 0;
    fX: number = 0;
    fY: number = 0;

    color: Color = new Color(randColor());

    get w(): number {
        return this.radius * 2;
    }

    get h(): number {
        return this.radius * 2;
    }

    get radius() {
        return circlueRad(this.mass * 4);
    }

    constructor(stage: createjs.Stage, x, y, mass, vx = 0, vy = 0) {
        let p = this;
        let obj = this.shape;
        obj.regX = obj.regY = -mass;
        obj.x = x;
        obj.y = y;
        p.mass = mass;


        p.vX = vx;
        p.vY = vy;
        //p.w = p.h = mass * 2;

        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }

        this.update();
    }

    update() {
        let obj = this.shape;
        obj.graphics.f(this.color.toCSS()).dc(0, 0, this.radius);//"#08F"
    }

    tick() {
        let t = this;

        t.vX += t.fX / t.mass;
        t.vY += t.fY / t.mass;


        t.shape.x += t.vX / speedModifier;
        t.shape.y += t.vY / speedModifier;

        t.fX = t.fY = 0;
    }
}


var page = new Page();

$(document).ready(() => page.init());
