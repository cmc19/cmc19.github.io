var page;
(function (page) {
    page.gameSystems = [
        { key: 'ps3', name: 'PlayStation 3' },
        { key: 'pc', name: 'PC' },
        { key: 'N64', name: 'Nintendo 64' },
        { key: 'GC', name: 'GameCube' },
        { key: 'GBA', name: 'Game Boy Advanced' },
        { key: 'SNES', name: 'Super Nintendo Entertainment System' },
        { key: 'wii', name: 'Wii' },
        { key: 'ps4', name: 'PlayStation 4' }
    ];
    page.gameSystems.forEach(function (x) { return x.icon = getIconUrl(x); });
    function getIconUrl(g) {
        return "./svg/" + g.key + ".svg";
    }
    var testDiv = document.getElementById('test');
    function init() {
        page.gameSystems.forEach(function (gs) {
            var i = document.createElement('img');
            i.src = gs.icon;
            i.height = 32;
            i.width = 32;
            testDiv.appendChild(i);
        });
    }
    page.init = init;
})(page || (page = {}));
page.init();
