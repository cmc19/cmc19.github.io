/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>
var speedModifier = 1;
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
function findAllPossibleCombos(a, min, max) {
    if (max === void 0) { max = null; }
    if (max === null)
        max = a.length;
    max += 1;
    var fn = function (n, src, got, all) {
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
    };
    var all = [];
    for (var i = min; i < max; i++) {
        fn(i, a, [], all);
    }
    return all;
}
var Page = (function () {
    function Page() {
        this.stage = new createjs.Stage("canvas");
        this.mouse = { startX: 0, startY: 0 };
        this.planets = [];
    }
    Object.defineProperty(Page.prototype, "canvas", {
        get: function () {
            return this.stage.canvas;
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype.fillWindow = function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };
    Page.prototype.init = function () {
        var _this = this;
        var stage = this.stage;
        $(window).on('resize', function () { return _this.fillWindow(); });
        stage.on("stagemousedown", function (e) {
            console.log('stagemousedown', e);
            _this.mouse.startX = e.stageX;
            _this.mouse.startY = e.stageY;
        });
        stage.on("stagemouseup", function (e) {
            _this.createPlanet(_this.mouse.startX - 5, _this.mouse.startY - 5, random(2, 5), e.stageX - _this.mouse.startX, e.stageY - _this.mouse.startY);
        });
        createjs.Ticker.on("tick", function () { return _this.tick(); });
        createjs.Ticker.setFPS(60);
        this.fillRandom();
        this.fillWindow();
    };
    Page.prototype.tick = function () {
        var allObjs = this.planets;
        var stage = this.stage;
        var ignore = [];
        var combos = findAllPossibleCombos(allObjs, 2, 2);
        combos.forEach(function (comb) {
            comb = sortBy(comb, function (x) { return x.mass; }).reverse();
            function apply(a, b) {
                var diffXab = b.shape.x - a.shape.x;
                var diffYab = b.shape.y - a.shape.y;
                var distSquareAb = diffXab * diffXab + diffYab * diffYab;
                var dist = Math.sqrt(distSquareAb);
                dist = dist / 2;
                if (dist > a.w / 2 + b.w / 2) {
                    var totalForce = (a.mass * b.mass) / distSquareAb;
                    a.fX += totalForce * diffXab / dist;
                    a.fY += totalForce * diffYab / dist;
                }
                else {
                    a.fX += b.vX / b.mass;
                    a.fY += b.vY / b.mass;
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
        allObjs.forEach(function (x) { return x.tick(); });
        this.planets = this.planets.filter(function (x) { return x['ignore'] === undefined; });
        this.stage.update();
    };
    Page.prototype.createPlanet = function (x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        var p = new Planet(this.stage, x, y, mass, vx, vy);
        this.planets.push(p);
        this.stage.addChild(p.shape);
    };
    Page.prototype.fillRandom = function () {
        for (var i = 0; i < random(100, 300); i++) {
            this.createPlanet(random(0, window.innerWidth), random(0, window.innerHeight), 1, 0, 0);
        }
    };
    return Page;
})();
function sortBy(array, fn) {
    return array.slice(0).sort(function (a, b) {
        return (fn(a) > fn(b)) ? 1 : (fn(a) < fn(b)) ? -1 : 0;
    });
}
var Planet = (function () {
    function Planet(stage, x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.shape = new createjs.Shape();
        this.a = 0;
        this.fX = 0;
        this.fY = 0;
        this.color = new Color(randColor());
        var p = this;
        var obj = this.shape;
        obj.regX = obj.regY = -mass;
        obj.x = x;
        obj.y = y;
        p.mass = mass;
        p.vX = vx;
        p.vY = vy;
        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }
        this.update();
    }
    Object.defineProperty(Planet.prototype, "w", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Planet.prototype, "h", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Planet.prototype, "radius", {
        get: function () {
            return circlueRad(this.mass * 4);
        },
        enumerable: true,
        configurable: true
    });
    Planet.prototype.update = function () {
        var obj = this.shape;
        obj.graphics.f(this.color.toCSS()).dc(0, 0, this.radius);
    };
    Planet.prototype.tick = function () {
        var t = this;
        t.vX += t.fX / t.mass;
        t.vY += t.fY / t.mass;
        t.shape.x += t.vX / speedModifier;
        t.shape.y += t.vY / speedModifier;
        t.fX = t.fY = 0;
    };
    return Planet;
})();
var page = new Page();
$(document).ready(function () { return page.init(); });
