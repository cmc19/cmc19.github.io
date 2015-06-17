



module page {
    interface IGameSystem {
        key: string;
        name: string;
        icon?: string;
    }

    export var gameSystems: IGameSystem[] = [
        { key: 'ps3', name: 'PlayStation 3' },
        { key: 'pc', name: 'PC' },
        { key: 'N64', name: 'Nintendo 64' },
        { key: 'GC', name: 'GameCube' },
        { key: 'GBA', name: 'Game Boy Advanced' },
        { key: 'SNES', name: 'Super Nintendo Entertainment System' },
        { key: 'wii', name: 'Wii' },
        { key: 'ps4', name: 'PlayStation 4' }
    ];

    gameSystems.forEach(x=> x.icon = getIconUrl(x));


    function getIconUrl(g: IGameSystem) {
        return `./svg/${g.key}.svg`;
    }


var testDiv = document.getElementById('test');

    export function init() {
gameSystems.forEach(gs=>{
    let i = document.createElement('img');
    i.src = gs.icon;
    i.height=32;
    i.width=32;
    testDiv.appendChild(i);
});
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
