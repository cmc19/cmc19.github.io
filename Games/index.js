var page;
(function (page) {
    page.gameSystems = [
        { key: 'ps3', name: 'PlayStation 3' },
        { key: 'pc', name: 'PC' },
        { key: 'n64', name: 'Nintendo 64' },
        { key: 'gc', name: 'GameCube' },
        { key: 'gba', name: 'Game Boy Advanced' },
        { key: 'snes', name: 'Super Nintendo Entertainment System' },
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
