/// <reference path="./util"/>
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
        this.shape.x = this.x + this.system.offset.x;
        this.shape.y = this.y + this.system.offset.y;
    };
    Planet.prototype.updateShapeGraphics = function () {
        var obj = this.shape;
        obj.graphics.clear();
        var g = obj.graphics
            .beginFill(this.color.toCSS())
            .drawCircle(0, 0, this.radius);
    };
    Planet.prototype.destroy = function () {
        this.isDestroyed = true;
        this.mass = 0;
        this.system.stage.removeChild(this.shape);
    };
    Planet.totalIdx = 0;
    return Planet;
})();
//# sourceMappingURL=planet.js.map