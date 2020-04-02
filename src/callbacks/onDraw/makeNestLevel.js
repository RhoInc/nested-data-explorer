import calculateMetric from './calculateMetric';

export default function makeNestLevel(key, data, iterate) {
    let chart = this;
    let config = chart.config;
    if (iterate == undefined) iterate = false;

    //Does this level of the nest have children? If so, what is the next level?
    let keyIndex = config.groups.indexOf(key);
    let groupKey = keyIndex > -1;
    let lastGroupKey = keyIndex == config.groups.length - 1;
    let hasChildren = groupKey & !lastGroupKey;
    let childrenKey = hasChildren ? config.groups[keyIndex + 1] : '';

    //Make the nest level
    let myNest = d3
        .nest()
        .key(d => d[key])
        .rollup(function(d) {
            let obj = {};
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
            if ((key != 'date_interval') & config.show_sparklines) {
                obj.sparkline = makeNestLevel.call(chart, 'date_interval', d);
            }

            // get metrics data
            obj.metrics = [];
            config.metrics.forEach(function(metric) {
                let metricObj = calculateMetric.call(obj, metric, d);
                metricObj.level = obj.level;
                metricObj.keyDesc = key + ' = ' + d[0][key];
                if (obj.sparkline != undefined) {
                    metricObj.sparkline = obj.sparkline.map(m => ({
                        date: m.key,
                        value: m.values[metricObj.label],
                        formatted: m.values[metricObj.label + '_formatted']
                    }));
                }
                obj.metrics.push(metricObj);
            });

            return obj;
        })
        .entries(data)
        .sort((a, b) => {
            if (key !== 'date_interval') {
                const alpha =
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
                const numeric =
                    chart.config.sort_column !== 'key'
                        ? chart.config.sort_direction === 'ascending'
                            ? a.values[chart.config.sort_column] -
                              b.values[chart.config.sort_column]
                            : b.values[chart.config.sort_column] -
                              a.values[chart.config.sort_column]
                        : null;
                return config.sort_column === 'key' || !numeric ? alpha : numeric;
            } else {
                return (
                    d3.time.format(config.spark.interval).parse(a.key) -
                    d3.time.format(config.spark.interval).parse(b.key)
                );
            }
        });

    return myNest;
}
