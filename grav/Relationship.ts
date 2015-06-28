class PlanetRelationship {
    static totalIdx = 0;
    id = PlanetRelationship.totalIdx++;
    a: Planet;
    b: Planet;

    ignoreFor: number = 0;

    get isDestroyed() {
        return this.a.isDestroyed || this.b.isDestroyed || this.a.id == this.b.id;
    }

    get largest(): Planet {
        // console.log(` ${this.a.mass} > ${this.b.mass} = ${ this.a.mass > this.b.mass}`)
        let a = this.a;
        let b = this.b;
        if (a.mass == b.mass) return a;
        return a.mass > b.mass ? a : b;
    }

    get smallest(): Planet {
        let a = this.a;
        let b = this.b;
        if (a.mass == b.mass) return b;
        return b.mass > a.mass ? a : b;
    }

    get isActive(): boolean {
        return this.ignoreFor == 0;
    }

    constructor(a: Planet, b: Planet) {
        this.a = a;
        this.b = b;
    }

    tick() {
        if (this.a.isDestroyed || this.b.isDestroyed) return;
        if (this.ignoreFor !== 0) {
            this.ignoreFor--;
            return;
        }


        let a = this.largest;
        let b = this.smallest;
        let r = this.apply1(a, b);

        if (r) {
            let r2 = this.apply1(b, a);
            if (r2 == false) console.log('error');
        } else {
            // console.log(this.toString())
        }
    }



    apply1(a: Planet, b: Planet): boolean {

        let diffXab = b.x - a.x;
        let diffYab = b.y - a.y;
        var distSquareAb = diffXab * diffXab + diffYab * diffYab;
        var dist = Math.sqrt(distSquareAb);
        dist = dist / 2;

        if (dist >= (a.radius / 2) + (b.radius / 2)) {
            var totalForce = (a.mass * b.mass) / distSquareAb;
            a.fX += (totalForce * diffXab) / dist;
            a.fY += totalForce * diffYab / dist;
            if (totalForce < .001) {
                this.ignoreFor = random(45,75) ;
            }
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
            a.updateShapeGraphics();
            b.destroy();
            return false;
        }
        return true;
    }

    toString() {
        return `PlanetRelationship: ${this.id}, A:${this.a.id}, B:${this.b.id}`;
    }

}
