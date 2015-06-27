/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>
/// <reference path="./util"/>
/// <reference path="./planet"/>
var speedModifier = 1;
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
                _this.updateFps();
            }
        });
        createjs.Ticker.setFPS(60);
        this.fillRandom(50, 100);
        this.fillWindow();
        this.createPlanet(this.canvas.width / 2, this.canvas.height / 2, 50);
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
    Page.prototype.updateFps = function () {
        this.fpsCounter.innerText = Math.round(createjs.Ticker.getMeasuredFPS()).toString();
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
        if (dist > a.radius + b.radius) {
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
var page = new Page();
$(document).ready(function () { return page.init(); });
//# sourceMappingURL=main.js.map