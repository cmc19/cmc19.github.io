var PlanetRelationship = (function () {
    function PlanetRelationship(a, b) {
        this.id = PlanetRelationship.totalIdx++;
        this.ignoreFor = 0;
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
    Object.defineProperty(PlanetRelationship.prototype, "isActive", {
        get: function () {
            return this.ignoreFor == 0;
        },
        enumerable: true,
        configurable: true
    });
    PlanetRelationship.prototype.tick = function () {
        if (this.a.isDestroyed || this.b.isDestroyed)
            return;
        if (this.ignoreFor !== 0) {
            this.ignoreFor--;
            return;
        }
        var a = this.largest;
        var b = this.smallest;
        var r = this.apply1(a, b);
        if (r) {
            var r2 = this.apply1(b, a);
            if (r2 == false)
                console.log('error');
        }
        else {
        }
    };
    PlanetRelationship.prototype.apply1 = function (a, b) {
        var diffXab = b.x - a.x;
        var diffYab = b.y - a.y;
        var distSquareAb = diffXab * diffXab + diffYab * diffYab;
        var dist = Math.sqrt(distSquareAb);
        dist = dist / 2;
        if (dist >= (a.radius / 2) + (b.radius / 2)) {
            var totalForce = (a.mass * b.mass) / distSquareAb;
            a.fX += (totalForce * diffXab) / dist;
            a.fY += totalForce * diffYab / dist;
            if (totalForce < .001) {
                this.ignoreFor = random(45, 75);
            }
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
/// <reference path="./util"/>
var speedModifier = 4;
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
        this._lastZoom = 0;
        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }
        this.shape.graphics.drawCircle(0, 0, 0).setStrokeStyle(1).beginStroke('white').beginFill(this.color.toCSS());
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
        if (this._lastZoom != this.system.zoom) {
            this._lastZoom = this.system.zoom;
            this.updateShapeGraphics();
        }
        this.shape.x = (this.x + this.system.offset.x) / Math.pow(2, this.system.zoom - 1);
        this.shape.y = (this.y + this.system.offset.y) / Math.pow(2, this.system.zoom - 1);
    };
    Planet.prototype.updateShapeGraphics = function () {
        var obj = this.shape;
        obj.graphics.clear();
        var g = obj.graphics
            .beginFill(this.color.toCSS())
            .drawCircle(0, 0, this.radius / Math.pow(2, this.system.zoom - 1));
    };
    Planet.prototype.destroy = function () {
        this.isDestroyed = true;
        this.mass = 0;
        this.system.stage.removeChild(this.shape);
    };
    Planet.totalIdx = 0;
    return Planet;
})();
/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>
/// <reference path="./util"/>
/// <reference path="./planet"/>
/// <reference path="./Relationship"/>
var Page = (function () {
    function Page() {
        this.system = new SolarSystem();
        this.tickCount = 0;
        this.mouse = { startX: 0, startY: 0 };
        this.bodyCount = document.getElementById('bodyCount');
        this.mass = document.getElementById('mass');
        this.fpsCounter = document.getElementById('fps');
        this.relCount = document.getElementById('relCount');
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
            if (e.nativeEvent.button == 2) {
                e.preventDefault();
                e.nativeEvent.preventDefault();
                e.nativeEvent.cancelBubble = true;
            }
            if (e.nativeEvent.button == 1) {
                _this.system.offset.x += (e.stageX - _this.mouse.startX) * _this.system.zoom;
                _this.system.offset.y += (e.stageY - _this.mouse.startY) * _this.system.zoom;
            }
            else {
                _this.createPlanet((_this.mouse.startX - _this.system.offset.x) - 5, (_this.mouse.startY - _this.system.offset.y) - 5, random(2, 5), e.stageX - _this.mouse.startX, e.stageY - _this.mouse.startY);
            }
        });
        this.canvas.addEventListener('mousewheel', function (x) {
            console.log('mousewheel', x);
            if (x.wheelDelta <= -1) {
                _this.system.zoom++;
            }
            else if (x.wheelDelta >= 1) {
                if (_this.system.zoom == 1)
                    return;
                _this.system.zoom--;
            }
        });
        createjs.Ticker.on("tick", function () {
            _this.tickCount++;
            _this.system.tick();
            if (_this.tickCount % 60 == 0) {
                _this.system.cleanup();
                _this.updateFps();
                _this.updateMass();
                _this.updateBodyCount();
            }
        });
        createjs.Ticker.setFPS(60);
        this.fillWindow();
        this.fillRandom(2000, 2400);
        for (var i = 0; i < 800; i++) {
            this.createPlanet(this.canvas.width, this.canvas.height, 1);
        }
    };
    Page.prototype.createPlanet = function (x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.system.createPlanet(x, y, mass, vx, vy);
    };
    Page.prototype.fillRandom = function (min, max) {
        for (var i = 0; i < random(min, max); i++) {
            this.createPlanet(random(0, window.innerWidth * 2), random(0, window.innerHeight * 2), 1, 0, 0);
        }
    };
    Page.prototype.updateFps = function () {
        this.fpsCounter.innerText = Math.round(createjs.Ticker.getMeasuredFPS()).toString();
    };
    Page.prototype.updateMass = function () {
        var mass = 0;
        this.system.objects.forEach(function (x) { return mass += x.mass; });
        this.mass.innerText = mass.toString();
    };
    Page.prototype.updateBodyCount = function () {
        this.bodyCount.innerText = this.system.objects.length.toString();
        this.relCount.innerText = this.system.relationships.filter(function (x) { return x.isActive; }).length.toString() + '/' + this.system.relationships.length.toString();
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
        this.offset = { x: 0, y: 0 };
        this.zoom = 1;
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
        this.relationships.forEach(function (c) {
            c.tick();
        });
        allObjs.forEach(function (x) { return x.tick(); });
        this.stage.update();
    };
    SolarSystem.prototype.cleanup = function () {
        this.objects = this.objects.filter(function (x) { return x.isDestroyed == false; });
        this.relationships = this.relationships.filter(function (x) { return x.isDestroyed == false; });
    };
    return SolarSystem;
})();
var page = new Page();
$(document).ready(function () { return page.init(); });
//# sourceMappingURL=out.js.map