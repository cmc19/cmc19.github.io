var CMC;
(function (CMC) {
    var _MAP = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'ins',
        46: 'del',
        91: 'meta',
        93: 'meta',
        224: 'meta'
    };
    var _KEYCODE_MAP = {
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111: '/',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };
    var _SHIFT_MAP = {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        ':': ';',
        '\"': '\'',
        '<': ',',
        '>': '.',
        '?': '/',
        '|': '\\'
    };
    var _SPECIAL_ALIASES = {
        'option': 'alt',
        'command': 'meta',
        'return': 'enter',
        'escape': 'esc',
        'plus': '+',
        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
    };
    var _REVERSE_MAP;
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }
    for (i = 0; i <= 9; ++i) {
        _MAP[i + 96] = i;
    }
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }
        object.attachEvent('on' + type, callback);
    }
    function _characterFromEvent(e) {
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }
            return character;
        }
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }
        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }
        return String.fromCharCode(e.which).toLowerCase();
    }
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }
    function _eventModifiers(e) {
        var modifiers = [];
        if (e.shiftKey) {
            modifiers.push('shift');
        }
        if (e.altKey) {
            modifiers.push('alt');
        }
        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }
        if (e.metaKey) {
            modifiers.push('meta');
        }
        return modifiers;
    }
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }
        e.returnValue = false;
    }
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }
        e.cancelBubble = true;
    }
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {
                if (key > 95 && key < 112) {
                    continue;
                }
                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }
    function _pickBestAction(key, modifiers, action) {
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }
        return action;
    }
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }
        combination = combination.replace(/\+{2}/g, '+plus');
        return combination.split('+');
    }
    function _getKeyInfo(combination, action) {
        var keys;
        var key;
        var i;
        var modifiers = [];
        keys = _keysFromString(combination);
        for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }
        action = _pickBestAction(key, modifiers, action);
        return {
            key: key,
            modifiers: modifiers,
            action: action
        };
    }
    function _belongsTo(element, ancestor) {
        if (element === document) {
            return false;
        }
        if (element === ancestor) {
            return true;
        }
        return _belongsTo(element.parentNode, ancestor);
    }
    var KeyManager = (function () {
        function KeyManager(target) {
            var _this = this;
            if (target === void 0) { target = document.body; }
            this.target = target;
            this._callbacks = {};
            this._directMap = {};
            this._sequenceLevels = {};
            this._ignoreNextKeyup = false;
            this._ignoreNextKeypress = false;
            this._nextExpectedAction = false;
            this._globalCallbacks = {};
            this.paused = false;
            if (target.tagName = 'div') {
                target.tabIndex = 0;
            }
            _addEvent(this.target, 'keypress', function (e) { return _this._handleKeyEvent(e); });
            _addEvent(this.target, 'keydown', function (e) { return _this._handleKeyEvent(e); });
            _addEvent(this.target, 'keyup', function (e) { return _this._handleKeyEvent(e); });
        }
        KeyManager.prototype._resetSequences = function (doNotReset) {
            doNotReset = doNotReset || {};
            var activeSequences = false;
            var key;
            for (key in this._sequenceLevels) {
                if (doNotReset[key]) {
                    activeSequences = true;
                    continue;
                }
                this._sequenceLevels[key] = 0;
            }
            if (!activeSequences)
                this._nextExpectedAction = false;
        };
        KeyManager.prototype._getMatches = function (character, modifiers, e, sequenceName, combination, level) {
            var i;
            var callback;
            var matches = [];
            var action = e.type;
            if (!this._callbacks[character]) {
                return [];
            }
            if (action == 'keyup' && _isModifier(character)) {
                modifiers = [character];
            }
            for (i = 0; i < this._callbacks[character].length; ++i) {
                callback = this._callbacks[character][i];
                if (!sequenceName && callback.seq && this._sequenceLevels[callback.seq] != callback.level) {
                    continue;
                }
                if (action != callback.action) {
                    continue;
                }
                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {
                    var deleteCombo = !sequenceName && callback.combo == combination;
                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                    if (deleteCombo || deleteSequence) {
                        this._callbacks[character].splice(i, 1);
                    }
                    matches.push(callback);
                }
            }
            return matches;
        };
        KeyManager.prototype._fireCallback = function (callback, e, combo, sequence) {
            if (this.stopCallback(e, e.target || e.srcElement)) {
                return;
            }
            if (callback(e, combo) === false) {
                _preventDefault(e);
                _stopPropagation(e);
            }
        };
        KeyManager.prototype._handleKey = function (character, modifiers, e) {
            var callbacks = this._getMatches(character, modifiers, e);
            var i;
            var doNotReset = {};
            var maxLevel = 0;
            var processedSequenceCallback = false;
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
                }
            }
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    if (callbacks[i].level != maxLevel) {
                        continue;
                    }
                    processedSequenceCallback = true;
                    doNotReset[callbacks[i].seq] = 1;
                    this._fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                    continue;
                }
                if (!processedSequenceCallback) {
                    this._fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }
            var ignoreThisKeypress = e.type == 'keypress' && this._ignoreNextKeypress;
            if (e.type == this._nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                this._resetSequences(doNotReset);
            }
            this._ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
        };
        KeyManager.prototype._handleKeyEvent = function (e) {
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }
            var character = _characterFromEvent(e);
            if (!character) {
                return;
            }
            if (e.type == 'keyup' && this._ignoreNextKeyup === character) {
                this._ignoreNextKeyup = false;
                return;
            }
            this.handleKey(character, _eventModifiers(e), e);
        };
        KeyManager.prototype._resetSequenceTimer = function () {
            var _this = this;
            clearTimeout(this._resetTimer);
            this._resetTimer = setTimeout(function () { return _this._resetSequences; }, 1000);
        };
        KeyManager.prototype._bindSequence = function (combo, keys, callback, action) {
            var _this = this;
            this._sequenceLevels[combo] = 0;
            var _increaseSequence = function (nextAction) {
                return function () {
                    this._nextExpectedAction = nextAction;
                    ++this._sequenceLevels[combo];
                    this._resetSequenceTimer();
                };
            };
            var _callbackAndReset = function (e) {
                _this._fireCallback(callback, e, combo);
                if (action !== 'keyup') {
                    _this._ignoreNextKeyup = _characterFromEvent(e);
                }
                setTimeout(function () { return _this._resetSequences; }, 10);
            };
            for (var i = 0; i < keys.length; ++i) {
                var isFinal = i + 1 === keys.length;
                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                this._bindSingle(keys[i], wrappedCallback, action, combo, i);
            }
        };
        KeyManager.prototype._bindSingle = function (combination, callback, action, sequenceName, level) {
            this._directMap[combination + ':' + action] = callback;
            combination = combination.replace(/\s+/g, ' ');
            var sequence = combination.split(' ');
            var info;
            if (sequence.length > 1) {
                this._bindSequence(combination, sequence, callback, action);
                return;
            }
            info = _getKeyInfo(combination, action);
            this._callbacks[info.key] = this._callbacks[info.key] || [];
            this._getMatches(info.key, info.modifiers, { type: info.action }, sequenceName, combination, level);
            this._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: info.modifiers,
                action: info.action,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        };
        KeyManager.prototype._bindMultiple = function (combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                this._bindSingle(combinations[i], callback, action);
            }
        };
        KeyManager.prototype.bind = function (keys, callback, action) {
            var self = this;
            keys = keys instanceof Array ? keys : [keys];
            self._bindMultiple.call(self, keys, callback, action);
            return self;
        };
        KeyManager.prototype.unbind = function (keys, action) {
            var self = this;
            return self.bind.call(self, keys, function () { }, action);
        };
        KeyManager.prototype.trigger = function (keys, action) {
            var self = this;
            if (self._directMap[keys + ':' + action]) {
                self._directMap[keys + ':' + action]({}, keys);
            }
            return self;
        };
        KeyManager.prototype.reset = function () {
            var self = this;
            self._callbacks = {};
            self._directMap = {};
            return self;
        };
        KeyManager.prototype.stopCallback = function (e, element, combo, sequence) {
            var self = this;
            if (self.paused) {
                return true;
            }
            if (this._globalCallbacks[combo] || this._globalCallbacks[sequence]) {
                return false;
            }
            if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                return false;
            }
            if (_belongsTo(element, self.target)) {
                return false;
            }
            return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
        };
        KeyManager.prototype.bindGlobal = function (keys, callback, action) {
            this.bind(keys, callback, action);
            if (keys instanceof Array) {
                for (var i = 0; i < keys.length; i++) {
                    this._globalCallbacks[keys[i]] = true;
                }
                return;
            }
            this._globalCallbacks[keys] = true;
        };
        KeyManager.prototype.handleKey = function (character, modifiers, e) {
            return this._handleKey.apply(this, arguments);
        };
        KeyManager.prototype.dispose = function () {
            this.reset();
        };
        KeyManager.prototype.pause = function () {
            this.paused = true;
        };
        KeyManager.prototype.unpause = function () {
            this.paused = false;
        };
        return KeyManager;
    })();
    CMC.KeyManager = KeyManager;
})(CMC || (CMC = {}));
var PlanetRelationship = (function () {
    function PlanetRelationship(a, b) {
        this.id = PlanetRelationship.totalIdx++;
        this.ignoreFor = 0;
        this.a = a;
        this.b = b;
    }
    Object.defineProperty(PlanetRelationship.prototype, "isDestroyed", {
        get: function () {
            return this.a.isDestroyed || this.b.isDestroyed || this.a.id == this.b.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlanetRelationship.prototype, "largest", {
        get: function () {
            var a = this.a;
            var b = this.b;
            if (a.mass == b.mass)
                return a;
            return a.mass > b.mass ? a : b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlanetRelationship.prototype, "smallest", {
        get: function () {
            var a = this.a;
            var b = this.b;
            if (a.mass == b.mass)
                return b;
            return b.mass > a.mass ? a : b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlanetRelationship.prototype, "isActive", {
        get: function () {
            return this.ignoreFor == 0;
        },
        enumerable: true,
        configurable: true
    });
    PlanetRelationship.prototype.tick = function () {
        if (this.a.isDestroyed || this.b.isDestroyed)
            return;
        if (this.ignoreFor !== 0) {
            this.ignoreFor--;
            return;
        }
        var a = this.largest;
        var b = this.smallest;
        var r = this.apply1(a, b);
        if (r) {
            var r2 = this.apply1(b, a);
            if (r2 == false)
                console.log('error');
        }
        else {
        }
    };
    PlanetRelationship.prototype.apply1 = function (a, b) {
        var diffXab = b.x - a.x;
        var diffYab = b.y - a.y;
        var distSquareAb = diffXab * diffXab + diffYab * diffYab;
        var dist = Math.sqrt(distSquareAb);
        dist = dist / 2;
        if (dist >= (a.radius / 2) + (b.radius / 2)) {
            var totalForce = (a.mass * b.mass) / distSquareAb;
            a.fX += (totalForce * diffXab) / dist;
            a.fY += totalForce * diffYab / dist;
            if (totalForce < .001) {
                this.ignoreFor = random(45, 75);
            }
        }
        else {
            a.fX += b.vX / b.mass;
            a.fY += b.vY / b.mass;
            a.mass += b.mass;
            a.updateShapeGraphics();
            b.destroy();
            return false;
        }
        return true;
    };
    PlanetRelationship.prototype.toString = function () {
        return "PlanetRelationship: " + this.id + ", A:" + this.a.id + ", B:" + this.b.id;
    };
    PlanetRelationship.totalIdx = 0;
    return PlanetRelationship;
})();
var SolarSystem = (function () {
    function SolarSystem() {
        this.offset = { x: 0, y: 0 };
        this.zoom = 1;
        this.objects = [];
        this.stage = new createjs.Stage("canvas");
        this.relationships = [];
    }
    SolarSystem.prototype.createPlanet = function (x, y, mass, vx, vy) {
        var _this = this;
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        var p = new Planet(this, x, y, mass, vx, vy);
        this.objects.forEach(function (p2) {
            _this.relationships.push(new PlanetRelationship(p2, p));
        });
        this.objects.push(p);
    };
    SolarSystem.prototype.tick = function () {
        var allObjs = this.objects;
        var stage = this.stage;
        var ignore = [];
        this.relationships.forEach(function (c) {
            c.tick();
        });
        allObjs.forEach(function (x) { return x.tick(); });
        this.stage.update();
    };
    SolarSystem.prototype.cleanup = function () {
        this.objects = this.objects.filter(function (x) { return x.isDestroyed == false; });
        this.relationships = this.relationships.filter(function (x) { return x.isDestroyed == false; });
    };
    SolarSystem.prototype.setCenter = function (x, y) {
        console.log("setCenter(" + x + ", " + y + ");");
        x = x * -1;
        y = y * -1;
        this.offset = { x: x, y: y };
        var c = this.stage.canvas;
        var w = c.width;
        var h = c.height;
        console.info("w:" + w + ", h:" + h);
        var z = Math.pow(2, this.zoom - 1);
        var xr = ((w / 2) * z);
        var yr = ((h / 2) * z);
        this.offset = {
            x: (x + xr),
            y: (y + yr)
        };
        this.logOffset();
    };
    SolarSystem.prototype.logOffset = function () {
        console.log("offset: {x:" + this.offset.x + ", y:" + this.offset.y + "}");
    };
    SolarSystem.prototype.toString = function () {
        return "offset: {x:" + this.offset.x + ", y:" + this.offset.y + "}";
    };
    return SolarSystem;
})();
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
function findAllPossibleCombos(a, min, max) {
    if (max === void 0) { max = null; }
    if (max === null)
        max = a.length;
    max += 1;
    var fn = function (n, src, got, all) {
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
    };
    var all = [];
    for (var i = min; i < max; i++) {
        fn(i, a, [], all);
    }
    return all;
}
/// <reference path="./util"/>
var speedModifier = 4;
var Planet = (function () {
    function Planet(system, x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.system = system;
        this.id = Planet.totalIdx++;
        this.shape = new createjs.Shape();
        this.fX = 0;
        this.fY = 0;
        this.isDestroyed = false;
        this.color = new Color(randColor());
        this._lastZoom = 0;
        if (this.color.getLightness() < .3) {
            this.color = this.color.lightenByAmount(1);
        }
        this.shape.graphics.drawCircle(0, 0, 0).setStrokeStyle(1).beginStroke('white').beginFill(this.color.toCSS());
        system.stage.addChild(this.shape);
        var p = this;
        var obj = this.shape;
        obj.regX = obj.regY = -mass;
        obj.x = x;
        obj.y = y;
        p.mass = mass;
        this.x = x;
        this.y = y;
        p.vX = vx;
        p.vY = vy;
        this.updateShapeGraphics();
    }
    Object.defineProperty(Planet.prototype, "width", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Planet.prototype, "height", {
        get: function () {
            return this.radius * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Planet.prototype, "radius", {
        get: function () {
            return circlueRad(this.mass * 4);
        },
        enumerable: true,
        configurable: true
    });
    Planet.prototype.tick = function () {
        var t = this;
        t.vX += t.fX / t.mass;
        t.vY += t.fY / t.mass;
        t.x += t.vX / speedModifier;
        t.y += t.vY / speedModifier;
        this.updateShape();
        t.fX = t.fY = 0;
    };
    Planet.prototype.updateShape = function () {
        if (this._lastZoom != this.system.zoom) {
            this._lastZoom = this.system.zoom;
            this.updateShapeGraphics();
        }
        this.shape.x = (this.x + this.system.offset.x) / Math.pow(2, this.system.zoom - 1);
        this.shape.y = (this.y + this.system.offset.y) / Math.pow(2, this.system.zoom - 1);
    };
    Planet.prototype.updateShapeGraphics = function () {
        var obj = this.shape;
        obj.graphics.clear();
        var g = obj.graphics
            .beginFill(this.color.toCSS())
            .drawCircle(0, 0, this.radius / Math.pow(2, this.system.zoom - 1));
    };
    Planet.prototype.destroy = function () {
        this.isDestroyed = true;
        this.mass = 0;
        this.system.stage.removeChild(this.shape);
    };
    Planet.prototype.toString = function () {
        return "{mass: " + this.mass + ", x: " + this.x + ", y: " + this.y + "}";
    };
    Planet.totalIdx = 0;
    return Planet;
})();
/// <reference path="./typings/jquery/jquery.d.ts"/>
/// <reference path="./typings/easeljs/easeljs.d.ts"/>
/// <reference path="./scripts/color.d.ts"/>
/// <reference path="./util"/>
/// <reference path="./planet"/>
/// <reference path="./Relationship"/>
/// <reference path="./KeyManager"/>
/// <reference path="./SolarSystem"/>
var Page = (function () {
    function Page() {
        this.keyManger = new CMC.KeyManager();
        this.system = new SolarSystem();
        this.tickCount = 0;
        this.mouse = { startX: 0, startY: 0 };
        this.cl = null;
        this.bodyCount = document.getElementById('bodyCount');
        this.mass = document.getElementById('mass');
        this.fpsCounter = document.getElementById('fps');
        this.relCount = document.getElementById('relCount');
        this.zoomDisplay = document.getElementById('zoom');
    }
    Page.prototype.getMouseLocation = function (x, y) {
        var s = this.system;
        var o = s.offset;
        var z = Math.pow(2, s.zoom - 1);
        var r = {
            x: o.x - ((x) * z),
            y: o.y - ((y) * z)
        };
        return {
            x: r.x * -1, y: r.y * -1
        };
    };
    ;
    Object.defineProperty(Page.prototype, "canvas", {
        get: function () {
            return this.system.stage.canvas;
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype.fillWindow = function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };
    Page.prototype.init = function () {
        var _this = this;
        var stage = this.system.stage;
        $(window).on('resize', function () { return _this.fillWindow(); });
        stage.on('stagemousemove', function (e) {
            _this.cl = _this.getMouseLocation(e.stageX, e.stageY);
        });
        stage.on("stagemousedown", function (e) {
            _this.mouse.startX = e.stageX;
            _this.mouse.startY = e.stageY;
            _this.getMouseLocation(e.stageX, e.stageY);
        });
        stage.on("stagemouseup", function (e) {
            if (e.nativeEvent.button == 2) {
                e.preventDefault();
                e.nativeEvent.preventDefault();
                e.nativeEvent.cancelBubble = true;
            }
            if (e.nativeEvent.button == 1) {
                _this.system.offset.x += (e.stageX - _this.mouse.startX) * _this.system.zoom;
                _this.system.offset.y += (e.stageY - _this.mouse.startY) * _this.system.zoom;
            }
            else {
                _this.createPlanet((_this.mouse.startX - _this.system.offset.x) - 5, (_this.mouse.startY - _this.system.offset.y) - 5, random(2, 5), e.stageX - _this.mouse.startX, e.stageY - _this.mouse.startY);
            }
            _this.system.logOffset();
        });
        this.canvas.addEventListener('mousewheel', function (x) {
            console.log('mousewheel', x);
            var ml = _this.cl;
            if (x.wheelDelta <= -1) {
                _this.system.zoom++;
            }
            else if (x.wheelDelta >= 1) {
                if (_this.system.zoom == 1) {
                }
                else {
                    _this.system.zoom--;
                }
            }
            _this.system.setCenter(ml.x, ml.y);
        });
        createjs.Ticker.on("tick", function () {
            _this.tickCount++;
            _this.system.tick();
            if (_this.tickCount % 60 == 0) {
                _this.system.cleanup();
                _this.updateFps();
                _this.updateMass();
                _this.updateBodyCount();
            }
        });
        createjs.Ticker.setFPS(60);
        this.fillWindow();
        this.fillRandom(20, 100);
        this.fillRandom(1000, 2400);
        for (var i = 0; i < 800; i++) {
            this.createPlanet(this.canvas.width, this.canvas.height, 1);
        }
        this.keyManger.bind('1', function (e) { createjs.Ticker.setFPS(15); });
        this.keyManger.bind('2', function (e) { createjs.Ticker.setFPS(30); });
        this.keyManger.bind('3', function (e) { createjs.Ticker.setFPS(60); });
        this.keyManger.bind('4', function (e) { createjs.Ticker.setFPS(90); });
        this.keyManger.bind('5', function (e) { createjs.Ticker.setFPS(120); });
        this.keyManger.bind('0', function (e) { _this.system.offset = { x: 0, y: 0 }; });
    };
    Page.prototype.createPlanet = function (x, y, mass, vx, vy) {
        if (vx === void 0) { vx = 0; }
        if (vy === void 0) { vy = 0; }
        this.system.createPlanet(x, y, mass, vx, vy);
    };
    Page.prototype.fillRandom = function (min, max) {
        for (var i = 0; i < random(min, max); i++) {
            this.createPlanet(random(0, window.innerWidth * 2), random(0, window.innerHeight * 2), 1, 0, 0);
        }
    };
    Page.prototype.updateFps = function () {
        this.fpsCounter.innerText = Math.round(createjs.Ticker.getMeasuredFPS()).toString() + "/" + Math.round(createjs.Ticker.getFPS());
        this.zoomDisplay.innerText = this.system.zoom.toString() + " " + this.system.toString();
    };
    Page.prototype.updateMass = function () {
        var mass = 0;
        this.system.objects.forEach(function (x) { return mass += x.mass; });
        this.mass.innerText = mass.toString();
    };
    Page.prototype.updateBodyCount = function () {
        this.bodyCount.innerText = this.system.objects.length.toString();
        this.relCount.innerText = this.system.relationships.filter(function (x) { return x.isActive; }).length.toString() + '/' + this.system.relationships.length.toString();
    };
    return Page;
})();
function sortBy(array, fn) {
    return array.slice(0).sort(function (a, b) {
        return (fn(a) > fn(b)) ? 1 : (fn(a) < fn(b)) ? -1 : 0;
    });
}
var page = new Page();
$(document).ready(function () { return page.init(); });
//# sourceMappingURL=out.js.map