export default function syncSettings(settings) {
    // webcharts settings
    settings.y.column = settings.groups[0];
    settings.marks[0].per = [settings.groups[0]];
    settings.raw_groups = ['overall']; //system setting
    settings.filters = settings.group_options.filter(f => f.value_col != 'none');

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
    let metricNames = settings.metrics.map(m => m.label);

    if (metricNames.indexOf('n') == -1) {
        settings.metrics.push({
            label: 'n',
            calc: function(d) {
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
            calc: function(d) {
                return this.n / this.total;
            },
            calcTitle: function(d) {
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
