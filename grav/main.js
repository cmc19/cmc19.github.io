/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>
var speedModifier = 5;
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
        this.system = new SolarSystem();
        this.tickCount = 0;
        this.mouse = { startX: 0, startY: 0 };
        this.bodyCount = document.getElementById('bodyCount');
        this.mass = document.getElementById('mass');
        this.fpsCounter = document.getElementById('fps');
    }
    Object.defineProperty(Page.prototype, "canvas", {
        get: function () {
            return this.system.stage.canvas;
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
        var stage = this.system.stage;
        $(window).on('resize', function () { return _this.fillWindow(); });
        stage.on("stagemousedown", function (e) {
            _this.mouse.startX = e.stageX;
            _this.mouse.startY = e.stageY;
        });
        stage.on("stagemouseup", function (e) {
            _this.createPlanet(_this.mouse.startX - 5, _this.mouse.startY - 5, random(2, 5), e.stageX - _this.mouse.startX, e.stageY - _this.mouse.startY);
        });
        createjs.Ticker.on("tick", function () {
            _this.tickCount++;
            _this.system.tick();
            if (_this.tickCount % 60) {
                _this.system.cleanup();
            }
        });
        createjs.Ticker.setFPS(60);
        this.fillRandom(10, 15);
        this.fillWindow();
    };
    Page.prototype.createPlanet = function (x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.system.createPlanet(x, y, mass, vx, vy);
    };
    Page.prototype.fillRandom = function (min, max) {
        for (var i = 0; i < random(min, max); i++) {
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
var SolarSystem = (function () {
    function SolarSystem() {
        this.objects = [];
        this.stage = new createjs.Stage("canvas");
        this.relationships = [];
    }
    SolarSystem.prototype.createPlanet = function (x, y, mass, vx, vy) {
        var _this = this;
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        var p = new Planet(this, x, y, mass, vx, vy);
        this.objects.forEach(function (p2) {
            _this.relationships.push(new PlanetRelationship(p2, p));
        });
        this.objects.push(p);
    };
    SolarSystem.prototype.tick = function () {
        var allObjs = this.objects;
        var stage = this.stage;
        var ignore = [];
        this.relationships.filter(function (x) { return x.isDestroyed == false; }).forEach(function (c) {
            c.tick();
        });
        allObjs.forEach(function (x) { return x.tick(); });
        this.objects = this.objects.filter(function (x) { return x['ignore'] === undefined; });
        this.stage.update();
    };
    SolarSystem.prototype.cleanup = function () {
        this.objects = this.objects.filter(function (x) { return x.isDestroyed == false; });
        this.relationships = this.relationships.filter(function (x) { return x.isDestroyed == false; });
    };
    return SolarSystem;
})();
var PlanetRelationship = (function () {
    function PlanetRelationship(a, b) {
        this.id = PlanetRelationship.totalIdx++;
        this.a = a;
        this.b = b;
    }
    Object.defineProperty(PlanetRelationship.prototype, "isDestroyed", {
        get: function () {
            return this.a.isDestroyed || this.b.isDestroyed || this.a.id == this.b.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlanetRelationship.prototype, "largest", {
        get: function () {
            var a = this.a;
            var b = this.b;
            if (a.mass == b.mass)
                return a;
            return a.mass > b.mass ? a : b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlanetRelationship.prototype, "smallest", {
        get: function () {
            var a = this.a;
            var b = this.b;
            if (a.mass == b.mass)
                return b;
            return b.mass > a.mass ? a : b;
        },
        enumerable: true,
        configurable: true
    });
    PlanetRelationship.prototype.tick = function () {
        if (this.a.isDestroyed || this.b.isDestroyed)
            return;
        var a = this.largest;
        var b = this.smallest;
        var r = PlanetRelationship.apply1(a, b);
        if (r) {
            var r2 = PlanetRelationship.apply1(b, a);
            if (r2 == false)
                console.log('error');
        }
        else {
            console.log(this.toString());
        }
    };
    PlanetRelationship.apply1 = function (a, b) {
        var diffXab = b.x - a.x;
        var diffYab = b.y - a.y;
        var distSquareAb = diffXab * diffXab + diffYab * diffYab;
        var dist = Math.sqrt(distSquareAb);
        dist = dist / 2;
        if (dist > a.width / 2 + b.width / 2) {
            var totalForce = (a.mass * b.mass) / distSquareAb;
            a.fX += totalForce * diffXab / dist;
            a.fY += totalForce * diffYab / dist;
        }
        else {
            a.fX += b.vX / b.mass;
            a.fY += b.vY / b.mass;
            a.mass += b.mass;
            a.updateShapeGraphics();
            b.destroy();
            return false;
        }
        return true;
    };
    PlanetRelationship.prototype.toString = function () {
        return "PlanetRelationship: " + this.id + ", A:" + this.a.id + ", B:" + this.b.id;
    };
    PlanetRelationship.totalIdx = 0;
    return PlanetRelationship;
})();
var Planet = (function () {
    function Planet(system, x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.system = system;
        this.id = Planet.totalIdx++;
        this.shape = new createjs.Shape();
        this.fX = 0;
        this.fY = 0;
        this.isDestroyed = false;
        this.color = new Color(randColor());
        system.stage.addChild(this.shape);
        var p = this;
        var obj = this.shape;
        obj.regX = obj.regY = -mass;
        obj.x = x;
        obj.y = y;
        p.mass = mass;
        this.x = x;
        this.y = y;
        p.vX = vx;
        p.vY = vy;
        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }
        this.updateShapeGraphics();
    }
    Object.defineProperty(Planet.prototype, "width", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Planet.prototype, "height", {
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
    Planet.prototype.tick = function () {
        var t = this;
        t.vX += t.fX / t.mass;
        t.vY += t.fY / t.mass;
        t.x += t.vX / speedModifier;
        t.y += t.vY / speedModifier;
        this.updateShape();
        t.fX = t.fY = 0;
    };
    Planet.prototype.updateShape = function () {
        this.shape.x = this.x;
        this.shape.y = this.y;
    };
    Planet.prototype.updateShapeGraphics = function () {
        var obj = this.shape;
        obj.graphics
            .beginFill(this.color.toCSS())
            .drawCircle(0, 0, this.radius);
    };
    Planet.prototype.destroy = function () {
        console.log('destroy', this.id);
        this.isDestroyed = true;
        this.mass = 0;
        this.system.stage.removeChild(this.shape);
    };
    Planet.totalIdx = 0;
    return Planet;
})();
var page = new Page();
$(document).ready(function () { return page.init(); });
//# sourceMappingURL=main.js.map