var ElementList = (function () {
    function ElementList(nl) {
        this.array = Array.prototype.slice.call(nl);
    }
    ElementList.prototype.forEach = function (fn) {
        this.array.forEach(fn);
        return this;
    };
    ElementList.prototype.addClass = function (klass) {
        var _this = this;
        var classes = klass.split(' ').filter(function (x) { return x !== ''; });
        classes.forEach(function (c) {
            _this.forEach(function (x) { return x.classList.add(c); });
        });
        return this;
    };
    return ElementList;
})();
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
            i.title = gs.icon;
            i.src = gs.icon;
            i.height = 32;
            i.width = 32;
            testDiv.appendChild(i);
        });
        var dgs = new ElementList(document.querySelectorAll('[data-gamesystem]'));
        dgs.forEach(function (x) {
            var gs = x.dataset['gamesystem'];
        });
        console.log(dgs);
    }
    page.init = init;
})(page || (page = {}));
page.init();
