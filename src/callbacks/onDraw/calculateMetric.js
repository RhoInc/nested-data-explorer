export default function calculateMetric(metric, d) {
    let metric_obj = {};
    metric_obj.label = metric.label;
    metric_obj.visible = metric.visible;
    metric_obj.showSparkline = metric.showSparkline;
    metric_obj.fillEmptyCells = metric.fillEmptyCells;
    this[metric.label] = metric.calc.call(this, d);
    metric_obj.value = this[metric.label];
    metric_obj.formatted = metric.format
        ? d3.format(metric.format)(metric_obj.value)
        : metric_obj.value;
    this[metric.label + '_formatted'] = metric_obj.formatted;
    metric_obj.title = metric.calcTitle == undefined ? null : metric.calcTitle.call(this, d);
    return metric_obj;
}
