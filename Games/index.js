var page;
(function (page) {
    page.gameSystems = [
        { key: 'PS3', name: 'PlayStation 3' },
        { key: 'pc', name: 'PC' },
        { key: 'N64', name: 'Nintendo 64' },
        { key: 'GC', name: 'GameCube' },
        { key: 'GBA', name: 'Game Boy Advanced' },
        { key: 'SNES', name: 'Super Nintendo Entertainment System' },
        { key: 'wii', name: 'Nintendo Wii' },
        { key: 'PS4', name: 'PlayStation 4' }
    ];
    page.gameSystems.forEach(function (x) { return x.icon = getIconUrl(x); });
    function getIconUrl(g) {
        return "./svg/" + g.key + ".svg";
    }
    var testDiv = document.getElementById('test');
    function init() {
    }
    page.init = init;
})(page || (page = {}));
page.init();
