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
        }
    };
    PlanetRelationship.apply1 = function (a, b) {
        var diffXab = b.x - a.x;
        var diffYab = b.y - a.y;
        var distSquareAb = diffXab * diffXab + diffYab * diffYab;
        var dist = Math.sqrt(distSquareAb);
        dist = dist / 2;
        if (dist >= (a.radius / 2) + (b.radius / 2)) {
            var totalForce = (a.mass * b.mass) / distSquareAb;
            a.fX += (totalForce * diffXab) / dist;
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
//# sourceMappingURL=Relationship.js.map