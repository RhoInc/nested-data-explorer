export default function syncSettings(settings) {
    // webcharts settings
    settings.y.column = settings.groups[0];
    settings.marks[0].per = [settings.groups[0]];
    settings.raw_groups = ['overall']; //system setting
    settings.filters = settings.group_options.filter(f => f.value_col != 'none');

    //merge in default metrics
    let reservedMetrics = ['n', 'percent'];
    settings.metrics.forEach(function(d) {
        if (d.visible == undefined) d.visible = true;
        if (d.showSparkline == undefined) d.showSparkline = true;
    });

    settings.metrics.push({
        label: 'n',
        calc: function(d) {
            return d.length;
        },
        showSparkline: true,
        visible: settings.hide_count ? false : true
    });

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
        visible: settings.hide_percent ? false : true
    });
    return settings;
}
