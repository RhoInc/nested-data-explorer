import calculateMetric from './calculateMetric';

export default function makeNestLevel(key, data) {
    let chart = this;
    let config = chart.config;
    let keyIndex = config.groups.indexOf(key) + 1;
    let nextKey = (keyIndex > 0) & (keyIndex < config.groups.length) ? config.groups[keyIndex] : '';
    let myNest = d3
        .nest()
        .key(d => d[key])
        .rollup(function(d) {
            let obj = {};
            obj.total = chart.filtered_data.length;
            obj.raw = d;
            obj.children = nextKey.length == 0 ? [] : makeNestLevel.call(chart, nextKey, d);
            if ((key != 'date_interval') & config.show_sparklines)
                obj.sparkline = makeNestLevel.call(chart, 'date_interval', d);
            obj.level = keyIndex;
            obj.metrics = [];
            config.metrics.forEach(function(metric) {
                let metricObj = calculateMetric.call(obj, metric, d);
                if (obj.sparkline != undefined) {
                    metricObj.sparkline = obj.sparkline.map(m => ({
                        date: m.key,
                        value: m.values[metricObj.label]
                    }));
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
