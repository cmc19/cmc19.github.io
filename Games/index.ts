



module page {
    interface IGameSystem {
        key: string;
        name: string;
        icon?: string;
    }

    export var gameSystems: IGameSystem[] = [
        { key: 'PS3', name: 'PlayStation 3' },
        { key: 'pc', name: 'PC' },
        { key: 'N64', name: 'Nintendo 64' },
        { key: 'GC', name: 'GameCube' },
        { key: 'GBA', name: 'Game Boy Advanced' },
        { key: 'SNES', name: 'Super Nintendo Entertainment System' },
        { key: 'wii', name: 'Nintendo Wii' },
        { key: 'PS4', name: 'PlayStation 4' }
    ];

    gameSystems.forEach(x=> x.icon = getIconUrl(x));


    function getIconUrl(g: IGameSystem) {
        return `./svg/${g.key}.svg`;
    }


var testDiv = document.getElementById('test');

    export function init() {

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
