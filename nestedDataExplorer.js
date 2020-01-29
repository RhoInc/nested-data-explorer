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
            show_sparklines: false,
            date_col: null,
            date_format: null, //if specified, will attempt to parse date_col with d3.time.format(date_format)
            spark: {
                interval: '%Y-%m',
                count: 12, //show the last x values for the interval
                width: 100,
                height: 25,
                offset: 4
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
        // webcharts settings
        settings.y.column = settings.groups[0];
        settings.marks[0].per = [settings.groups[0]];
        settings.raw_groups = ['overall']; //system setting
        settings.filters = settings.group_options.filter(function(f) {
            return f.value_col != 'none';
        });
        settings.metrics.forEach(function(d) {
            if (d.visible == undefined) d.visible = true;
            if (d.showSparkline == undefined) d.showSparkline = true;
        });

        settings.metrics.push({
            label: 'n',
            calc: function calc(d) {
                return d.length;
            },
            showSparkline: true,
            visible: settings.hide_count ? false : true
        });

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
            visible: settings.hide_percent ? false : true
        });
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
            cols: ['ID', 'Measure', 'Visit', 'Value'],
            searchable: false,
            sortable: false,
            pagination: false,
            exportable: false
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

    function onInit() {
        makeOverall.call(this);
        makeDateInterval.call(this);
    }

    function addGroupControl(start) {
        var chart = this;
        var config = this.config;
        start = start ? start : 'none';

        // update the config
        config.raw_groups.push(start);
        config.groups = d3
            .set(
                config.raw_groups.filter(function(f) {
                    return f != 'none';
                })
            )
            .values();
        var pos = config.raw_groups.length - 1;
        //note that 'overall' is in the first spot (i=0) in the raw_groups array, but doesn't have a control

        //make the control
        var select = this.groupControl.insert('select', 'span.addGroupControl');
        select
            .selectAll('option')
            .data(config.group_options)
            .enter()
            .append('option')
            .text(function(d) {
                return d.label;
            })
            .property('selected', function(d) {
                return d.value_col == start;
            });

        select.on('change', function(d) {
            var label = this.value;
            var col = config.group_options.find(function(f) {
                return f.label == label;
            })['value_col'];

            config.raw_groups[pos] = col;
            config.groups = d3
                .set(
                    config.raw_groups.filter(function(f) {
                        return f != 'none';
                    })
                )
                .values();
            chart.draw();
            /*
            config.nested_data = makeNestLevel(config.groups[0], data)
            config.chart.select("ul").remove()
            drawLevel(config.chart, config.nested_data)
            */
        });
    }

    function onLayout() {
        var chart = this;
        this.list = chart.wrap.append('list');
        this.groupControl = this.controls.wrap.insert('div', '*').attr('class', 'groupControl');
        this.groupControl.append('span').text('Group By:  ');
        this.groupControl
            .append('span')
            .text('+')
            .classed('addGroupControl', true)
            .on('click', function() {
                addGroupControl.call(chart);
            });
        this.config.groups.forEach(function(group) {
            addGroupControl.call(chart, group);
        });
    }

    function onPreprocess() {}

    function onDatatransform() {}

    function calculateMetric(metric, d) {
        var metric_obj = {};
        metric_obj.label = metric.label;
        metric_obj.visible = metric.visible;
        metric_obj.showSparkline = metric.showSparkline;
        this[metric.label] = metric.calc.call(this, d);
        metric_obj.value = this[metric.label];
        metric_obj.formatted = metric.format
            ? d3.format(metric.format)(metric_obj.value)
            : metric_obj.value;
        metric_obj.title = metric.calcTitle == undefined ? null : metric.calcTitle.call(this, d);
        return metric_obj;
    }

    function makeNestLevel(key, data) {
        var chart = this;
        var config = chart.config;
        var keyIndex = config.groups.indexOf(key) + 1;
        var nextKey =
            (keyIndex > 0) & (keyIndex < config.groups.length) ? config.groups[keyIndex] : '';
        var myNest = d3
            .nest()
            .key(function(d) {
                return d[key];
            })
            .rollup(function(d) {
                var obj = {};
                obj.total = chart.filtered_data.length;
                obj.raw = d;
                obj.children = nextKey.length == 0 ? [] : makeNestLevel.call(chart, nextKey, d);
                if ((key != 'date_interval') & config.show_sparklines)
                    obj.sparkline = makeNestLevel.call(chart, 'date_interval', d);
                obj.level = keyIndex;
                obj.metrics = [];
                config.metrics.forEach(function(metric) {
                    var metricObj = calculateMetric.call(obj, metric, d);
                    if (obj.sparkline != undefined) {
                        metricObj.sparkline = obj.sparkline.map(function(m) {
                            return {
                                date: m.key,
                                value: m.values[metricObj.label]
                            };
                        });
                    }
                    obj.metrics.push(metricObj);
                });

                return obj;
            })
            .entries(data)
            .sort(function(a, b) {
                return config.sort_alpha ? b.key - a.key : b.values.n - a.values.n;
            });

        return myNest;
    }

    function onDraw() {
        var spark = this.config.spark;
        spark.dates = d3
            .set(
                this.filtered_data.map(function(m) {
                    return m.date_interval;
                })
            )
            .values();

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
        console.log(spark);
        this.nested_data = makeNestLevel.call(this, this.config.groups[0], this.filtered_data);
    }

    function drawSparkline(raw, cell) {
        var spark = this.config.spark;
        var d = spark.dates.map(function(date) {
            var obj = { date: date };
            var match = raw.filter(function(d) {
                return d.date == date;
            });
            obj.value = match.length > 0 ? match[0].value : 0;
            return obj;
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

        var point_g = svg
            .selectAll('g')
            .data(d)
            .enter()
            .append('g');

        point_g
            .append('circle')
            .attr('cx', function(d) {
                return spark.x(d.date);
            })
            .attr('cy', function(d) {
                return y(+d.value);
            })
            .attr('r', spark.rangeband)
            .attr('fill', 'transparent')
            .attr('stroke', 'transparent');

        point_g
            .append('rect')
            .attr('height', spark.height)
            .attr('width', spark.rangeband)
            .attr('x', function(d) {
                return spark.x(d.date) - spark.rangeband / 2;
            })
            .attr('y', 0)
            .attr('stroke', 'transparent')
            .attr('fill', 'transparent');

        point_g
            .on('mouseover', function(d) {
                //console.log(d);
                d3.select(this)
                    .select('circle')
                    .attr('stroke', '#2b8cbe')
                    .attr('fill', '#2b8cbe');
                //show year label
                var label = d.date + ' - ' + d.value;

                // g -> svg -> div.sparkline -> div.value-cell
                var valuecell = d3.select(this.parentElement.parentElement.parentElement);
                console.log(valuecell);
                valuecell.select('div.value').classed('hidden', true);
                var hoverCell = valuecell.append('div').attr('class', 'hover');
                hoverCell
                    .append('div')
                    .attr('class', 'hover-date')
                    .text(d.date);
                hoverCell
                    .append('div')
                    .attr('class', 'hover-value')
                    .text(d.value);
            })
            .on('mouseout', function(d) {
                //hide point
                d3.select(this)
                    .select('circle')
                    .attr('stroke', 'transparent')
                    .attr('fill', 'transparent');
                var valuecell = d3.select(this.parentElement.parentElement.parentElement);
                //show overall value
                valuecell.select('div.value').classed('hidden', false);
                valuecell.select('div.hover').remove();
            });

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

    function drawListLevel(wrap, nest, drawHeader) {
        var chart = this;
        var config = this.config;
        var ul = wrap.append('ul');
        if (drawHeader) {
            var header = ul.append('li').attr('class', 'header-row');
            header
                .append('div')
                .attr('class', 'list-cell group-cell')
                .text('Group');
            header
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
                    return config.show_sparklines & d.showSparkline ? 150 : 50;
                })
                .text(function(d) {
                    return d.label;
                });
        }
        var lis = ul
            .selectAll('li.value-row')
            .data(nest)
            .enter()
            .append('li')
            .attr('class', 'value-row')
            .classed('has-children', function(d) {
                return d.values.children.length > 0;
            });

        lis.append('div')
            .attr('class', 'list-cell group-cell')
            .html(function(d) {
                return (
                    '&nbsp;&nbsp;&nbsp;'.repeat(d.values.level - 1) +
                    "<span class='group-name'>" +
                    d.key +
                    '</span>'
                );
            })
            .style('background', function(d) {
                return (
                    'linear-gradient(90deg, #CCC ' +
                    d3.format('.0%')(d.values.percent) +
                    ', #FFF ' +
                    d3.format('.0%')(d.values.percent) +
                    ')'
                );
            });

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
                return config.show_sparklines & d.showSparkline ? 150 : 50;
            });

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
                    drawSparkline.call(chart, d.sparkline, d3.select(this));
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

        lis.each(function(d) {
            if (d.values.children.length > 0) {
                //click group-cell to show/hide children
                d3.select(this)
                    .select('div.group-cell')
                    .on('click', function(d) {
                        var toggle = d3.select(this.parentNode).classed('hidden-children');
                        d3.select(this.parentNode).classed('hidden-children', !toggle);
                    });

                //draw nested lists for children
                drawListLevel.call(chart, d3.select(this), d.values.children, false);
            }
        });
    }

    function onResize() {
        this.wrap.select('svg').style('display', 'none');
        this.list.selectAll('*').remove();

        if (this.filtered_data.length > 0) {
            drawListLevel.call(this, this.list, this.nested_data, true);
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
            .attr('id', 'wc-controls');
        container
            .append('div')
            .classed('wc-component', true)
            .attr('id', 'wc-chart');
        container
            .append('div')
            .classed('wc-component', true)
            .attr('id', 'wc-listing');
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
            document.querySelector(element).querySelector('#wc-controls'),
            {
                location: 'top',
                inputs: syncedControlInputs
            }
        );
        var chart = webcharts.createChart(
            document.querySelector(element).querySelector('#wc-chart'),
            syncedSettings,
            controls
        );

        //Define chart callbacks.
        for (var callback in callbacks) {
            chart.on(callback.substring(2).toLowerCase(), callbacks[callback]);
        } //listing
        var listing = webcharts.createTable(
            document.querySelector(element).querySelector('#wc-listing'),
            configuration.listingSettings()
        );
        listing.wrap.style('display', 'none'); // empty table's popping up briefly
        listing.init([]);
        chart.listing = listing;
        listing.chart = chart;

        return chart;
    }

    return nestedDataExplorer;
});
