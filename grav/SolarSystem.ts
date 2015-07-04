class SolarSystem {

    offset = { x: 0, y: 0 };
    zoom: number = 1;

    objects: Planet[] = [];
    stage = new createjs.Stage("canvas");
    relationships: PlanetRelationship[] = [];

    createPlanet(x, y, mass, vx = 0, vy = 0) {
        let p = new Planet(this, x, y, mass, vx, vy);
        this.objects.forEach(p2=> {
            this.relationships.push(new PlanetRelationship(p2, p));
        });
        this.objects.push(p);
    }

    tick() {
        let allObjs = this.objects;
        let stage = this.stage;
        let ignore = [];

        //.filter(x=> x.isDestroyed == false || x.isActive == false)
        this.relationships.forEach(c => {
            c.tick();
        });

        allObjs.forEach(x=> x.tick());
        this.stage.update();
    }

    cleanup() {
        this.objects = this.objects.filter(x=> x.isDestroyed == false);
        this.relationships = this.relationships.filter(x=> x.isDestroyed == false);
    }

    setCenter(x: number, y: number) {
        console.log(`setCenter(${x}, ${y});`);
        x = x*-1;
        y= y*-1;
        this.offset = { x: x, y: y };
        let c = <HTMLCanvasElement> this.stage.canvas;
        let w = c.width;
        let h = c.height;
        console.info(`w:${w}, h:${h}`);
        let z = Math.pow(2, this.zoom - 1);
        let xr = ((w / 2) * z);
        let yr = ((h / 2) * z);
        this.offset = {
            x:  (x+ xr) ,
            y: (y + yr)
        };
        this.logOffset();
    }

    logOffset() {
        console.log(`offset: {x:${this.offset.x}, y:${this.offset.y}}`);
    }
    toString() {
        return `offset: {x:${this.offset.x}, y:${this.offset.y}}`;
    }
}
