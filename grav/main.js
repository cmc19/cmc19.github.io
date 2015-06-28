/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>
/// <reference path="./util"/>
/// <reference path="./planet"/>
/// <reference path="./Relationship"/>
var speedModifier = 4;
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
            console.log(e.nativeEvent.button);
            if (e.nativeEvent.button == 2) {
                e.preventDefault();
                e.nativeEvent.preventDefault();
                e.nativeEvent.cancelBubble = true;
            }
            if (e.nativeEvent.button == 1) {
                console.log(e.nativeEvent);
                _this.system.offset.x += e.stageX - _this.mouse.startX - 5;
                _this.system.offset.y += e.stageY - _this.mouse.startY;
            }
            else {
                _this.createPlanet((_this.mouse.startX - _this.system.offset.x) - 5, (_this.mouse.startY - _this.system.offset.y) - 5, random(2, 5), e.stageX - _this.mouse.startX, e.stageY - _this.mouse.startY);
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
        this.fillRandom(1000, 1200);
        for (var i = 0; i < 50; i++) {
            this.createPlanet(this.canvas.width / 2, this.canvas.height / 2, 1);
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
//# sourceMappingURL=main.js.map