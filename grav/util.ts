
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function circleArea(r) {
    return Math.PI * r * r;
}

function circlueRad(a) {
    return Math.sqrt(a / Math.PI);
}

function findAllPossibleCombos<T>(a: T[], min: number, max: number = null): T[][] {
    if (max === null) max = a.length;
    max += 1;
    var fn = function(n, src, got, all) {
        if (n == 0) {
            if (got.length > 0) {
                all[all.length] = got;
            }
            return;
        }
        for (var j = 0; j < src.length; j++) {
            fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
    }
    var all = [];
    for (var i = min; i < max; i++) {
        fn(i, a, [], all);
    }
    //all.push(a);
    return all;
}
