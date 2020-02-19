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

    function onLayout() {
        var chart = this;
        this.list = chart.wrap.append('div').attr('class', 'nested-data-explorer');
        makeGroupControl.call(this);
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

                // get data for the sparkline (but don't do this if you'e already calculating sparkline data)
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
                                formatted: +m.values[metricObj.label + '_formatted']
                            };
                        });
                    }
                    obj.metrics.push(metricObj);
                });

                return obj;
            })
            .entries(data)
            .sort(function(a, b) {
                var alpha = a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
                var numeric = b.values.n - a.values.n;
                return config.sort_alpha ? alpha : numeric;
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
        var chart = this;
        var config = this.config;
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
                return config.show_sparklines & d.showSparkline ? config.spark.width + 50 : 50;
            })
            .text(function(d) {
                return d.label;
            });
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
        var ul = wrap.append('ul');
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
            })
            .html(function(d) {
                return (
                    '&nbsp;&nbsp;&nbsp;'.repeat(d.values.level > 0 ? d.values.level : 0) +
                    "<span class='group-name'>" +
                    d.key +
                    '</span>'
                );
            });

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
            if (d.values.hasChildren) {
                //iterate (draw the children ul) if requested
                if (iterate) drawChildren.call(chart, d3.select(this), true);

                //click group-cell to show/hide children
                d3.select(this)
                    .select('div.group-cell')
                    .on('click', function(d) {
                        var li = d3.select(this.parentNode);

                        //if ul exists toggle it's visibility
                        if (!li.select('ul').empty()) {
                            var toggle = !li.select('ul').classed('hidden');
                            li.select('ul').classed('hidden', toggle);
                        }

                        //try to draw any children (iteratively, if shift or ctrl is down )
                        drawChildren.call(chart, li, d3.event.shiftKey || d3.event.ctrlKey);
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
