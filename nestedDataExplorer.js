(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory(require('d3'), require('webcharts')))
        : typeof define === 'function' && define.amd
        ? define(['d3', 'webcharts'], factory)
        : ((global = global || self),
          (global.nestedDataExplorer = factory(global.d3, global.webCharts)));
})(this, function(d3$1, webcharts) {
    'use strict';

    if (typeof Object.assign != 'function') {
        Object.defineProperty(Object, 'assign', {
            value: function assign(target, varArgs) {
                if (target == null) {
                    // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) {
                        // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }

                return to;
            },
            writable: true,
            configurable: true
        });
    }

    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function value(predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, 'length')).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, � kValue, k, O �)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return undefined.
                return undefined;
            }
        });
    }

    if (!Array.prototype.findIndex) {
        Object.defineProperty(Array.prototype, 'findIndex', {
            value: function value(predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, � kValue, k, O �)).
                    // d. If testResult is true, return k.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return k;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return -1.
                return -1;
            }
        });
    }

    Math.log10 = Math.log10 =
        Math.log10 ||
        function(x) {
            return Math.log(x) * Math.LOG10E;
        };

    // https://github.com/wbkd/d3-extended
    d3$1.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };

    d3$1.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    function rendererSettings() {
        return {
            group_options: [],
            groups: [],
            metrics: [],
            show_count: true,
            show_percent: true,
            sort_alpha: false,
            sort_direction: 'descending',
            sort_column: 'n',
            show_sparklines: false,
            date_col: null,
            date_format: null, //if specified, will attempt to parse date_col with d3.time.format(date_format)
            show_overall: true,
            spark: {
                interval: '%Y-%m',
                width: 100,
                height: 25,
                offset: 3
            },
            filters: [] //updated in sync settings
        };
    }

    function webchartsSettings() {
        return {
            x: {
                column: null,
                type: 'ordinal'
            },
            y: {
                column: '',
                type: 'linear'
            },
            marks: [
                {
                    type: 'bar',
                    per: null
                }
            ],
            max_width: 900
        };
    }

    function syncSettings(settings) {
        if (settings.sort_alpha === true) {
            settings.sort_direction = 'ascending';
            settings.sort_column = 'key';
        }

        // webcharts settings
        settings.y.column = settings.groups[0];
        settings.marks[0].per = [settings.groups[0]];
        settings.raw_groups = ['overall']; //system setting
        settings.filters = settings.group_options.filter(function(f) {
            return f.value_col != 'none';
        });

        // sparkline merge
        if (settings.spark != undefined) {
            settings.spark.interval = settings.spark.interval || '%Y-%m';
            settings.spark.width = settings.spark.width || 100;
            settings.spark.height = settings.spark.height || 25;
            settings.spark.offset = settings.spark.offset || 3;
        }

        //clean up in metrics
        settings.metrics.forEach(function(d) {
            if (d.visible == undefined) d.visible = true;
            if (d.showSparkline == undefined) d.showSparkline = true;
            if (d.fillEmptyCells == undefined) d.fillEmptyCells = true;
            if (d.type == undefined) d.type = 'line';
            if (d.sort_direction === undefined) d.sort_direction = 'ascending';
        });

        //merge in default metrics
        var metricNames = settings.metrics.map(function(m) {
            return m.label;
        });

        if (metricNames.indexOf('n') == -1) {
            settings.metrics.push({
                label: 'n',
                calc: function calc(d) {
                    return d.length;
                },
                format: ',1d',
                showSparkline: true,
                visible: settings.hide_count ? false : true,
                fillEmptyCells: true,
                type: 'bar'
            });
        }
        if (metricNames.indexOf('%') == -1) {
            settings.metrics.push({
                label: '%',
                calc: function calc(d) {
                    return this.n / this.total;
                },
                calcTitle: function calcTitle(d) {
                    return '' + this.n + '/' + this.total;
                },
                format: '0.1%',
                showSparkline: false,
                visible: settings.hide_percent ? false : true,
                fillEmptyCells: true
            });
        }

        return settings;
    }

    function controlInputs() {
        return [
            {
                type: 'checkbox',
                label: 'Sort Alphabetically?',
                option: 'sort_alpha',
                require: true
            }
        ];
    }

    function syncControlInputs(controlInputs, settings) {
        //Add filters to default controls.
        if (Array.isArray(settings.filters) && settings.filters.length > 0) {
            settings.filters.forEach(function(filter) {
                var filterObj = {
                    type: 'subsetter',
                    value_col: filter.value_col || filter,
                    label: filter.label || filter.value_col || filter
                };
                controlInputs.push(filterObj);
            });
        }
        return controlInputs;
    }

    function listingSettings() {
        return {
            cols: null,
            searchable: true,
            sortable: true,
            pagination: true,
            exportable: true
        };
    }

    var configuration = {
        rendererSettings: rendererSettings,
        webchartsSettings: webchartsSettings,
        settings: Object.assign({}, rendererSettings(), webchartsSettings()),
        syncSettings: syncSettings,
        controlInputs: controlInputs,
        syncControlInputs: syncControlInputs,
        listingSettings: listingSettings
    };

    function makeOverall() {
        this.raw_data.forEach(function(d) {
            d.overall = 'Overall';
        });
    }

    function makeDateInterval() {
        var config = this.config;
        if (config.date_col) {
            this.raw_data.forEach(function(d) {
                d.date_parsed = d3.time.format(config.date_format).parse(d[config.date_col]);
                d.date_interval =
                    d.date_parsed instanceof Date
                        ? d3.time.format(config.spark.interval)(d.date_parsed)
                        : null;
                return d;
            });
        }
    }

    function initListing() {
        var chart = this;
        var configCols = ['overall', 'date_parsed', 'date_interval'];
        this.listing.config.cols = Object.keys(this.initial_data[0]).filter(function(f) {
            return configCols.indexOf(f) == -1;
        });
        this.listing.init([]);
        this.listing.wrap.insert('h3', '*');
        this.listing.wrap
            .insert('div', '*')
            .attr('class', 'closeDetails')
            .append('span')
            .text('<< Return to Table')
            .on('click', function() {
                chart.listing.wrap.classed('hidden', true);
                chart.wrap.classed('hidden', false);
                chart.controls.wrap.classed('hidden', false);
            });
        this.listing.wrap.classed('hidden', true);
    }

    function onInit() {
        makeOverall.call(this);
        makeDateInterval.call(this);
        initListing.call(this);
    }

    /**!
     * Sortable 1.10.2
     * @author	RubaXa   <trash@rubaxa.org>
     * @author	owenm    <owen23355@gmail.com>
     * @license MIT
     */
    function _typeof(obj) {
        if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
            _typeof = function(obj) {
                return typeof obj;
            };
        } else {
            _typeof = function(obj) {
                return obj &&
                    typeof Symbol === 'function' &&
                    obj.constructor === Symbol &&
                    obj !== Symbol.prototype
                    ? 'symbol'
                    : typeof obj;
            };
        }

        return _typeof(obj);
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _extends() {
        _extends =
            Object.assign ||
            function(target) {
                for (var i = 1; i < arguments.length; i++) {
                    var source = arguments[i];

                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }

                return target;
            };

        return _extends.apply(this, arguments);
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(
                    Object.getOwnPropertySymbols(source).filter(function(sym) {
                        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                    })
                );
            }

            ownKeys.forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    function _objectWithoutPropertiesLoose(source, excluded) {
        if (source == null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;

        for (i = 0; i < sourceKeys.length; i++) {
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            target[key] = source[key];
        }

        return target;
    }

    function _objectWithoutProperties(source, excluded) {
        if (source == null) return {};

        var target = _objectWithoutPropertiesLoose(source, excluded);

        var key, i;

        if (Object.getOwnPropertySymbols) {
            var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

            for (i = 0; i < sourceSymbolKeys.length; i++) {
                key = sourceSymbolKeys[i];
                if (excluded.indexOf(key) >= 0) continue;
                if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
                target[key] = source[key];
            }
        }

        return target;
    }

    var version = '1.10.2';

    function userAgent(pattern) {
        if (typeof window !== 'undefined' && window.navigator) {
            return !!(
                /*@__PURE__*/
                navigator.userAgent.match(pattern)
            );
        }
    }

    var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
    var Edge = userAgent(/Edge/i);
    var FireFox = userAgent(/firefox/i);
    var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
    var IOS = userAgent(/iP(ad|od|hone)/i);
    var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

    var captureMode = {
        capture: false,
        passive: false
    };

    function on(el, event, fn) {
        el.addEventListener(event, fn, !IE11OrLess && captureMode);
    }

    function off(el, event, fn) {
        el.removeEventListener(event, fn, !IE11OrLess && captureMode);
    }

    function matches(
        /**HTMLElement*/
        el,
        /**String*/
        selector
    ) {
        if (!selector) return;
        selector[0] === '>' && (selector = selector.substring(1));

        if (el) {
            try {
                if (el.matches) {
                    return el.matches(selector);
                } else if (el.msMatchesSelector) {
                    return el.msMatchesSelector(selector);
                } else if (el.webkitMatchesSelector) {
                    return el.webkitMatchesSelector(selector);
                }
            } catch (_) {
                return false;
            }
        }

        return false;
    }

    function getParentOrHost(el) {
        return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
    }

    function closest(
        /**HTMLElement*/
        el,
        /**String*/
        selector,
        /**HTMLElement*/
        ctx,
        includeCTX
    ) {
        if (el) {
            ctx = ctx || document;

            do {
                if (
                    (selector != null &&
                        (selector[0] === '>'
                            ? el.parentNode === ctx && matches(el, selector)
                            : matches(el, selector))) ||
                    (includeCTX && el === ctx)
                ) {
                    return el;
                }

                if (el === ctx) break;
                /* jshint boss:true */
            } while ((el = getParentOrHost(el)));
        }

        return null;
    }

    var R_SPACE = /\s+/g;

    function toggleClass(el, name, state) {
        if (el && name) {
            if (el.classList) {
                el.classList[state ? 'add' : 'remove'](name);
            } else {
                var className = (' ' + el.className + ' ')
                    .replace(R_SPACE, ' ')
                    .replace(' ' + name + ' ', ' ');
                el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
            }
        }
    }

    function css(el, prop, val) {
        var style = el && el.style;

        if (style) {
            if (val === void 0) {
                if (document.defaultView && document.defaultView.getComputedStyle) {
                    val = document.defaultView.getComputedStyle(el, '');
                } else if (el.currentStyle) {
                    val = el.currentStyle;
                }

                return prop === void 0 ? val : val[prop];
            } else {
                if (!(prop in style) && prop.indexOf('webkit') === -1) {
                    prop = '-webkit-' + prop;
                }

                style[prop] = val + (typeof val === 'string' ? '' : 'px');
            }
        }
    }

    function matrix(el, selfOnly) {
        var appliedTransforms = '';

        if (typeof el === 'string') {
            appliedTransforms = el;
        } else {
            do {
                var transform = css(el, 'transform');

                if (transform && transform !== 'none') {
                    appliedTransforms = transform + ' ' + appliedTransforms;
                }
                /* jshint boss:true */
            } while (!selfOnly && (el = el.parentNode));
        }

        var matrixFn =
            window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
        /*jshint -W056 */

        return matrixFn && new matrixFn(appliedTransforms);
    }

    function find(ctx, tagName, iterator) {
        if (ctx) {
            var list = ctx.getElementsByTagName(tagName),
                i = 0,
                n = list.length;

            if (iterator) {
                for (; i < n; i++) {
                    iterator(list[i], i);
                }
            }

            return list;
        }

        return [];
    }

    function getWindowScrollingElement() {
        var scrollingElement = document.scrollingElement;

        if (scrollingElement) {
            return scrollingElement;
        } else {
            return document.documentElement;
        }
    }
    /**
     * Returns the "bounding client rect" of given element
     * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
     * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
     * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
     * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
     * @param  {[HTMLElement]} container              The parent the element will be placed in
     * @return {Object}                               The boundingClientRect of el, with specified adjustments
     */

    function getRect(
        el,
        relativeToContainingBlock,
        relativeToNonStaticParent,
        undoScale,
        container
    ) {
        if (!el.getBoundingClientRect && el !== window) return;
        var elRect, top, left, bottom, right, height, width;

        if (el !== window && el !== getWindowScrollingElement()) {
            elRect = el.getBoundingClientRect();
            top = elRect.top;
            left = elRect.left;
            bottom = elRect.bottom;
            right = elRect.right;
            height = elRect.height;
            width = elRect.width;
        } else {
            top = 0;
            left = 0;
            bottom = window.innerHeight;
            right = window.innerWidth;
            height = window.innerHeight;
            width = window.innerWidth;
        }

        if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
            // Adjust for translate()
            container = container || el.parentNode; // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
            // Not needed on <= IE11

            if (!IE11OrLess) {
                do {
                    if (
                        container &&
                        container.getBoundingClientRect &&
                        (css(container, 'transform') !== 'none' ||
                            (relativeToNonStaticParent && css(container, 'position') !== 'static'))
                    ) {
                        var containerRect = container.getBoundingClientRect(); // Set relative to edges of padding box of container

                        top -= containerRect.top + parseInt(css(container, 'border-top-width'));
                        left -= containerRect.left + parseInt(css(container, 'border-left-width'));
                        bottom = top + elRect.height;
                        right = left + elRect.width;
                        break;
                    }
                    /* jshint boss:true */
                } while ((container = container.parentNode));
            }
        }

        if (undoScale && el !== window) {
            // Adjust for scale()
            var elMatrix = matrix(container || el),
                scaleX = elMatrix && elMatrix.a,
                scaleY = elMatrix && elMatrix.d;

            if (elMatrix) {
                top /= scaleY;
                left /= scaleX;
                width /= scaleX;
                height /= scaleY;
                bottom = top + height;
                right = left + width;
            }
        }

        return {
            top: top,
            left: left,
            bottom: bottom,
            right: right,
            width: width,
            height: height
        };
    }
    /**
     * Checks if a side of an element is scrolled past a side of its parents
     * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
     * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
     * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
     * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
     */

    function isScrolledPast(el, elSide, parentSide) {
        var parent = getParentAutoScrollElement(el, true),
            elSideVal = getRect(el)[elSide];
        /* jshint boss:true */

        while (parent) {
            var parentSideVal = getRect(parent)[parentSide],
                visible = void 0;

            if (parentSide === 'top' || parentSide === 'left') {
                visible = elSideVal >= parentSideVal;
            } else {
                visible = elSideVal <= parentSideVal;
            }

            if (!visible) return parent;
            if (parent === getWindowScrollingElement()) break;
            parent = getParentAutoScrollElement(parent, false);
        }

        return false;
    }
    /**
     * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
     * and non-draggable elements
     * @param  {HTMLElement} el       The parent element
     * @param  {Number} childNum      The index of the child
     * @param  {Object} options       Parent Sortable's options
     * @return {HTMLElement}          The child at index childNum, or null if not found
     */

    function getChild(el, childNum, options) {
        var currentChild = 0,
            i = 0,
            children = el.children;

        while (i < children.length) {
            if (
                children[i].style.display !== 'none' &&
                children[i] !== Sortable.ghost &&
                children[i] !== Sortable.dragged &&
                closest(children[i], options.draggable, el, false)
            ) {
                if (currentChild === childNum) {
                    return children[i];
                }

                currentChild++;
            }

            i++;
        }

        return null;
    }
    /**
     * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
     * @param  {HTMLElement} el       Parent element
     * @param  {selector} selector    Any other elements that should be ignored
     * @return {HTMLElement}          The last child, ignoring ghostEl
     */

    function lastChild(el, selector) {
        var last = el.lastElementChild;

        while (
            last &&
            (last === Sortable.ghost ||
                css(last, 'display') === 'none' ||
                (selector && !matches(last, selector)))
        ) {
            last = last.previousElementSibling;
        }

        return last || null;
    }
    /**
     * Returns the index of an element within its parent for a selected set of
     * elements
     * @param  {HTMLElement} el
     * @param  {selector} selector
     * @return {number}
     */

    function index(el, selector) {
        var index = 0;

        if (!el || !el.parentNode) {
            return -1;
        }
        /* jshint boss:true */

        while ((el = el.previousElementSibling)) {
            if (
                el.nodeName.toUpperCase() !== 'TEMPLATE' &&
                el !== Sortable.clone &&
                (!selector || matches(el, selector))
            ) {
                index++;
            }
        }

        return index;
    }
    /**
     * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
     * The value is returned in real pixels.
     * @param  {HTMLElement} el
     * @return {Array}             Offsets in the format of [left, top]
     */

    function getRelativeScrollOffset(el) {
        var offsetLeft = 0,
            offsetTop = 0,
            winScroller = getWindowScrollingElement();

        if (el) {
            do {
                var elMatrix = matrix(el),
                    scaleX = elMatrix.a,
                    scaleY = elMatrix.d;
                offsetLeft += el.scrollLeft * scaleX;
                offsetTop += el.scrollTop * scaleY;
            } while (el !== winScroller && (el = el.parentNode));
        }

        return [offsetLeft, offsetTop];
    }
    /**
     * Returns the index of the object within the given array
     * @param  {Array} arr   Array that may or may not hold the object
     * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
     * @return {Number}      The index of the object in the array, or -1
     */

    function indexOfObject(arr, obj) {
        for (var i in arr) {
            if (!arr.hasOwnProperty(i)) continue;

            for (var key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
            }
        }

        return -1;
    }

    function getParentAutoScrollElement(el, includeSelf) {
        // skip to window
        if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
        var elem = el;
        var gotSelf = false;

        do {
            // we don't need to get elem css if it isn't even overflowing in the first place (performance)
            if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
                var elemCSS = css(elem);

                if (
                    (elem.clientWidth < elem.scrollWidth &&
                        (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll')) ||
                    (elem.clientHeight < elem.scrollHeight &&
                        (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll'))
                ) {
                    if (!elem.getBoundingClientRect || elem === document.body)
                        return getWindowScrollingElement();
                    if (gotSelf || includeSelf) return elem;
                    gotSelf = true;
                }
            }
            /* jshint boss:true */
        } while ((elem = elem.parentNode));

        return getWindowScrollingElement();
    }

    function extend(dst, src) {
        if (dst && src) {
            for (var key in src) {
                if (src.hasOwnProperty(key)) {
                    dst[key] = src[key];
                }
            }
        }

        return dst;
    }

    function isRectEqual(rect1, rect2) {
        return (
            Math.round(rect1.top) === Math.round(rect2.top) &&
            Math.round(rect1.left) === Math.round(rect2.left) &&
            Math.round(rect1.height) === Math.round(rect2.height) &&
            Math.round(rect1.width) === Math.round(rect2.width)
        );
    }

    var _throttleTimeout;

    function throttle(callback, ms) {
        return function() {
            if (!_throttleTimeout) {
                var args = arguments,
                    _this = this;

                if (args.length === 1) {
                    callback.call(_this, args[0]);
                } else {
                    callback.apply(_this, args);
                }

                _throttleTimeout = setTimeout(function() {
                    _throttleTimeout = void 0;
                }, ms);
            }
        };
    }

    function cancelThrottle() {
        clearTimeout(_throttleTimeout);
        _throttleTimeout = void 0;
    }

    function scrollBy(el, x, y) {
        el.scrollLeft += x;
        el.scrollTop += y;
    }

    function clone(el) {
        var Polymer = window.Polymer;
        var $ = window.jQuery || window.Zepto;

        if (Polymer && Polymer.dom) {
            return Polymer.dom(el).cloneNode(true);
        } else if ($) {
            return $(el).clone(true)[0];
        } else {
            return el.cloneNode(true);
        }
    }

    var expando = 'Sortable' + new Date().getTime();

    function AnimationStateManager() {
        var animationStates = [],
            animationCallbackId;
        return {
            captureAnimationState: function captureAnimationState() {
                animationStates = [];
                if (!this.options.animation) return;
                var children = [].slice.call(this.el.children);
                children.forEach(function(child) {
                    if (css(child, 'display') === 'none' || child === Sortable.ghost) return;
                    animationStates.push({
                        target: child,
                        rect: getRect(child)
                    });

                    var fromRect = _objectSpread(
                        {},
                        animationStates[animationStates.length - 1].rect
                    ); // If animating: compensate for current animation

                    if (child.thisAnimationDuration) {
                        var childMatrix = matrix(child, true);

                        if (childMatrix) {
                            fromRect.top -= childMatrix.f;
                            fromRect.left -= childMatrix.e;
                        }
                    }

                    child.fromRect = fromRect;
                });
            },
            addAnimationState: function addAnimationState(state) {
                animationStates.push(state);
            },
            removeAnimationState: function removeAnimationState(target) {
                animationStates.splice(
                    indexOfObject(animationStates, {
                        target: target
                    }),
                    1
                );
            },
            animateAll: function animateAll(callback) {
                var _this = this;

                if (!this.options.animation) {
                    clearTimeout(animationCallbackId);
                    if (typeof callback === 'function') callback();
                    return;
                }

                var animating = false,
                    animationTime = 0;
                animationStates.forEach(function(state) {
                    var time = 0,
                        target = state.target,
                        fromRect = target.fromRect,
                        toRect = getRect(target),
                        prevFromRect = target.prevFromRect,
                        prevToRect = target.prevToRect,
                        animatingRect = state.rect,
                        targetMatrix = matrix(target, true);

                    if (targetMatrix) {
                        // Compensate for current animation
                        toRect.top -= targetMatrix.f;
                        toRect.left -= targetMatrix.e;
                    }

                    target.toRect = toRect;

                    if (target.thisAnimationDuration) {
                        // Could also check if animatingRect is between fromRect and toRect
                        if (
                            isRectEqual(prevFromRect, toRect) &&
                            !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
                            (animatingRect.top - toRect.top) /
                                (animatingRect.left - toRect.left) ===
                                (fromRect.top - toRect.top) / (fromRect.left - toRect.left)
                        ) {
                            // If returning to same place as started from animation and on same axis
                            time = calculateRealTime(
                                animatingRect,
                                prevFromRect,
                                prevToRect,
                                _this.options
                            );
                        }
                    } // if fromRect != toRect: animate

                    if (!isRectEqual(toRect, fromRect)) {
                        target.prevFromRect = fromRect;
                        target.prevToRect = toRect;

                        if (!time) {
                            time = _this.options.animation;
                        }

                        _this.animate(target, animatingRect, toRect, time);
                    }

                    if (time) {
                        animating = true;
                        animationTime = Math.max(animationTime, time);
                        clearTimeout(target.animationResetTimer);
                        target.animationResetTimer = setTimeout(function() {
                            target.animationTime = 0;
                            target.prevFromRect = null;
                            target.fromRect = null;
                            target.prevToRect = null;
                            target.thisAnimationDuration = null;
                        }, time);
                        target.thisAnimationDuration = time;
                    }
                });
                clearTimeout(animationCallbackId);

                if (!animating) {
                    if (typeof callback === 'function') callback();
                } else {
                    animationCallbackId = setTimeout(function() {
                        if (typeof callback === 'function') callback();
                    }, animationTime);
                }

                animationStates = [];
            },
            animate: function animate(target, currentRect, toRect, duration) {
                if (duration) {
                    css(target, 'transition', '');
                    css(target, 'transform', '');
                    var elMatrix = matrix(this.el),
                        scaleX = elMatrix && elMatrix.a,
                        scaleY = elMatrix && elMatrix.d,
                        translateX = (currentRect.left - toRect.left) / (scaleX || 1),
                        translateY = (currentRect.top - toRect.top) / (scaleY || 1);
                    target.animatingX = !!translateX;
                    target.animatingY = !!translateY;
                    css(
                        target,
                        'transform',
                        'translate3d(' + translateX + 'px,' + translateY + 'px,0)'
                    );
                    repaint(target); // repaint

                    css(
                        target,
                        'transition',
                        'transform ' +
                            duration +
                            'ms' +
                            (this.options.easing ? ' ' + this.options.easing : '')
                    );
                    css(target, 'transform', 'translate3d(0,0,0)');
                    typeof target.animated === 'number' && clearTimeout(target.animated);
                    target.animated = setTimeout(function() {
                        css(target, 'transition', '');
                        css(target, 'transform', '');
                        target.animated = false;
                        target.animatingX = false;
                        target.animatingY = false;
                    }, duration);
                }
            }
        };
    }

    function repaint(target) {
        return target.offsetWidth;
    }

    function calculateRealTime(animatingRect, fromRect, toRect, options) {
        return (
            (Math.sqrt(
                Math.pow(fromRect.top - animatingRect.top, 2) +
                    Math.pow(fromRect.left - animatingRect.left, 2)
            ) /
                Math.sqrt(
                    Math.pow(fromRect.top - toRect.top, 2) +
                        Math.pow(fromRect.left - toRect.left, 2)
                )) *
            options.animation
        );
    }

    var plugins = [];
    var defaults = {
        initializeByDefault: true
    };
    var PluginManager = {
        mount: function mount(plugin) {
            // Set default static properties
            for (var option in defaults) {
                if (defaults.hasOwnProperty(option) && !(option in plugin)) {
                    plugin[option] = defaults[option];
                }
            }

            plugins.push(plugin);
        },
        pluginEvent: function pluginEvent(eventName, sortable, evt) {
            var _this = this;

            this.eventCanceled = false;

            evt.cancel = function() {
                _this.eventCanceled = true;
            };

            var eventNameGlobal = eventName + 'Global';
            plugins.forEach(function(plugin) {
                if (!sortable[plugin.pluginName]) return; // Fire global events if it exists in this sortable

                if (sortable[plugin.pluginName][eventNameGlobal]) {
                    sortable[plugin.pluginName][eventNameGlobal](
                        _objectSpread(
                            {
                                sortable: sortable
                            },
                            evt
                        )
                    );
                } // Only fire plugin event if plugin is enabled in this sortable,
                // and plugin has event defined

                if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
                    sortable[plugin.pluginName][eventName](
                        _objectSpread(
                            {
                                sortable: sortable
                            },
                            evt
                        )
                    );
                }
            });
        },
        initializePlugins: function initializePlugins(sortable, el, defaults, options) {
            plugins.forEach(function(plugin) {
                var pluginName = plugin.pluginName;
                if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
                var initialized = new plugin(sortable, el, sortable.options);
                initialized.sortable = sortable;
                initialized.options = sortable.options;
                sortable[pluginName] = initialized; // Add default options from plugin

                _extends(defaults, initialized.defaults);
            });

            for (var option in sortable.options) {
                if (!sortable.options.hasOwnProperty(option)) continue;
                var modified = this.modifyOption(sortable, option, sortable.options[option]);

                if (typeof modified !== 'undefined') {
                    sortable.options[option] = modified;
                }
            }
        },
        getEventProperties: function getEventProperties(name, sortable) {
            var eventProperties = {};
            plugins.forEach(function(plugin) {
                if (typeof plugin.eventProperties !== 'function') return;

                _extends(
                    eventProperties,
                    plugin.eventProperties.call(sortable[plugin.pluginName], name)
                );
            });
            return eventProperties;
        },
        modifyOption: function modifyOption(sortable, name, value) {
            var modifiedValue;
            plugins.forEach(function(plugin) {
                // Plugin must exist on the Sortable
                if (!sortable[plugin.pluginName]) return; // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin

                if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
                    modifiedValue = plugin.optionListeners[name].call(
                        sortable[plugin.pluginName],
                        value
                    );
                }
            });
            return modifiedValue;
        }
    };

    function dispatchEvent(_ref) {
        var sortable = _ref.sortable,
            rootEl = _ref.rootEl,
            name = _ref.name,
            targetEl = _ref.targetEl,
            cloneEl = _ref.cloneEl,
            toEl = _ref.toEl,
            fromEl = _ref.fromEl,
            oldIndex = _ref.oldIndex,
            newIndex = _ref.newIndex,
            oldDraggableIndex = _ref.oldDraggableIndex,
            newDraggableIndex = _ref.newDraggableIndex,
            originalEvent = _ref.originalEvent,
            putSortable = _ref.putSortable,
            extraEventProperties = _ref.extraEventProperties;
        sortable = sortable || (rootEl && rootEl[expando]);
        if (!sortable) return;
        var evt,
            options = sortable.options,
            onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1); // Support for new CustomEvent feature

        if (window.CustomEvent && !IE11OrLess && !Edge) {
            evt = new CustomEvent(name, {
                bubbles: true,
                cancelable: true
            });
        } else {
            evt = document.createEvent('Event');
            evt.initEvent(name, true, true);
        }

        evt.to = toEl || rootEl;
        evt.from = fromEl || rootEl;
        evt.item = targetEl || rootEl;
        evt.clone = cloneEl;
        evt.oldIndex = oldIndex;
        evt.newIndex = newIndex;
        evt.oldDraggableIndex = oldDraggableIndex;
        evt.newDraggableIndex = newDraggableIndex;
        evt.originalEvent = originalEvent;
        evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;

        var allEventProperties = _objectSpread(
            {},
            extraEventProperties,
            PluginManager.getEventProperties(name, sortable)
        );

        for (var option in allEventProperties) {
            evt[option] = allEventProperties[option];
        }

        if (rootEl) {
            rootEl.dispatchEvent(evt);
        }

        if (options[onName]) {
            options[onName].call(sortable, evt);
        }
    }

    var pluginEvent = function pluginEvent(eventName, sortable) {
        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            originalEvent = _ref.evt,
            data = _objectWithoutProperties(_ref, ['evt']);

        PluginManager.pluginEvent.bind(Sortable)(
            eventName,
            sortable,
            _objectSpread(
                {
                    dragEl: dragEl,
                    parentEl: parentEl,
                    ghostEl: ghostEl,
                    rootEl: rootEl,
                    nextEl: nextEl,
                    lastDownEl: lastDownEl,
                    cloneEl: cloneEl,
                    cloneHidden: cloneHidden,
                    dragStarted: moved,
                    putSortable: putSortable,
                    activeSortable: Sortable.active,
                    originalEvent: originalEvent,
                    oldIndex: oldIndex,
                    oldDraggableIndex: oldDraggableIndex,
                    newIndex: newIndex,
                    newDraggableIndex: newDraggableIndex,
                    hideGhostForTarget: _hideGhostForTarget,
                    unhideGhostForTarget: _unhideGhostForTarget,
                    cloneNowHidden: function cloneNowHidden() {
                        cloneHidden = true;
                    },
                    cloneNowShown: function cloneNowShown() {
                        cloneHidden = false;
                    },
                    dispatchSortableEvent: function dispatchSortableEvent(name) {
                        _dispatchEvent({
                            sortable: sortable,
                            name: name,
                            originalEvent: originalEvent
                        });
                    }
                },
                data
            )
        );
    };

    function _dispatchEvent(info) {
        dispatchEvent(
            _objectSpread(
                {
                    putSortable: putSortable,
                    cloneEl: cloneEl,
                    targetEl: dragEl,
                    rootEl: rootEl,
                    oldIndex: oldIndex,
                    oldDraggableIndex: oldDraggableIndex,
                    newIndex: newIndex,
                    newDraggableIndex: newDraggableIndex
                },
                info
            )
        );
    }

    var dragEl,
        parentEl,
        ghostEl,
        rootEl,
        nextEl,
        lastDownEl,
        cloneEl,
        cloneHidden,
        oldIndex,
        newIndex,
        oldDraggableIndex,
        newDraggableIndex,
        activeGroup,
        putSortable,
        awaitingDragStarted = false,
        ignoreNextClick = false,
        sortables = [],
        tapEvt,
        touchEvt,
        lastDx,
        lastDy,
        tapDistanceLeft,
        tapDistanceTop,
        moved,
        lastTarget,
        lastDirection,
        pastFirstInvertThresh = false,
        isCircumstantialInvert = false,
        targetMoveDistance,
        // For positioning ghost absolutely
        ghostRelativeParent,
        ghostRelativeParentInitialScroll = [],
        // (left, top)
        _silent = false,
        savedInputChecked = [];
    /** @const */

    var documentExists = typeof document !== 'undefined',
        PositionGhostAbsolutely = IOS,
        CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
        // This will not pass for IE9, because IE9 DnD only works on anchors
        supportDraggable =
            documentExists &&
            !ChromeForAndroid &&
            !IOS &&
            'draggable' in document.createElement('div'),
        supportCssPointerEvents = (function() {
            if (!documentExists) return; // false when <= IE11

            if (IE11OrLess) {
                return false;
            }

            var el = document.createElement('x');
            el.style.cssText = 'pointer-events:auto';
            return el.style.pointerEvents === 'auto';
        })(),
        _detectDirection = function _detectDirection(el, options) {
            var elCSS = css(el),
                elWidth =
                    parseInt(elCSS.width) -
                    parseInt(elCSS.paddingLeft) -
                    parseInt(elCSS.paddingRight) -
                    parseInt(elCSS.borderLeftWidth) -
                    parseInt(elCSS.borderRightWidth),
                child1 = getChild(el, 0, options),
                child2 = getChild(el, 1, options),
                firstChildCSS = child1 && css(child1),
                secondChildCSS = child2 && css(child2),
                firstChildWidth =
                    firstChildCSS &&
                    parseInt(firstChildCSS.marginLeft) +
                        parseInt(firstChildCSS.marginRight) +
                        getRect(child1).width,
                secondChildWidth =
                    secondChildCSS &&
                    parseInt(secondChildCSS.marginLeft) +
                        parseInt(secondChildCSS.marginRight) +
                        getRect(child2).width;

            if (elCSS.display === 'flex') {
                return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse'
                    ? 'vertical'
                    : 'horizontal';
            }

            if (elCSS.display === 'grid') {
                return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
            }

            if (child1 && firstChildCSS['float'] && firstChildCSS['float'] !== 'none') {
                var touchingSideChild2 = firstChildCSS['float'] === 'left' ? 'left' : 'right';
                return child2 &&
                    (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2)
                    ? 'vertical'
                    : 'horizontal';
            }

            return child1 &&
                (firstChildCSS.display === 'block' ||
                    firstChildCSS.display === 'flex' ||
                    firstChildCSS.display === 'table' ||
                    firstChildCSS.display === 'grid' ||
                    (firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none') ||
                    (child2 &&
                        elCSS[CSSFloatProperty] === 'none' &&
                        firstChildWidth + secondChildWidth > elWidth))
                ? 'vertical'
                : 'horizontal';
        },
        _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
            var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
                dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
                dragElOppLength = vertical ? dragRect.width : dragRect.height,
                targetS1Opp = vertical ? targetRect.left : targetRect.top,
                targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
                targetOppLength = vertical ? targetRect.width : targetRect.height;
            return (
                dragElS1Opp === targetS1Opp ||
                dragElS2Opp === targetS2Opp ||
                dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2
            );
        },
        /**
         * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
         * @param  {Number} x      X position
         * @param  {Number} y      Y position
         * @return {HTMLElement}   Element of the first found nearest Sortable
         */
        _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
            var ret;
            sortables.some(function(sortable) {
                if (lastChild(sortable)) return;
                var rect = getRect(sortable),
                    threshold = sortable[expando].options.emptyInsertThreshold,
                    insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
                    insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

                if (threshold && insideHorizontally && insideVertically) {
                    return (ret = sortable);
                }
            });
            return ret;
        },
        _prepareGroup = function _prepareGroup(options) {
            function toFn(value, pull) {
                return function(to, from, dragEl, evt) {
                    var sameGroup =
                        to.options.group.name &&
                        from.options.group.name &&
                        to.options.group.name === from.options.group.name;

                    if (value == null && (pull || sameGroup)) {
                        // Default pull value
                        // Default pull and put value if same group
                        return true;
                    } else if (value == null || value === false) {
                        return false;
                    } else if (pull && value === 'clone') {
                        return value;
                    } else if (typeof value === 'function') {
                        return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
                    } else {
                        var otherGroup = (pull ? to : from).options.group.name;
                        return (
                            value === true ||
                            (typeof value === 'string' && value === otherGroup) ||
                            (value.join && value.indexOf(otherGroup) > -1)
                        );
                    }
                };
            }

            var group = {};
            var originalGroup = options.group;

            if (!originalGroup || _typeof(originalGroup) != 'object') {
                originalGroup = {
                    name: originalGroup
                };
            }

            group.name = originalGroup.name;
            group.checkPull = toFn(originalGroup.pull, true);
            group.checkPut = toFn(originalGroup.put);
            group.revertClone = originalGroup.revertClone;
            options.group = group;
        },
        _hideGhostForTarget = function _hideGhostForTarget() {
            if (!supportCssPointerEvents && ghostEl) {
                css(ghostEl, 'display', 'none');
            }
        },
        _unhideGhostForTarget = function _unhideGhostForTarget() {
            if (!supportCssPointerEvents && ghostEl) {
                css(ghostEl, 'display', '');
            }
        }; // #1184 fix - Prevent click event on fallback if dragged but item not changed position

    if (documentExists) {
        document.addEventListener(
            'click',
            function(evt) {
                if (ignoreNextClick) {
                    evt.preventDefault();
                    evt.stopPropagation && evt.stopPropagation();
                    evt.stopImmediatePropagation && evt.stopImmediatePropagation();
                    ignoreNextClick = false;
                    return false;
                }
            },
            true
        );
    }

    var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
        if (dragEl) {
            evt = evt.touches ? evt.touches[0] : evt;

            var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);

            if (nearest) {
                // Create imitation event
                var event = {};

                for (var i in evt) {
                    if (evt.hasOwnProperty(i)) {
                        event[i] = evt[i];
                    }
                }

                event.target = event.rootEl = nearest;
                event.preventDefault = void 0;
                event.stopPropagation = void 0;

                nearest[expando]._onDragOver(event);
            }
        }
    };

    var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
        if (dragEl) {
            dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
        }
    };
    /**
     * @class  Sortable
     * @param  {HTMLElement}  el
     * @param  {Object}       [options]
     */

    function Sortable(el, options) {
        if (!(el && el.nodeType && el.nodeType === 1)) {
            throw 'Sortable: `el` must be an HTMLElement, not '.concat({}.toString.call(el));
        }

        this.el = el; // root element

        this.options = options = _extends({}, options); // Export instance

        el[expando] = this;
        var defaults = {
            group: null,
            sort: true,
            disabled: false,
            store: null,
            handle: null,
            draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
            swapThreshold: 1,
            // percentage; 0 <= x <= 1
            invertSwap: false,
            // invert always
            invertedSwapThreshold: null,
            // will be set to same as swapThreshold if default
            removeCloneOnHide: true,
            direction: function direction() {
                return _detectDirection(el, this.options);
            },
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            ignore: 'a, img',
            filter: null,
            preventOnFilter: true,
            animation: 0,
            easing: null,
            setData: function setData(dataTransfer, dragEl) {
                dataTransfer.setData('Text', dragEl.textContent);
            },
            dropBubble: false,
            dragoverBubble: false,
            dataIdAttr: 'data-id',
            delay: 0,
            delayOnTouchOnly: false,
            touchStartThreshold:
                (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
            forceFallback: false,
            fallbackClass: 'sortable-fallback',
            fallbackOnBody: false,
            fallbackTolerance: 0,
            fallbackOffset: {
                x: 0,
                y: 0
            },
            supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window,
            emptyInsertThreshold: 5
        };
        PluginManager.initializePlugins(this, el, defaults); // Set default options

        for (var name in defaults) {
            !(name in options) && (options[name] = defaults[name]);
        }

        _prepareGroup(options); // Bind all private methods

        for (var fn in this) {
            if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
                this[fn] = this[fn].bind(this);
            }
        } // Setup drag mode

        this.nativeDraggable = options.forceFallback ? false : supportDraggable;

        if (this.nativeDraggable) {
            // Touch start threshold cannot be greater than the native dragstart threshold
            this.options.touchStartThreshold = 1;
        } // Bind events

        if (options.supportPointer) {
            on(el, 'pointerdown', this._onTapStart);
        } else {
            on(el, 'mousedown', this._onTapStart);
            on(el, 'touchstart', this._onTapStart);
        }

        if (this.nativeDraggable) {
            on(el, 'dragover', this);
            on(el, 'dragenter', this);
        }

        sortables.push(this.el); // Restore sorting

        options.store && options.store.get && this.sort(options.store.get(this) || []); // Add animation state manager

        _extends(this, AnimationStateManager());
    }

    Sortable.prototype =
        /** @lends Sortable.prototype */
        {
            constructor: Sortable,
            _isOutsideThisEl: function _isOutsideThisEl(target) {
                if (!this.el.contains(target) && target !== this.el) {
                    lastTarget = null;
                }
            },
            _getDirection: function _getDirection(evt, target) {
                return typeof this.options.direction === 'function'
                    ? this.options.direction.call(this, evt, target, dragEl)
                    : this.options.direction;
            },
            _onTapStart: function _onTapStart(
                /** Event|TouchEvent */
                evt
            ) {
                if (!evt.cancelable) return;

                var _this = this,
                    el = this.el,
                    options = this.options,
                    preventOnFilter = options.preventOnFilter,
                    type = evt.type,
                    touch =
                        (evt.touches && evt.touches[0]) ||
                        (evt.pointerType && evt.pointerType === 'touch' && evt),
                    target = (touch || evt).target,
                    originalTarget =
                        (evt.target.shadowRoot &&
                            ((evt.path && evt.path[0]) ||
                                (evt.composedPath && evt.composedPath()[0]))) ||
                        target,
                    filter = options.filter;

                _saveInputCheckedState(el); // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.

                if (dragEl) {
                    return;
                }

                if ((/mousedown|pointerdown/.test(type) && evt.button !== 0) || options.disabled) {
                    return; // only left button and enabled
                } // cancel dnd if original target is content editable

                if (originalTarget.isContentEditable) {
                    return;
                }

                target = closest(target, options.draggable, el, false);

                if (target && target.animated) {
                    return;
                }

                if (lastDownEl === target) {
                    // Ignoring duplicate `down`
                    return;
                } // Get the index of the dragged element within its parent

                oldIndex = index(target);
                oldDraggableIndex = index(target, options.draggable); // Check filter

                if (typeof filter === 'function') {
                    if (filter.call(this, evt, target, this)) {
                        _dispatchEvent({
                            sortable: _this,
                            rootEl: originalTarget,
                            name: 'filter',
                            targetEl: target,
                            toEl: el,
                            fromEl: el
                        });

                        pluginEvent('filter', _this, {
                            evt: evt
                        });
                        preventOnFilter && evt.cancelable && evt.preventDefault();
                        return; // cancel dnd
                    }
                } else if (filter) {
                    filter = filter.split(',').some(function(criteria) {
                        criteria = closest(originalTarget, criteria.trim(), el, false);

                        if (criteria) {
                            _dispatchEvent({
                                sortable: _this,
                                rootEl: criteria,
                                name: 'filter',
                                targetEl: target,
                                fromEl: el,
                                toEl: el
                            });

                            pluginEvent('filter', _this, {
                                evt: evt
                            });
                            return true;
                        }
                    });

                    if (filter) {
                        preventOnFilter && evt.cancelable && evt.preventDefault();
                        return; // cancel dnd
                    }
                }

                if (options.handle && !closest(originalTarget, options.handle, el, false)) {
                    return;
                } // Prepare `dragstart`

                this._prepareDragStart(evt, touch, target);
            },
            _prepareDragStart: function _prepareDragStart(
                /** Event */
                evt,
                /** Touch */
                touch,
                /** HTMLElement */
                target
            ) {
                var _this = this,
                    el = _this.el,
                    options = _this.options,
                    ownerDocument = el.ownerDocument,
                    dragStartFn;

                if (target && !dragEl && target.parentNode === el) {
                    var dragRect = getRect(target);
                    rootEl = el;
                    dragEl = target;
                    parentEl = dragEl.parentNode;
                    nextEl = dragEl.nextSibling;
                    lastDownEl = target;
                    activeGroup = options.group;
                    Sortable.dragged = dragEl;
                    tapEvt = {
                        target: dragEl,
                        clientX: (touch || evt).clientX,
                        clientY: (touch || evt).clientY
                    };
                    tapDistanceLeft = tapEvt.clientX - dragRect.left;
                    tapDistanceTop = tapEvt.clientY - dragRect.top;
                    this._lastX = (touch || evt).clientX;
                    this._lastY = (touch || evt).clientY;
                    dragEl.style['will-change'] = 'all';

                    dragStartFn = function dragStartFn() {
                        pluginEvent('delayEnded', _this, {
                            evt: evt
                        });

                        if (Sortable.eventCanceled) {
                            _this._onDrop();

                            return;
                        } // Delayed drag has been triggered
                        // we can re-enable the events: touchmove/mousemove

                        _this._disableDelayedDragEvents();

                        if (!FireFox && _this.nativeDraggable) {
                            dragEl.draggable = true;
                        } // Bind the events: dragstart/dragend

                        _this._triggerDragStart(evt, touch); // Drag start event

                        _dispatchEvent({
                            sortable: _this,
                            name: 'choose',
                            originalEvent: evt
                        }); // Chosen item

                        toggleClass(dragEl, options.chosenClass, true);
                    }; // Disable "draggable"

                    options.ignore.split(',').forEach(function(criteria) {
                        find(dragEl, criteria.trim(), _disableDraggable);
                    });
                    on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
                    on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
                    on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
                    on(ownerDocument, 'mouseup', _this._onDrop);
                    on(ownerDocument, 'touchend', _this._onDrop);
                    on(ownerDocument, 'touchcancel', _this._onDrop); // Make dragEl draggable (must be before delay for FireFox)

                    if (FireFox && this.nativeDraggable) {
                        this.options.touchStartThreshold = 4;
                        dragEl.draggable = true;
                    }

                    pluginEvent('delayStart', this, {
                        evt: evt
                    }); // Delay is impossible for native DnD in Edge or IE

                    if (
                        options.delay &&
                        (!options.delayOnTouchOnly || touch) &&
                        (!this.nativeDraggable || !(Edge || IE11OrLess))
                    ) {
                        if (Sortable.eventCanceled) {
                            this._onDrop();

                            return;
                        } // If the user moves the pointer or let go the click or touch
                        // before the delay has been reached:
                        // disable the delayed drag

                        on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
                        on(ownerDocument, 'touchend', _this._disableDelayedDrag);
                        on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
                        on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
                        on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
                        options.supportPointer &&
                            on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
                        _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
                    } else {
                        dragStartFn();
                    }
                }
            },
            _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(
                /** TouchEvent|PointerEvent **/
                e
            ) {
                var touch = e.touches ? e.touches[0] : e;

                if (
                    Math.max(
                        Math.abs(touch.clientX - this._lastX),
                        Math.abs(touch.clientY - this._lastY)
                    ) >=
                    Math.floor(
                        this.options.touchStartThreshold /
                            ((this.nativeDraggable && window.devicePixelRatio) || 1)
                    )
                ) {
                    this._disableDelayedDrag();
                }
            },
            _disableDelayedDrag: function _disableDelayedDrag() {
                dragEl && _disableDraggable(dragEl);
                clearTimeout(this._dragStartTimer);

                this._disableDelayedDragEvents();
            },
            _disableDelayedDragEvents: function _disableDelayedDragEvents() {
                var ownerDocument = this.el.ownerDocument;
                off(ownerDocument, 'mouseup', this._disableDelayedDrag);
                off(ownerDocument, 'touchend', this._disableDelayedDrag);
                off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
                off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
                off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
                off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
            },
            _triggerDragStart: function _triggerDragStart(
                /** Event */
                evt,
                /** Touch */
                touch
            ) {
                touch = touch || (evt.pointerType == 'touch' && evt);

                if (!this.nativeDraggable || touch) {
                    if (this.options.supportPointer) {
                        on(document, 'pointermove', this._onTouchMove);
                    } else if (touch) {
                        on(document, 'touchmove', this._onTouchMove);
                    } else {
                        on(document, 'mousemove', this._onTouchMove);
                    }
                } else {
                    on(dragEl, 'dragend', this);
                    on(rootEl, 'dragstart', this._onDragStart);
                }

                try {
                    if (document.selection) {
                        // Timeout neccessary for IE9
                        _nextTick(function() {
                            document.selection.empty();
                        });
                    } else {
                        window.getSelection().removeAllRanges();
                    }
                } catch (err) {}
            },
            _dragStarted: function _dragStarted(fallback, evt) {
                awaitingDragStarted = false;

                if (rootEl && dragEl) {
                    pluginEvent('dragStarted', this, {
                        evt: evt
                    });

                    if (this.nativeDraggable) {
                        on(document, 'dragover', _checkOutsideTargetEl);
                    }

                    var options = this.options; // Apply effect

                    !fallback && toggleClass(dragEl, options.dragClass, false);
                    toggleClass(dragEl, options.ghostClass, true);
                    Sortable.active = this;
                    fallback && this._appendGhost(); // Drag start event

                    _dispatchEvent({
                        sortable: this,
                        name: 'start',
                        originalEvent: evt
                    });
                } else {
                    this._nulling();
                }
            },
            _emulateDragOver: function _emulateDragOver() {
                if (touchEvt) {
                    this._lastX = touchEvt.clientX;
                    this._lastY = touchEvt.clientY;

                    _hideGhostForTarget();

                    var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
                    var parent = target;

                    while (target && target.shadowRoot) {
                        target = target.shadowRoot.elementFromPoint(
                            touchEvt.clientX,
                            touchEvt.clientY
                        );
                        if (target === parent) break;
                        parent = target;
                    }

                    dragEl.parentNode[expando]._isOutsideThisEl(target);

                    if (parent) {
                        do {
                            if (parent[expando]) {
                                var inserted = void 0;
                                inserted = parent[expando]._onDragOver({
                                    clientX: touchEvt.clientX,
                                    clientY: touchEvt.clientY,
                                    target: target,
                                    rootEl: parent
                                });

                                if (inserted && !this.options.dragoverBubble) {
                                    break;
                                }
                            }

                            target = parent; // store last element
                        } while (
                            /* jshint boss:true */
                            (parent = parent.parentNode)
                        );
                    }

                    _unhideGhostForTarget();
                }
            },
            _onTouchMove: function _onTouchMove(
                /**TouchEvent*/
                evt
            ) {
                if (tapEvt) {
                    var options = this.options,
                        fallbackTolerance = options.fallbackTolerance,
                        fallbackOffset = options.fallbackOffset,
                        touch = evt.touches ? evt.touches[0] : evt,
                        ghostMatrix = ghostEl && matrix(ghostEl, true),
                        scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
                        scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
                        relativeScrollOffset =
                            PositionGhostAbsolutely &&
                            ghostRelativeParent &&
                            getRelativeScrollOffset(ghostRelativeParent),
                        dx =
                            (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) +
                            (relativeScrollOffset
                                ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0]
                                : 0) /
                                (scaleX || 1),
                        dy =
                            (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) +
                            (relativeScrollOffset
                                ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1]
                                : 0) /
                                (scaleY || 1); // only set the status to dragging, when we are actually dragging

                    if (!Sortable.active && !awaitingDragStarted) {
                        if (
                            fallbackTolerance &&
                            Math.max(
                                Math.abs(touch.clientX - this._lastX),
                                Math.abs(touch.clientY - this._lastY)
                            ) < fallbackTolerance
                        ) {
                            return;
                        }

                        this._onDragStart(evt, true);
                    }

                    if (ghostEl) {
                        if (ghostMatrix) {
                            ghostMatrix.e += dx - (lastDx || 0);
                            ghostMatrix.f += dy - (lastDy || 0);
                        } else {
                            ghostMatrix = {
                                a: 1,
                                b: 0,
                                c: 0,
                                d: 1,
                                e: dx,
                                f: dy
                            };
                        }

                        var cssMatrix = 'matrix('
                            .concat(ghostMatrix.a, ',')
                            .concat(ghostMatrix.b, ',')
                            .concat(ghostMatrix.c, ',')
                            .concat(ghostMatrix.d, ',')
                            .concat(ghostMatrix.e, ',')
                            .concat(ghostMatrix.f, ')');
                        css(ghostEl, 'webkitTransform', cssMatrix);
                        css(ghostEl, 'mozTransform', cssMatrix);
                        css(ghostEl, 'msTransform', cssMatrix);
                        css(ghostEl, 'transform', cssMatrix);
                        lastDx = dx;
                        lastDy = dy;
                        touchEvt = touch;
                    }

                    evt.cancelable && evt.preventDefault();
                }
            },
            _appendGhost: function _appendGhost() {
                // Bug if using scale(): https://stackoverflow.com/questions/2637058
                // Not being adjusted for
                if (!ghostEl) {
                    var container = this.options.fallbackOnBody ? document.body : rootEl,
                        rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
                        options = this.options; // Position absolutely

                    if (PositionGhostAbsolutely) {
                        // Get relatively positioned parent
                        ghostRelativeParent = container;

                        while (
                            css(ghostRelativeParent, 'position') === 'static' &&
                            css(ghostRelativeParent, 'transform') === 'none' &&
                            ghostRelativeParent !== document
                        ) {
                            ghostRelativeParent = ghostRelativeParent.parentNode;
                        }

                        if (
                            ghostRelativeParent !== document.body &&
                            ghostRelativeParent !== document.documentElement
                        ) {
                            if (ghostRelativeParent === document)
                                ghostRelativeParent = getWindowScrollingElement();
                            rect.top += ghostRelativeParent.scrollTop;
                            rect.left += ghostRelativeParent.scrollLeft;
                        } else {
                            ghostRelativeParent = getWindowScrollingElement();
                        }

                        ghostRelativeParentInitialScroll = getRelativeScrollOffset(
                            ghostRelativeParent
                        );
                    }

                    ghostEl = dragEl.cloneNode(true);
                    toggleClass(ghostEl, options.ghostClass, false);
                    toggleClass(ghostEl, options.fallbackClass, true);
                    toggleClass(ghostEl, options.dragClass, true);
                    css(ghostEl, 'transition', '');
                    css(ghostEl, 'transform', '');
                    css(ghostEl, 'box-sizing', 'border-box');
                    css(ghostEl, 'margin', 0);
                    css(ghostEl, 'top', rect.top);
                    css(ghostEl, 'left', rect.left);
                    css(ghostEl, 'width', rect.width);
                    css(ghostEl, 'height', rect.height);
                    css(ghostEl, 'opacity', '0.8');
                    css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
                    css(ghostEl, 'zIndex', '100000');
                    css(ghostEl, 'pointerEvents', 'none');
                    Sortable.ghost = ghostEl;
                    container.appendChild(ghostEl); // Set transform-origin

                    css(
                        ghostEl,
                        'transform-origin',
                        (tapDistanceLeft / parseInt(ghostEl.style.width)) * 100 +
                            '% ' +
                            (tapDistanceTop / parseInt(ghostEl.style.height)) * 100 +
                            '%'
                    );
                }
            },
            _onDragStart: function _onDragStart(
                /**Event*/
                evt,
                /**boolean*/
                fallback
            ) {
                var _this = this;

                var dataTransfer = evt.dataTransfer;
                var options = _this.options;
                pluginEvent('dragStart', this, {
                    evt: evt
                });

                if (Sortable.eventCanceled) {
                    this._onDrop();

                    return;
                }

                pluginEvent('setupClone', this);

                if (!Sortable.eventCanceled) {
                    cloneEl = clone(dragEl);
                    cloneEl.draggable = false;
                    cloneEl.style['will-change'] = '';

                    this._hideClone();

                    toggleClass(cloneEl, this.options.chosenClass, false);
                    Sortable.clone = cloneEl;
                } // #1143: IFrame support workaround

                _this.cloneId = _nextTick(function() {
                    pluginEvent('clone', _this);
                    if (Sortable.eventCanceled) return;

                    if (!_this.options.removeCloneOnHide) {
                        rootEl.insertBefore(cloneEl, dragEl);
                    }

                    _this._hideClone();

                    _dispatchEvent({
                        sortable: _this,
                        name: 'clone'
                    });
                });
                !fallback && toggleClass(dragEl, options.dragClass, true); // Set proper drop events

                if (fallback) {
                    ignoreNextClick = true;
                    _this._loopId = setInterval(_this._emulateDragOver, 50);
                } else {
                    // Undo what was set in _prepareDragStart before drag started
                    off(document, 'mouseup', _this._onDrop);
                    off(document, 'touchend', _this._onDrop);
                    off(document, 'touchcancel', _this._onDrop);

                    if (dataTransfer) {
                        dataTransfer.effectAllowed = 'move';
                        options.setData && options.setData.call(_this, dataTransfer, dragEl);
                    }

                    on(document, 'drop', _this); // #1276 fix:

                    css(dragEl, 'transform', 'translateZ(0)');
                }

                awaitingDragStarted = true;
                _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
                on(document, 'selectstart', _this);
                moved = true;

                if (Safari) {
                    css(document.body, 'user-select', 'none');
                }
            },
            // Returns true - if no further action is needed (either inserted or another condition)
            _onDragOver: function _onDragOver(
                /**Event*/
                evt
            ) {
                var el = this.el,
                    target = evt.target,
                    dragRect,
                    targetRect,
                    revert,
                    options = this.options,
                    group = options.group,
                    activeSortable = Sortable.active,
                    isOwner = activeGroup === group,
                    canSort = options.sort,
                    fromSortable = putSortable || activeSortable,
                    vertical,
                    _this = this,
                    completedFired = false;

                if (_silent) return;

                function dragOverEvent(name, extra) {
                    pluginEvent(
                        name,
                        _this,
                        _objectSpread(
                            {
                                evt: evt,
                                isOwner: isOwner,
                                axis: vertical ? 'vertical' : 'horizontal',
                                revert: revert,
                                dragRect: dragRect,
                                targetRect: targetRect,
                                canSort: canSort,
                                fromSortable: fromSortable,
                                target: target,
                                completed: completed,
                                onMove: function onMove(target, after) {
                                    return _onMove(
                                        rootEl,
                                        el,
                                        dragEl,
                                        dragRect,
                                        target,
                                        getRect(target),
                                        evt,
                                        after
                                    );
                                },
                                changed: changed
                            },
                            extra
                        )
                    );
                } // Capture animation state

                function capture() {
                    dragOverEvent('dragOverAnimationCapture');

                    _this.captureAnimationState();

                    if (_this !== fromSortable) {
                        fromSortable.captureAnimationState();
                    }
                } // Return invocation when dragEl is inserted (or completed)

                function completed(insertion) {
                    dragOverEvent('dragOverCompleted', {
                        insertion: insertion
                    });

                    if (insertion) {
                        // Clones must be hidden before folding animation to capture dragRectAbsolute properly
                        if (isOwner) {
                            activeSortable._hideClone();
                        } else {
                            activeSortable._showClone(_this);
                        }

                        if (_this !== fromSortable) {
                            // Set ghost class to new sortable's ghost class
                            toggleClass(
                                dragEl,
                                putSortable
                                    ? putSortable.options.ghostClass
                                    : activeSortable.options.ghostClass,
                                false
                            );
                            toggleClass(dragEl, options.ghostClass, true);
                        }

                        if (putSortable !== _this && _this !== Sortable.active) {
                            putSortable = _this;
                        } else if (_this === Sortable.active && putSortable) {
                            putSortable = null;
                        } // Animation

                        if (fromSortable === _this) {
                            _this._ignoreWhileAnimating = target;
                        }

                        _this.animateAll(function() {
                            dragOverEvent('dragOverAnimationComplete');
                            _this._ignoreWhileAnimating = null;
                        });

                        if (_this !== fromSortable) {
                            fromSortable.animateAll();
                            fromSortable._ignoreWhileAnimating = null;
                        }
                    } // Null lastTarget if it is not inside a previously swapped element

                    if (
                        (target === dragEl && !dragEl.animated) ||
                        (target === el && !target.animated)
                    ) {
                        lastTarget = null;
                    } // no bubbling and not fallback

                    if (!options.dragoverBubble && !evt.rootEl && target !== document) {
                        dragEl.parentNode[expando]._isOutsideThisEl(evt.target); // Do not detect for empty insert if already inserted

                        !insertion && nearestEmptyInsertDetectEvent(evt);
                    }

                    !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
                    return (completedFired = true);
                } // Call when dragEl has been inserted

                function changed() {
                    newIndex = index(dragEl);
                    newDraggableIndex = index(dragEl, options.draggable);

                    _dispatchEvent({
                        sortable: _this,
                        name: 'change',
                        toEl: el,
                        newIndex: newIndex,
                        newDraggableIndex: newDraggableIndex,
                        originalEvent: evt
                    });
                }

                if (evt.preventDefault !== void 0) {
                    evt.cancelable && evt.preventDefault();
                }

                target = closest(target, options.draggable, el, true);
                dragOverEvent('dragOver');
                if (Sortable.eventCanceled) return completedFired;

                if (
                    dragEl.contains(evt.target) ||
                    (target.animated && target.animatingX && target.animatingY) ||
                    _this._ignoreWhileAnimating === target
                ) {
                    return completed(false);
                }

                ignoreNextClick = false;

                if (
                    activeSortable &&
                    !options.disabled &&
                    (isOwner
                        ? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
                        : putSortable === this ||
                          ((this.lastPutMode = activeGroup.checkPull(
                              this,
                              activeSortable,
                              dragEl,
                              evt
                          )) &&
                              group.checkPut(this, activeSortable, dragEl, evt)))
                ) {
                    vertical = this._getDirection(evt, target) === 'vertical';
                    dragRect = getRect(dragEl);
                    dragOverEvent('dragOverValid');
                    if (Sortable.eventCanceled) return completedFired;

                    if (revert) {
                        parentEl = rootEl; // actualization

                        capture();

                        this._hideClone();

                        dragOverEvent('revert');

                        if (!Sortable.eventCanceled) {
                            if (nextEl) {
                                rootEl.insertBefore(dragEl, nextEl);
                            } else {
                                rootEl.appendChild(dragEl);
                            }
                        }

                        return completed(true);
                    }

                    var elLastChild = lastChild(el, options.draggable);

                    if (
                        !elLastChild ||
                        (_ghostIsLast(evt, vertical, this) && !elLastChild.animated)
                    ) {
                        // If already at end of list: Do not insert
                        if (elLastChild === dragEl) {
                            return completed(false);
                        } // assign target only if condition is true

                        if (elLastChild && el === evt.target) {
                            target = elLastChild;
                        }

                        if (target) {
                            targetRect = getRect(target);
                        }

                        if (
                            _onMove(
                                rootEl,
                                el,
                                dragEl,
                                dragRect,
                                target,
                                targetRect,
                                evt,
                                !!target
                            ) !== false
                        ) {
                            capture();
                            el.appendChild(dragEl);
                            parentEl = el; // actualization

                            changed();
                            return completed(true);
                        }
                    } else if (target.parentNode === el) {
                        targetRect = getRect(target);
                        var direction = 0,
                            targetBeforeFirstSwap,
                            differentLevel = dragEl.parentNode !== el,
                            differentRowCol = !_dragElInRowColumn(
                                (dragEl.animated && dragEl.toRect) || dragRect,
                                (target.animated && target.toRect) || targetRect,
                                vertical
                            ),
                            side1 = vertical ? 'top' : 'left',
                            scrolledPastTop =
                                isScrolledPast(target, 'top', 'top') ||
                                isScrolledPast(dragEl, 'top', 'top'),
                            scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;

                        if (lastTarget !== target) {
                            targetBeforeFirstSwap = targetRect[side1];
                            pastFirstInvertThresh = false;
                            isCircumstantialInvert =
                                (!differentRowCol && options.invertSwap) || differentLevel;
                        }

                        direction = _getSwapDirection(
                            evt,
                            target,
                            targetRect,
                            vertical,
                            differentRowCol ? 1 : options.swapThreshold,
                            options.invertedSwapThreshold == null
                                ? options.swapThreshold
                                : options.invertedSwapThreshold,
                            isCircumstantialInvert,
                            lastTarget === target
                        );
                        var sibling;

                        if (direction !== 0) {
                            // Check if target is beside dragEl in respective direction (ignoring hidden elements)
                            var dragIndex = index(dragEl);

                            do {
                                dragIndex -= direction;
                                sibling = parentEl.children[dragIndex];
                            } while (
                                sibling &&
                                (css(sibling, 'display') === 'none' || sibling === ghostEl)
                            );
                        } // If dragEl is already beside target: Do not insert

                        if (direction === 0 || sibling === target) {
                            return completed(false);
                        }

                        lastTarget = target;
                        lastDirection = direction;
                        var nextSibling = target.nextElementSibling,
                            after = false;
                        after = direction === 1;

                        var moveVector = _onMove(
                            rootEl,
                            el,
                            dragEl,
                            dragRect,
                            target,
                            targetRect,
                            evt,
                            after
                        );

                        if (moveVector !== false) {
                            if (moveVector === 1 || moveVector === -1) {
                                after = moveVector === 1;
                            }

                            _silent = true;
                            setTimeout(_unsilent, 30);
                            capture();

                            if (after && !nextSibling) {
                                el.appendChild(dragEl);
                            } else {
                                target.parentNode.insertBefore(
                                    dragEl,
                                    after ? nextSibling : target
                                );
                            } // Undo chrome's scroll adjustment (has no effect on other browsers)

                            if (scrolledPastTop) {
                                scrollBy(
                                    scrolledPastTop,
                                    0,
                                    scrollBefore - scrolledPastTop.scrollTop
                                );
                            }

                            parentEl = dragEl.parentNode; // actualization
                            // must be done before animation

                            if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
                                targetMoveDistance = Math.abs(
                                    targetBeforeFirstSwap - getRect(target)[side1]
                                );
                            }

                            changed();
                            return completed(true);
                        }
                    }

                    if (el.contains(dragEl)) {
                        return completed(false);
                    }
                }

                return false;
            },
            _ignoreWhileAnimating: null,
            _offMoveEvents: function _offMoveEvents() {
                off(document, 'mousemove', this._onTouchMove);
                off(document, 'touchmove', this._onTouchMove);
                off(document, 'pointermove', this._onTouchMove);
                off(document, 'dragover', nearestEmptyInsertDetectEvent);
                off(document, 'mousemove', nearestEmptyInsertDetectEvent);
                off(document, 'touchmove', nearestEmptyInsertDetectEvent);
            },
            _offUpEvents: function _offUpEvents() {
                var ownerDocument = this.el.ownerDocument;
                off(ownerDocument, 'mouseup', this._onDrop);
                off(ownerDocument, 'touchend', this._onDrop);
                off(ownerDocument, 'pointerup', this._onDrop);
                off(ownerDocument, 'touchcancel', this._onDrop);
                off(document, 'selectstart', this);
            },
            _onDrop: function _onDrop(
                /**Event*/
                evt
            ) {
                var el = this.el,
                    options = this.options; // Get the index of the dragged element within its parent

                newIndex = index(dragEl);
                newDraggableIndex = index(dragEl, options.draggable);
                pluginEvent('drop', this, {
                    evt: evt
                });
                parentEl = dragEl && dragEl.parentNode; // Get again after plugin event

                newIndex = index(dragEl);
                newDraggableIndex = index(dragEl, options.draggable);

                if (Sortable.eventCanceled) {
                    this._nulling();

                    return;
                }

                awaitingDragStarted = false;
                isCircumstantialInvert = false;
                pastFirstInvertThresh = false;
                clearInterval(this._loopId);
                clearTimeout(this._dragStartTimer);

                _cancelNextTick(this.cloneId);

                _cancelNextTick(this._dragStartId); // Unbind events

                if (this.nativeDraggable) {
                    off(document, 'drop', this);
                    off(el, 'dragstart', this._onDragStart);
                }

                this._offMoveEvents();

                this._offUpEvents();

                if (Safari) {
                    css(document.body, 'user-select', '');
                }

                css(dragEl, 'transform', '');

                if (evt) {
                    if (moved) {
                        evt.cancelable && evt.preventDefault();
                        !options.dropBubble && evt.stopPropagation();
                    }

                    ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);

                    if (
                        rootEl === parentEl ||
                        (putSortable && putSortable.lastPutMode !== 'clone')
                    ) {
                        // Remove clone(s)
                        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
                    }

                    if (dragEl) {
                        if (this.nativeDraggable) {
                            off(dragEl, 'dragend', this);
                        }

                        _disableDraggable(dragEl);

                        dragEl.style['will-change'] = ''; // Remove classes
                        // ghostClass is added in dragStarted

                        if (moved && !awaitingDragStarted) {
                            toggleClass(
                                dragEl,
                                putSortable
                                    ? putSortable.options.ghostClass
                                    : this.options.ghostClass,
                                false
                            );
                        }

                        toggleClass(dragEl, this.options.chosenClass, false); // Drag stop event

                        _dispatchEvent({
                            sortable: this,
                            name: 'unchoose',
                            toEl: parentEl,
                            newIndex: null,
                            newDraggableIndex: null,
                            originalEvent: evt
                        });

                        if (rootEl !== parentEl) {
                            if (newIndex >= 0) {
                                // Add event
                                _dispatchEvent({
                                    rootEl: parentEl,
                                    name: 'add',
                                    toEl: parentEl,
                                    fromEl: rootEl,
                                    originalEvent: evt
                                }); // Remove event

                                _dispatchEvent({
                                    sortable: this,
                                    name: 'remove',
                                    toEl: parentEl,
                                    originalEvent: evt
                                }); // drag from one list and drop into another

                                _dispatchEvent({
                                    rootEl: parentEl,
                                    name: 'sort',
                                    toEl: parentEl,
                                    fromEl: rootEl,
                                    originalEvent: evt
                                });

                                _dispatchEvent({
                                    sortable: this,
                                    name: 'sort',
                                    toEl: parentEl,
                                    originalEvent: evt
                                });
                            }

                            putSortable && putSortable.save();
                        } else {
                            if (newIndex !== oldIndex) {
                                if (newIndex >= 0) {
                                    // drag & drop within the same list
                                    _dispatchEvent({
                                        sortable: this,
                                        name: 'update',
                                        toEl: parentEl,
                                        originalEvent: evt
                                    });

                                    _dispatchEvent({
                                        sortable: this,
                                        name: 'sort',
                                        toEl: parentEl,
                                        originalEvent: evt
                                    });
                                }
                            }
                        }

                        if (Sortable.active) {
                            /* jshint eqnull:true */
                            if (newIndex == null || newIndex === -1) {
                                newIndex = oldIndex;
                                newDraggableIndex = oldDraggableIndex;
                            }

                            _dispatchEvent({
                                sortable: this,
                                name: 'end',
                                toEl: parentEl,
                                originalEvent: evt
                            }); // Save sorting

                            this.save();
                        }
                    }
                }

                this._nulling();
            },
            _nulling: function _nulling() {
                pluginEvent('nulling', this);
                rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
                savedInputChecked.forEach(function(el) {
                    el.checked = true;
                });
                savedInputChecked.length = lastDx = lastDy = 0;
            },
            handleEvent: function handleEvent(
                /**Event*/
                evt
            ) {
                switch (evt.type) {
                    case 'drop':
                    case 'dragend':
                        this._onDrop(evt);

                        break;

                    case 'dragenter':
                    case 'dragover':
                        if (dragEl) {
                            this._onDragOver(evt);

                            _globalDragOver(evt);
                        }

                        break;

                    case 'selectstart':
                        evt.preventDefault();
                        break;
                }
            },

            /**
             * Serializes the item into an array of string.
             * @returns {String[]}
             */
            toArray: function toArray() {
                var order = [],
                    el,
                    children = this.el.children,
                    i = 0,
                    n = children.length,
                    options = this.options;

                for (; i < n; i++) {
                    el = children[i];

                    if (closest(el, options.draggable, this.el, false)) {
                        order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
                    }
                }

                return order;
            },

            /**
             * Sorts the elements according to the array.
             * @param  {String[]}  order  order of the items
             */
            sort: function sort(order) {
                var items = {},
                    rootEl = this.el;
                this.toArray().forEach(function(id, i) {
                    var el = rootEl.children[i];

                    if (closest(el, this.options.draggable, rootEl, false)) {
                        items[id] = el;
                    }
                }, this);
                order.forEach(function(id) {
                    if (items[id]) {
                        rootEl.removeChild(items[id]);
                        rootEl.appendChild(items[id]);
                    }
                });
            },

            /**
             * Save the current sorting
             */
            save: function save() {
                var store = this.options.store;
                store && store.set && store.set(this);
            },

            /**
             * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
             * @param   {HTMLElement}  el
             * @param   {String}       [selector]  default: `options.draggable`
             * @returns {HTMLElement|null}
             */
            closest: function closest$1(el, selector) {
                return closest(el, selector || this.options.draggable, this.el, false);
            },

            /**
             * Set/get option
             * @param   {string} name
             * @param   {*}      [value]
             * @returns {*}
             */
            option: function option(name, value) {
                var options = this.options;

                if (value === void 0) {
                    return options[name];
                } else {
                    var modifiedValue = PluginManager.modifyOption(this, name, value);

                    if (typeof modifiedValue !== 'undefined') {
                        options[name] = modifiedValue;
                    } else {
                        options[name] = value;
                    }

                    if (name === 'group') {
                        _prepareGroup(options);
                    }
                }
            },

            /**
             * Destroy
             */
            destroy: function destroy() {
                pluginEvent('destroy', this);
                var el = this.el;
                el[expando] = null;
                off(el, 'mousedown', this._onTapStart);
                off(el, 'touchstart', this._onTapStart);
                off(el, 'pointerdown', this._onTapStart);

                if (this.nativeDraggable) {
                    off(el, 'dragover', this);
                    off(el, 'dragenter', this);
                } // Remove draggable attributes

                Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function(el) {
                    el.removeAttribute('draggable');
                });

                this._onDrop();

                this._disableDelayedDragEvents();

                sortables.splice(sortables.indexOf(this.el), 1);
                this.el = el = null;
            },
            _hideClone: function _hideClone() {
                if (!cloneHidden) {
                    pluginEvent('hideClone', this);
                    if (Sortable.eventCanceled) return;
                    css(cloneEl, 'display', 'none');

                    if (this.options.removeCloneOnHide && cloneEl.parentNode) {
                        cloneEl.parentNode.removeChild(cloneEl);
                    }

                    cloneHidden = true;
                }
            },
            _showClone: function _showClone(putSortable) {
                if (putSortable.lastPutMode !== 'clone') {
                    this._hideClone();

                    return;
                }

                if (cloneHidden) {
                    pluginEvent('showClone', this);
                    if (Sortable.eventCanceled) return; // show clone at dragEl or original position

                    if (rootEl.contains(dragEl) && !this.options.group.revertClone) {
                        rootEl.insertBefore(cloneEl, dragEl);
                    } else if (nextEl) {
                        rootEl.insertBefore(cloneEl, nextEl);
                    } else {
                        rootEl.appendChild(cloneEl);
                    }

                    if (this.options.group.revertClone) {
                        this.animate(dragEl, cloneEl);
                    }

                    css(cloneEl, 'display', '');
                    cloneHidden = false;
                }
            }
        };

    function _globalDragOver(
        /**Event*/
        evt
    ) {
        if (evt.dataTransfer) {
            evt.dataTransfer.dropEffect = 'move';
        }

        evt.cancelable && evt.preventDefault();
    }

    function _onMove(
        fromEl,
        toEl,
        dragEl,
        dragRect,
        targetEl,
        targetRect,
        originalEvent,
        willInsertAfter
    ) {
        var evt,
            sortable = fromEl[expando],
            onMoveFn = sortable.options.onMove,
            retVal; // Support for new CustomEvent feature

        if (window.CustomEvent && !IE11OrLess && !Edge) {
            evt = new CustomEvent('move', {
                bubbles: true,
                cancelable: true
            });
        } else {
            evt = document.createEvent('Event');
            evt.initEvent('move', true, true);
        }

        evt.to = toEl;
        evt.from = fromEl;
        evt.dragged = dragEl;
        evt.draggedRect = dragRect;
        evt.related = targetEl || toEl;
        evt.relatedRect = targetRect || getRect(toEl);
        evt.willInsertAfter = willInsertAfter;
        evt.originalEvent = originalEvent;
        fromEl.dispatchEvent(evt);

        if (onMoveFn) {
            retVal = onMoveFn.call(sortable, evt, originalEvent);
        }

        return retVal;
    }

    function _disableDraggable(el) {
        el.draggable = false;
    }

    function _unsilent() {
        _silent = false;
    }

    function _ghostIsLast(evt, vertical, sortable) {
        var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
        var spacer = 10;
        return vertical
            ? evt.clientX > rect.right + spacer ||
                  (evt.clientX <= rect.right &&
                      evt.clientY > rect.bottom &&
                      evt.clientX >= rect.left)
            : (evt.clientX > rect.right && evt.clientY > rect.top) ||
                  (evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer);
    }

    function _getSwapDirection(
        evt,
        target,
        targetRect,
        vertical,
        swapThreshold,
        invertedSwapThreshold,
        invertSwap,
        isLastTarget
    ) {
        var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
            targetLength = vertical ? targetRect.height : targetRect.width,
            targetS1 = vertical ? targetRect.top : targetRect.left,
            targetS2 = vertical ? targetRect.bottom : targetRect.right,
            invert = false;

        if (!invertSwap) {
            // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
            if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
                // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
                // check if past first invert threshold on side opposite of lastDirection
                if (
                    !pastFirstInvertThresh &&
                    (lastDirection === 1
                        ? mouseOnAxis > targetS1 + (targetLength * invertedSwapThreshold) / 2
                        : mouseOnAxis < targetS2 - (targetLength * invertedSwapThreshold) / 2)
                ) {
                    // past first invert threshold, do not restrict inverted threshold to dragEl shadow
                    pastFirstInvertThresh = true;
                }

                if (!pastFirstInvertThresh) {
                    // dragEl shadow (target move distance shadow)
                    if (
                        lastDirection === 1
                            ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
                            : mouseOnAxis > targetS2 - targetMoveDistance
                    ) {
                        return -lastDirection;
                    }
                } else {
                    invert = true;
                }
            } else {
                // Regular
                if (
                    mouseOnAxis > targetS1 + (targetLength * (1 - swapThreshold)) / 2 &&
                    mouseOnAxis < targetS2 - (targetLength * (1 - swapThreshold)) / 2
                ) {
                    return _getInsertDirection(target);
                }
            }
        }

        invert = invert || invertSwap;

        if (invert) {
            // Invert of regular
            if (
                mouseOnAxis < targetS1 + (targetLength * invertedSwapThreshold) / 2 ||
                mouseOnAxis > targetS2 - (targetLength * invertedSwapThreshold) / 2
            ) {
                return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
            }
        }

        return 0;
    }
    /**
     * Gets the direction dragEl must be swapped relative to target in order to make it
     * seem that dragEl has been "inserted" into that element's position
     * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
     * @return {Number}                   Direction dragEl must be swapped
     */

    function _getInsertDirection(target) {
        if (index(dragEl) < index(target)) {
            return 1;
        } else {
            return -1;
        }
    }
    /**
     * Generate id
     * @param   {HTMLElement} el
     * @returns {String}
     * @private
     */

    function _generateId(el) {
        var str = el.tagName + el.className + el.src + el.href + el.textContent,
            i = str.length,
            sum = 0;

        while (i--) {
            sum += str.charCodeAt(i);
        }

        return sum.toString(36);
    }

    function _saveInputCheckedState(root) {
        savedInputChecked.length = 0;
        var inputs = root.getElementsByTagName('input');
        var idx = inputs.length;

        while (idx--) {
            var el = inputs[idx];
            el.checked && savedInputChecked.push(el);
        }
    }

    function _nextTick(fn) {
        return setTimeout(fn, 0);
    }

    function _cancelNextTick(id) {
        return clearTimeout(id);
    } // Fixed #973:

    if (documentExists) {
        on(document, 'touchmove', function(evt) {
            if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
                evt.preventDefault();
            }
        });
    } // Export utils

    Sortable.utils = {
        on: on,
        off: off,
        css: css,
        find: find,
        is: function is(el, selector) {
            return !!closest(el, selector, el, false);
        },
        extend: extend,
        throttle: throttle,
        closest: closest,
        toggleClass: toggleClass,
        clone: clone,
        index: index,
        nextTick: _nextTick,
        cancelNextTick: _cancelNextTick,
        detectDirection: _detectDirection,
        getChild: getChild
    };
    /**
     * Get the Sortable instance of an element
     * @param  {HTMLElement} element The element
     * @return {Sortable|undefined}         The instance of Sortable
     */

    Sortable.get = function(element) {
        return element[expando];
    };
    /**
     * Mount a plugin to Sortable
     * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
     */

    Sortable.mount = function() {
        for (
            var _len = arguments.length, plugins = new Array(_len), _key = 0;
            _key < _len;
            _key++
        ) {
            plugins[_key] = arguments[_key];
        }

        if (plugins[0].constructor === Array) plugins = plugins[0];
        plugins.forEach(function(plugin) {
            if (!plugin.prototype || !plugin.prototype.constructor) {
                throw 'Sortable: Mounted plugin must be a constructor function, not '.concat(
                    {}.toString.call(plugin)
                );
            }

            if (plugin.utils) Sortable.utils = _objectSpread({}, Sortable.utils, plugin.utils);
            PluginManager.mount(plugin);
        });
    };
    /**
     * Create sortable instance
     * @param {HTMLElement}  el
     * @param {Object}      [options]
     */

    Sortable.create = function(el, options) {
        return new Sortable(el, options);
    }; // Export

    Sortable.version = version;

    var autoScrolls = [],
        scrollEl,
        scrollRootEl,
        scrolling = false,
        lastAutoScrollX,
        lastAutoScrollY,
        touchEvt$1,
        pointerElemChangedInterval;

    function AutoScrollPlugin() {
        function AutoScroll() {
            this.defaults = {
                scroll: true,
                scrollSensitivity: 30,
                scrollSpeed: 10,
                bubbleScroll: true
            }; // Bind all private methods

            for (var fn in this) {
                if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
                    this[fn] = this[fn].bind(this);
                }
            }
        }

        AutoScroll.prototype = {
            dragStarted: function dragStarted(_ref) {
                var originalEvent = _ref.originalEvent;

                if (this.sortable.nativeDraggable) {
                    on(document, 'dragover', this._handleAutoScroll);
                } else {
                    if (this.options.supportPointer) {
                        on(document, 'pointermove', this._handleFallbackAutoScroll);
                    } else if (originalEvent.touches) {
                        on(document, 'touchmove', this._handleFallbackAutoScroll);
                    } else {
                        on(document, 'mousemove', this._handleFallbackAutoScroll);
                    }
                }
            },
            dragOverCompleted: function dragOverCompleted(_ref2) {
                var originalEvent = _ref2.originalEvent;

                // For when bubbling is canceled and using fallback (fallback 'touchmove' always reached)
                if (!this.options.dragOverBubble && !originalEvent.rootEl) {
                    this._handleAutoScroll(originalEvent);
                }
            },
            drop: function drop() {
                if (this.sortable.nativeDraggable) {
                    off(document, 'dragover', this._handleAutoScroll);
                } else {
                    off(document, 'pointermove', this._handleFallbackAutoScroll);
                    off(document, 'touchmove', this._handleFallbackAutoScroll);
                    off(document, 'mousemove', this._handleFallbackAutoScroll);
                }

                clearPointerElemChangedInterval();
                clearAutoScrolls();
                cancelThrottle();
            },
            nulling: function nulling() {
                touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
                autoScrolls.length = 0;
            },
            _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
                this._handleAutoScroll(evt, true);
            },
            _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
                var _this = this;

                var x = (evt.touches ? evt.touches[0] : evt).clientX,
                    y = (evt.touches ? evt.touches[0] : evt).clientY,
                    elem = document.elementFromPoint(x, y);
                touchEvt$1 = evt; // IE does not seem to have native autoscroll,
                // Edge's autoscroll seems too conditional,
                // MACOS Safari does not have autoscroll,
                // Firefox and Chrome are good

                if (fallback || Edge || IE11OrLess || Safari) {
                    autoScroll(evt, this.options, elem, fallback); // Listener for pointer element change

                    var ogElemScroller = getParentAutoScrollElement(elem, true);

                    if (
                        scrolling &&
                        (!pointerElemChangedInterval ||
                            x !== lastAutoScrollX ||
                            y !== lastAutoScrollY)
                    ) {
                        pointerElemChangedInterval && clearPointerElemChangedInterval(); // Detect for pointer elem change, emulating native DnD behaviour

                        pointerElemChangedInterval = setInterval(function() {
                            var newElem = getParentAutoScrollElement(
                                document.elementFromPoint(x, y),
                                true
                            );

                            if (newElem !== ogElemScroller) {
                                ogElemScroller = newElem;
                                clearAutoScrolls();
                            }

                            autoScroll(evt, _this.options, newElem, fallback);
                        }, 10);
                        lastAutoScrollX = x;
                        lastAutoScrollY = y;
                    }
                } else {
                    // if DnD is enabled (and browser has good autoscrolling), first autoscroll will already scroll, so get parent autoscroll of first autoscroll
                    if (
                        !this.options.bubbleScroll ||
                        getParentAutoScrollElement(elem, true) === getWindowScrollingElement()
                    ) {
                        clearAutoScrolls();
                        return;
                    }

                    autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
                }
            }
        };
        return _extends(AutoScroll, {
            pluginName: 'scroll',
            initializeByDefault: true
        });
    }

    function clearAutoScrolls() {
        autoScrolls.forEach(function(autoScroll) {
            clearInterval(autoScroll.pid);
        });
        autoScrolls = [];
    }

    function clearPointerElemChangedInterval() {
        clearInterval(pointerElemChangedInterval);
    }

    var autoScroll = throttle(function(evt, options, rootEl, isFallback) {
        // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
        if (!options.scroll) return;
        var x = (evt.touches ? evt.touches[0] : evt).clientX,
            y = (evt.touches ? evt.touches[0] : evt).clientY,
            sens = options.scrollSensitivity,
            speed = options.scrollSpeed,
            winScroller = getWindowScrollingElement();
        var scrollThisInstance = false,
            scrollCustomFn; // New scroll root, set scrollEl

        if (scrollRootEl !== rootEl) {
            scrollRootEl = rootEl;
            clearAutoScrolls();
            scrollEl = options.scroll;
            scrollCustomFn = options.scrollFn;

            if (scrollEl === true) {
                scrollEl = getParentAutoScrollElement(rootEl, true);
            }
        }

        var layersOut = 0;
        var currentParent = scrollEl;

        do {
            var el = currentParent,
                rect = getRect(el),
                top = rect.top,
                bottom = rect.bottom,
                left = rect.left,
                right = rect.right,
                width = rect.width,
                height = rect.height,
                canScrollX = void 0,
                canScrollY = void 0,
                scrollWidth = el.scrollWidth,
                scrollHeight = el.scrollHeight,
                elCSS = css(el),
                scrollPosX = el.scrollLeft,
                scrollPosY = el.scrollTop;

            if (el === winScroller) {
                canScrollX =
                    width < scrollWidth &&
                    (elCSS.overflowX === 'auto' ||
                        elCSS.overflowX === 'scroll' ||
                        elCSS.overflowX === 'visible');
                canScrollY =
                    height < scrollHeight &&
                    (elCSS.overflowY === 'auto' ||
                        elCSS.overflowY === 'scroll' ||
                        elCSS.overflowY === 'visible');
            } else {
                canScrollX =
                    width < scrollWidth &&
                    (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
                canScrollY =
                    height < scrollHeight &&
                    (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
            }

            var vx =
                canScrollX &&
                (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) -
                    (Math.abs(left - x) <= sens && !!scrollPosX);
            var vy =
                canScrollY &&
                (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) -
                    (Math.abs(top - y) <= sens && !!scrollPosY);

            if (!autoScrolls[layersOut]) {
                for (var i = 0; i <= layersOut; i++) {
                    if (!autoScrolls[i]) {
                        autoScrolls[i] = {};
                    }
                }
            }

            if (
                autoScrolls[layersOut].vx != vx ||
                autoScrolls[layersOut].vy != vy ||
                autoScrolls[layersOut].el !== el
            ) {
                autoScrolls[layersOut].el = el;
                autoScrolls[layersOut].vx = vx;
                autoScrolls[layersOut].vy = vy;
                clearInterval(autoScrolls[layersOut].pid);

                if (vx != 0 || vy != 0) {
                    scrollThisInstance = true;
                    /* jshint loopfunc:true */

                    autoScrolls[layersOut].pid = setInterval(
                        function() {
                            // emulate drag over during autoscroll (fallback), emulating native DnD behaviour
                            if (isFallback && this.layer === 0) {
                                Sortable.active._onTouchMove(touchEvt$1); // To move ghost if it is positioned absolutely
                            }

                            var scrollOffsetY = autoScrolls[this.layer].vy
                                ? autoScrolls[this.layer].vy * speed
                                : 0;
                            var scrollOffsetX = autoScrolls[this.layer].vx
                                ? autoScrolls[this.layer].vx * speed
                                : 0;

                            if (typeof scrollCustomFn === 'function') {
                                if (
                                    scrollCustomFn.call(
                                        Sortable.dragged.parentNode[expando],
                                        scrollOffsetX,
                                        scrollOffsetY,
                                        evt,
                                        touchEvt$1,
                                        autoScrolls[this.layer].el
                                    ) !== 'continue'
                                ) {
                                    return;
                                }
                            }

                            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
                        }.bind({
                            layer: layersOut
                        }),
                        24
                    );
                }
            }

            layersOut++;
        } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));

        scrolling = scrollThisInstance; // in case another function catches scrolling as false in between when it is not
    }, 30);

    var drop = function drop(_ref) {
        var originalEvent = _ref.originalEvent,
            putSortable = _ref.putSortable,
            dragEl = _ref.dragEl,
            activeSortable = _ref.activeSortable,
            dispatchSortableEvent = _ref.dispatchSortableEvent,
            hideGhostForTarget = _ref.hideGhostForTarget,
            unhideGhostForTarget = _ref.unhideGhostForTarget;
        if (!originalEvent) return;
        var toSortable = putSortable || activeSortable;
        hideGhostForTarget();
        var touch =
            originalEvent.changedTouches && originalEvent.changedTouches.length
                ? originalEvent.changedTouches[0]
                : originalEvent;
        var target = document.elementFromPoint(touch.clientX, touch.clientY);
        unhideGhostForTarget();

        if (toSortable && !toSortable.el.contains(target)) {
            dispatchSortableEvent('spill');
            this.onSpill({
                dragEl: dragEl,
                putSortable: putSortable
            });
        }
    };

    function Revert() {}

    Revert.prototype = {
        startIndex: null,
        dragStart: function dragStart(_ref2) {
            var oldDraggableIndex = _ref2.oldDraggableIndex;
            this.startIndex = oldDraggableIndex;
        },
        onSpill: function onSpill(_ref3) {
            var dragEl = _ref3.dragEl,
                putSortable = _ref3.putSortable;
            this.sortable.captureAnimationState();

            if (putSortable) {
                putSortable.captureAnimationState();
            }

            var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);

            if (nextSibling) {
                this.sortable.el.insertBefore(dragEl, nextSibling);
            } else {
                this.sortable.el.appendChild(dragEl);
            }

            this.sortable.animateAll();

            if (putSortable) {
                putSortable.animateAll();
            }
        },
        drop: drop
    };

    _extends(Revert, {
        pluginName: 'revertOnSpill'
    });

    function Remove() {}

    Remove.prototype = {
        onSpill: function onSpill(_ref4) {
            var dragEl = _ref4.dragEl,
                putSortable = _ref4.putSortable;
            var parentSortable = putSortable || this.sortable;
            parentSortable.captureAnimationState();
            dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
            parentSortable.animateAll();
        },
        drop: drop
    };

    _extends(Remove, {
        pluginName: 'removeOnSpill'
    });

    Sortable.mount(new AutoScrollPlugin());
    Sortable.mount(Remove, Revert);

    function updateGroupControl() {
        var config = this.config;
        config.group_options = config.group_options.sort(function(a, b) {
            var index_a = config.groups.indexOf(a.value_col);
            var index_b = config.groups.indexOf(b.value_col);

            var a_val = index_a == -1 ? 9999 : index_a;
            var b_val = index_b == -1 ? 9999 : index_b;

            return a_val - b_val;
        });

        this.groupControl
            .select('ul')
            .selectAll('li')
            .data(config.group_options, function(d) {
                return d.value_col;
            })
            .order()
            .classed('active', function(d) {
                return config.groups.indexOf(d.value_col) > -1;
            });
    }

    function makeGroupControl() {
        var chart = this;
        var config = this.config;
        this.groupControl = this.controls.wrap.insert('div', '*').attr('class', 'groupControl');
        this.groupControl
            .append('span')
            .text('Group By:')
            .append('sup')
            .html('&#9432;')
            .style('cursor', 'help')
            .attr(
                'title',
                'Drag items to reorder levels.\n Double click items to show/hide levels.'
            );
        var group_ul = this.groupControl.append('ul').attr('id', 'group-control');

        group_ul
            .selectAll('li')
            .data(config.group_options, function(d) {
                return d.value_col;
            })
            .enter()
            .append('li')
            .text(function(d) {
                return d.label;
            });

        //double click an item to add/remove from active groups
        group_ul.selectAll('li').on('dblclick', function(d) {
            // add/remove from active groups
            var active = config.groups.indexOf(d.value_col) > -1;
            if (active) {
                config.groups = config.groups.filter(function(f) {
                    return f != d.value_col;
                });
            } else {
                config.groups.push(d.value_col);
            }
            updateGroupControl.call(chart);
            chart.draw();
        });

        //make the list draggable with sortable
        var groupList = document.getElementById('group-control');
        var sortable = Sortable.create(groupList, {
            fallbackOnBody: true,
            onChange: function onChange(evt) {
                var n_groups = config.groups.length;
                var ul = d3.select(this.el);
                ul.selectAll('li').classed('active', function(d, i) {
                    return i < n_groups;
                });
            },
            onEnd: function onEnd(evt) {
                // update the data for the group list
                var ul = d3.select(this.el);
                var lis = ul.selectAll('li');
                config.group_options = lis.data();
                config.groups = ul
                    .selectAll('li.active')
                    .data()
                    .map(function(m) {
                        return m.value_col;
                    });

                //draw the chart
                updateGroupControl.call(chart);
                chart.draw();
            }
        });

        updateGroupControl.call(this);
    }

    function updateSortCheckbox() {
        var chart = this;

        this.controls.sortCheckbox = this.controls.wrap
            .selectAll('.control-group')
            .filter(function(d) {
                return d.label === 'Sort Alphabetically?';
            })
            .selectAll('input')
            .on('change', function() {
                chart.config.sort_alpha = this.checked;
                chart.config.sort_direction = this.checked ? 'ascending' : 'descending';
                chart.config.sort_column = this.checked ? 'key' : 'n';
                chart.draw();
            });
    }

    function onLayout() {
        var chart = this;
        this.list = chart.wrap.append('div').attr('class', 'nested-data-explorer');
        makeGroupControl.call(this);
        updateSortCheckbox.call(this);
    }

    function onPreprocess() {}

    function onDatatransform() {}

    function calculateMetric(metric, d) {
        var metric_obj = {};
        metric_obj.label = metric.label;
        metric_obj.visible = metric.visible;
        metric_obj.showSparkline = metric.showSparkline;
        metric_obj.type = metric.type;
        metric_obj.fillEmptyCells = metric.fillEmptyCells;
        this[metric.label] = metric.calc.call(this, d);
        metric_obj.value = this[metric.label];
        metric_obj.formatted = metric.format
            ? d3.format(metric.format)(metric_obj.value)
            : metric_obj.value;
        this[metric.label + '_formatted'] = metric_obj.formatted;
        metric_obj.title = metric.calcTitle == undefined ? null : metric.calcTitle.call(this, d);
        metric_obj.raw = d;
        return metric_obj;
    }

    function makeNestLevel(key, data, iterate) {
        var chart = this;
        var config = chart.config;
        if (iterate == undefined) iterate = false;

        //Does this level of the nest have children? If so, what is the next level?
        var keyIndex = config.groups.indexOf(key);
        var groupKey = keyIndex > -1;
        var lastGroupKey = keyIndex == config.groups.length - 1;
        var hasChildren = groupKey & !lastGroupKey;
        var childrenKey = hasChildren ? config.groups[keyIndex + 1] : '';

        //Make the nest level
        var myNest = d3
            .nest()
            .key(function(d) {
                return d[key];
            })
            .rollup(function(d) {
                var obj = {};
                obj.total = chart.filtered_data.length;
                obj.raw = d;
                obj.level = keyIndex;
                obj.childrenKey = childrenKey;
                obj.hasChildren = hasChildren;

                obj.children = [];
                obj.childrenStatus = '';
                if (hasChildren & !iterate) {
                    obj.childrenStatus = 'pending';
                } else if (hasChildren & iterate) {
                    obj.childrenStatus = 'ready';
                    obj.children = makeNestLevel.call(chart, childrenKey, d, true);
                } else if (!hasChildren) {
                    obj.childrenStatus = 'none';
                }

                // get data for the sparkline (but don't do this if you're already calculating sparkline data)
                if ((key != 'date_interval') & config.show_sparklines)
                    obj.sparkline = makeNestLevel.call(chart, 'date_interval', d);

                // get metrics data
                obj.metrics = [];
                config.metrics.forEach(function(metric) {
                    var metricObj = calculateMetric.call(obj, metric, d);
                    metricObj.level = obj.level;
                    metricObj.keyDesc = key + ' = ' + d[0][key];
                    if (obj.sparkline != undefined) {
                        metricObj.sparkline = obj.sparkline.map(function(m) {
                            return {
                                date: m.key,
                                value: m.values[metricObj.label],
                                formatted: m.values[metricObj.label + '_formatted']
                            };
                        });
                    }
                    obj.metrics.push(metricObj);
                });

                return obj;
            })
            .entries(data)
            .sort(function(a, b) {
                var alpha =
                    chart.config.sort_direction === 'ascending'
                        ? a.key < b.key
                            ? -1
                            : a.key > b.key
                            ? 1
                            : 0
                        : a.key > b.key
                        ? -1
                        : a.key < b.key
                        ? 1
                        : 0;
                var numeric =
                    chart.config.sort_column !== 'key'
                        ? chart.config.sort_direction === 'ascending'
                            ? a.values[chart.config.sort_column] -
                              b.values[chart.config.sort_column]
                            : b.values[chart.config.sort_column] -
                              a.values[chart.config.sort_column]
                        : null;
                return config.sort_column === 'key' || !numeric ? alpha : numeric;
            });

        return myNest;
    }

    function makeDateScale() {
        var spark = this.config.spark;
        spark.dates = d3
            .set(
                this.filtered_data.map(function(m) {
                    return m.date_interval;
                })
            )
            .values();
        //  .filter(f => f != 'null');

        spark.dates = spark.dates.sort(d3.ascending);
        spark.x = d3.scale
            .ordinal()
            .domain(spark.dates)
            .rangePoints([spark.offset, spark.width - spark.offset]);

        spark.xBars = d3.scale
            .ordinal()
            .domain(spark.dates)
            .rangeBands([spark.offset, spark.width - spark.offset]);

        spark.rangeband = spark.xBars.rangeBand();
    }

    function onDraw() {
        var chart = this;
        chart.listing.wrap.classed('hidden', true);
        chart.wrap.classed('hidden', false);
        chart.controls.wrap.classed('hidden', false);
        makeDateScale.call(this);
        this.nested_data = makeNestLevel.call(this, this.config.groups[0], this.filtered_data);
    }

    function drawListing(d, label) {
        var chart = this;
        chart.listing.wrap.classed('hidden', false);
        chart.listing.wrap.select('h3').text('Showing ' + d.length + ' records for ' + label);
        chart.listing.draw(d);
        chart.wrap.classed('hidden', true);
        chart.controls.wrap.classed('hidden', true);
    }

    function lineEvents(point_g) {
        var chart = this;
        point_g
            .on('click', function(d) {
                var value_cell = this.parentElement.parentElement.parentElement;
                var cell_d = d3.select(value_cell).datum();

                var raw = cell_d['raw'].filter(function(f) {
                    return f.date_interval == d.date;
                });
                var label = cell_d['keyDesc'] + ' for time = ' + d.date;
                drawListing.call(chart, raw, label);
            })
            .on('mouseover', function(d) {
                // structure is g (this) -> svg -> div.sparkline -> div.value-cell -> li
                var li_cell = this.parentElement.parentElement.parentElement.parentElement;
                var valueCells = d3
                    .selectAll(li_cell.children)
                    .filter(function() {
                        return this.classList.contains('value-cell');
                    })
                    .filter(function(f) {
                        return f.showSparkline;
                    });

                var sparklines = valueCells.select('div.sparkline').select('svg');
                var gs = sparklines.selectAll('g').filter(function(f) {
                    return f.date == d.date;
                });

                // make circles visible
                gs.select('circle').classed('hidden', false);
                gs.select('rect.bar').classed('highlight', true);

                //show time label
                valueCells.select('div.value').classed('hidden', true);
                var hoverCells = valueCells
                    .append('div')
                    .attr('class', 'hover')
                    .datum(function(di) {
                        var obj = { date: d.date };
                        var val = di.sparkline.filter(function(f) {
                            return f.date == d.date;
                        })[0];
                        obj.formatted = val ? val.formatted : '0';
                        obj.value = val ? val.value : '0';
                        return obj;
                    });

                hoverCells
                    .append('div')
                    .attr('class', 'hover-date')
                    .text(function(d) {
                        return d.date ? d.date : 'No Date';
                    });
                hoverCells
                    .append('div')
                    .attr('class', 'hover-value')
                    .text(function(d) {
                        return d.formatted;
                    });
            })
            .on('mouseout', function(d) {
                var li = this.parentElement.parentElement.parentElement.parentElement;
                var row = d3.selectAll(li.children);
                //hide point
                row.selectAll('circle').classed('hidden', true);
                row.selectAll('rect.bar').classed('highlight', false);

                //show overall value
                row.selectAll('div.value').classed('hidden', false);
                row.selectAll('div.hover').remove();
            });
    }

    function drawSparkline(raw, cell, fillEmptyCells, type) {
        var spark = this.config.spark;
        if (type == undefined) type = 'line';
        var d = spark.dates
            .map(function(date) {
                var obj = { date: date };
                var match = raw.filter(function(d) {
                    return d.date == date;
                });
                obj.value = match.length > 0 ? match[0].value : fillEmptyCells ? 0 : null;
                return obj;
            })
            .filter(function(f) {
                return f.value != null;
            });
        var y = d3.scale
            .linear()
            .domain(
                d3.extent(d, function(d) {
                    return +d.value;
                })
            )
            .range([spark.height - spark.offset, spark.offset]);

        //render the svg
        var svg = cell.append('svg').attr({
            width: spark.width,
            height: spark.height
        });

        var point_g = svg
            .selectAll('g')
            .data(d)
            .enter()
            .append('g');
        //transparent overlay to catch mouseover
        point_g
            .append('rect')
            .attr('class', 'overlay')
            .attr('height', spark.height)
            .attr('width', spark.rangeband)
            .attr('x', function(d) {
                return spark.x(d.date) - spark.rangeband / 2;
            })
            .attr('y', 0)
            .attr('stroke', 'transparent')
            .attr('fill', 'transparent');

        if (d.length == 1) {
            point_g
                .append('circle')
                .attr('cx', function(d) {
                    return spark.x(d.date);
                })
                .attr('cy', function(d) {
                    return y(d.value);
                })
                .attr('r', spark.rangeband / 2)
                .attr('fill', '#999')
                .attr('stroke', '#999');
        }

        if (type == 'line') {
            var draw_sparkline = d3.svg
                .line()
                .interpolate('linear')
                .x(function(d) {
                    return spark.x(d.date);
                })
                .y(function(d) {
                    return y(+d.value);
                });

            var sparkline = svg
                .append('path')
                .datum(d)
                .attr({
                    class: 'sparkLine',
                    d: draw_sparkline,
                    fill: 'none',
                    stroke: '#999'
                });

            point_g
                .append('circle')
                .attr('cx', function(d) {
                    return spark.x(d.date);
                })
                .attr('cy', function(d) {
                    return y(d.value);
                })
                .attr('r', spark.rangeband)
                .attr('fill', '#2b8cbe')
                .attr('stroke', '#2b8cbe')
                .classed('hidden', true);
        }

        if (type == 'bar') {
            point_g
                .append('rect')
                .attr('class', 'bar')
                .attr('y', function(d) {
                    return y(d.value);
                })
                .attr('width', spark.rangeband)
                .attr('x', function(d) {
                    return spark.x(d.date) - spark.rangeband / 2;
                })
                .attr('height', function(d) {
                    return spark.height - spark.offset - y(d.value);
                })
                .attr('stroke', '#999')
                .attr('fill', '#999');
        }

        lineEvents.call(this, point_g);

        //draw outliers
        /*
        var outliers = overTime.filter(f => f.outlier);
        var outlier_circles = svg
            .selectAll('circle.outlier')
            .data(outliers)
            .enter()
            .append('circle')
            .attr('class', 'circle outlier')
            .attr('cx', d => x(d.studyday))
            .attr('cy', d => y(d.value))
            .attr('r', '2px')
            .attr('stroke', color)
            .attr('fill', color);  
        */
    }

    function drawHeader(ul) {
        var _this = this;

        var chart = this;
        var config = this.config;

        var header = ul.append('li').attr('class', 'header-row');

        var groupCellContainer = header
            .append('div')
            .datum({ label: 'key' })
            .attr('class', 'list-cell group-cell')
            .text('Group');
        groupCellContainer.on('click', function(d) {
            chart.config.sort_alpha = true;
            chart.config.sort_column = 'key';
            chart.config.sort_direction =
                chart.config.sort_direction === 'ascending' ? 'descending' : 'ascending';
            chart.controls.sortCheckbox.property('checked', true);
            chart.draw();
        });

        var valueCellContainers = header
            .selectAll('div.value-cell')
            .data(function(d) {
                return chart.config.metrics.filter(function(f) {
                    return f.visible;
                });
            })
            .enter()
            .append('div')
            .attr('class', 'list-cell value-cell')
            .style('width', function(d) {
                return (
                    (config.show_sparklines && d.showSparkline ? config.spark.width + 50 : 50) +
                    'px'
                );
            });
        var valueCells = valueCellContainers
            .append('div')
            .classed('value', true)
            .style('width', '100%')
            .text(function(d) {
                return d.label;
            });
        valueCells.on('click', function(d) {
            chart.config.sort_alpha = false;
            chart.config.sort_column = d.label;
            d.sort_direction = d.sort_direction === 'ascending' ? 'descending' : 'ascending';
            chart.config.sort_direction = d.sort_direction;
            chart.controls.sortCheckbox.property('checked', false);
            chart.draw();
        });

        header
            .selectAll('.list-cell')
            .filter(function(d) {
                return d.label === _this.config.sort_column;
            })
            .append('span')
            .classed('sort-direction', true)
            .html(chart.config.sort_direction === 'ascending' ? '&uarr;' : '&darr;');
    }

    function drawChildren(li, iterate) {
        var chart = this;
        var li_data = li.datum();
        var pending = li_data.values.childrenStatus == 'pending';

        //if the children data is pending calculate the nest and draw the ul
        if (pending) {
            li_data.values.children = makeNestLevel.call(
                chart,
                li_data.values.childrenKey,
                li_data.values.raw
            );
            li_data.values.childrenStatus = 'ready';
            drawListLevel.call(chart, li, li_data.values.children, false, iterate);
        } else if (iterate) {
            //check for children with 'pending' status
            li.select('ul')
                .selectAll('li')
                .each(function(d) {
                    drawChildren.call(chart, d3.select(this), true);
                });
        }
    }

    function drawListLevel(wrap, nest, header, iterate) {
        var chart = this;
        var config = this.config;
        if (iterate == undefined) iterate = false;
        var ul = wrap.append('ul').classed('one-list-to-rule-them-all', true);
        if (header) drawHeader.call(this, ul);

        var lis = ul
            .selectAll('li.value-row')
            .data(nest)
            .enter()
            .append('li')
            .attr('class', 'value-row')
            .classed('has-children', function(d) {
                return d.values.hasChildren;
            });

        var group_cells = lis
            .append('div')
            .attr('class', 'list-cell group-cell')
            .property('title', function(d) {
                return d.key;
            });
        group_cells
            .append('span')
            .attr('class', function(d) {
                return 'group-name group-name--' + d.values.level;
            })
            .style('padding-left', function(d) {
                return d.values.level * 24 + 'px';
            })
            .text(function(d) {
                return d.key;
            });
        //.html(
        //    d =>
        //        '&nbsp;&nbsp;&nbsp;'.repeat(d.values.level > 0 ? d.values.level : 0) +
        //        "<span class='group-name'>" +
        //        d.key +
        //        '</span>'
        //);

        /* TODO fake little css barchart - could revive later with option? 
            .style(
                'background',
                d =>
                    'linear-gradient(90deg, #CCC ' +
                    d3.format('.0%')(d.values.percent) +
                    ', #FFF ' +
                    d3.format('.0%')(d.values.percent) +
                    ')'
            );
            */

        var value_cells = lis
            .selectAll('div.value-cell')
            .data(function(d) {
                return d.values.metrics.filter(function(f) {
                    return f.visible;
                });
            })
            .enter()
            .append('div')
            .attr('class', 'list-cell value-cell')
            .style('width', function(d) {
                return config.show_sparklines & d.showSparkline ? config.spark.width + 50 : 50;
            })
            .style('height', config.spark.height > 25 ? config.spark.height : 25);

        if (config.show_sparklines) {
            value_cells
                .append('div')
                .datum(function(d) {
                    return d;
                })
                .attr('class', 'sparkline')
                .classed('hidden', function(d) {
                    return !d.showSparkline;
                })
                .each(function(d) {
                    drawSparkline.call(
                        chart,
                        d.sparkline,
                        d3.select(this),
                        d.fillEmptyCells,
                        d.type
                    );
                });
        }

        value_cells
            .append('div')
            .attr('class', 'value')
            .text(function(d) {
                return d.formatted;
            })
            .attr('title', function(d) {
                return d.title ? d.title : null;
            });

        value_cells
            .filter(function(f) {
                return f.label == 'n';
            })
            .select('div.value')
            .classed('listing-click', true)
            .on('click', function(d) {
                drawListing.call(chart, d.raw, d.keyDesc);
            });
        lis.each(function(d) {
            var li = d3.select(this);

            li.on('mouseover', function() {
                d3.select(this).classed('nde-hover', true);
            }).on('mouseout', function() {
                d3.select(this).classed('nde-hover', false);
            });

            if (d.values.hasChildren) {
                //iterate (draw the children ul) if requested
                if (iterate) drawChildren.call(chart, li, true);

                //click group-cell to show/hide children
                li.select('div.group-cell').on('click', function(d) {
                    var parent_li = d3.select(this.parentNode);

                    //if ul exists toggle it's visibility
                    if (!parent_li.select('ul').empty()) {
                        var toggle = !parent_li.select('ul').classed('hidden');
                        parent_li.select('ul').classed('hidden', toggle);
                    }

                    //try to draw any children (iteratively, if shift or ctrl is down )
                    drawChildren.call(chart, parent_li, d3.event.shiftKey || d3.event.ctrlKey);
                });
            }
        });
    }

    function drawOverall() {
        var overall_wrap = this.list.append('ul').attr('class', 'overall-row');
        this.overall_data = makeNestLevel.call(this, 'overall', this.filtered_data);
        drawListLevel.call(this, overall_wrap, this.overall_data);
    }

    function onResize() {
        this.wrap.select('svg').style('display', 'none');
        this.list.selectAll('*').remove();
        if (this.filtered_data.length > 0) {
            drawListLevel.call(this, this.list, this.nested_data, true);
            if (this.config.show_overall) drawOverall.call(this);
        } else {
            this.list
                .append('span')
                .text('No Data Selected. Update the filters or refresh the page to see the list. ');
        }
    }

    function onDestroy() {
        this.listing.destroy();
    }

    var callbacks = {
        onInit: onInit,
        onLayout: onLayout,
        onPreprocess: onPreprocess,
        onDatatransform: onDatatransform,
        onDraw: onDraw,
        onResize: onResize,
        onDestroy: onDestroy
    };

    function layout(element) {
        var container = d3$1.select(element);
        container
            .append('div')
            .classed('wc-component', true)
            .attr('id', 'nde-controls');
        container
            .append('div')
            .classed('wc-component', true)
            .attr('id', 'nde-table');
        container
            .append('div')
            .classed('wc-component', true)
            .attr('id', 'nde-details');
    }

    function styles() {
        var styles = [
            '.wc-chart path.highlighted{',
            'stroke-width:3px;',
            '}',
            '.wc-chart path.selected{',
            'stroke-width:5px;',
            'stroke:orange;',
            '}'
        ];
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = styles.join('\n');
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function nestedDataExplorer() {
        var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'body';
        var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        //layout and styles
        layout(element);
        styles();

        //Define chart.
        var mergedSettings = Object.assign({}, configuration.settings, settings);
        var syncedSettings = configuration.syncSettings(mergedSettings);
        var syncedControlInputs = configuration.syncControlInputs(
            configuration.controlInputs(),
            syncedSettings
        );
        var controls = webcharts.createControls(
            document.querySelector(element).querySelector('#nde-controls'),
            {
                location: 'top',
                inputs: syncedControlInputs
            }
        );
        var chart = webcharts.createChart(
            document.querySelector(element).querySelector('#nde-table'),
            syncedSettings,
            controls
        );

        //Define chart callbacks.
        for (var callback in callbacks) {
            chart.on(callback.substring(2).toLowerCase(), callbacks[callback]);
        } //listing
        var listing = webcharts.createTable(
            document.querySelector(element).querySelector('#nde-details'),
            configuration.listingSettings()
        );
        chart.listing = listing;
        listing.chart = chart;

        return chart;
    }

    return nestedDataExplorer;
});
