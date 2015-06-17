interface IGameSystem {
    key: string;
    name: string;
    icon?: string;
}


class ElementList {
    private array: HTMLElement[];
    constructor(nl: NodeList) {
        this.array = Array.prototype.slice.call(nl);
    }

    forEach(fn: (x: HTMLElement) => void): ElementList {
        this.array.forEach(fn);
        return this;
    }

    addClass(klass: string): ElementList {
        let classes = klass.split(' ').filter(x=> x !== '');

        classes.forEach(c=> {
            this.forEach(x=> x.classList.add(c));

        });

        return this;
    }
}



module page {


    export var gameSystems: IGameSystem[] = [
        { key: 'ps3', name: 'PlayStation 3' },
        { key: 'pc', name: 'PC' },
        { key: 'n64', name: 'Nintendo 64' },
        { key: 'gc', name: 'GameCube' },
        { key: 'gba', name: 'Game Boy Advanced' },
        { key: 'snes', name: 'Super Nintendo Entertainment System' },
        { key: 'wii', name: 'Wii' },
        { key: 'ps4', name: 'PlayStation 4' }
    ];

    gameSystems.forEach(x=> x.icon = getIconUrl(x));


    function getIconUrl(g: IGameSystem) {
        return `./svg/${g.key}.svg`;
    }


    var testDiv = document.getElementById('test');

    export function init() {
        gameSystems.forEach(gs=> {
            let i = document.createElement('img');
            i.title = gs.icon;
            i.src = gs.icon;
            i.height = 32;
            i.width = 32;
            testDiv.appendChild(i);
        });



        var dgs = new ElementList(document.querySelectorAll('[data-gamesystem]'));

        dgs.forEach(x=> {
            let gs = x.dataset['gamesystem'];

        });

        console.log(dgs);
    }
}


page.init();


// var gameSystems = {
//     'ps3': { name: 'PS3' },
//     'pc': { icon: 'pc', name: 'PC' },
//     'n64': { icon: 'n64', name: 'N64' },
//     'gcn': { icon: 'gcn', name: 'GCN' },
//     'gba': { icon: 'gba', name: 'GBA' },
//     'snes': { name: 'SNES' },
//     'wii': { name: 'WII' },
//     'ps4': { name: 'PS4' }
// };
