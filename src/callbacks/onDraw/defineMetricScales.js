export default function defineMetricScales() {
    this.config.metrics.forEach(metric => {
        metric.min = d3.min(
            this.nested_data.filter(d => d.values[metric.label] !== Infinity),
            d => d.values[metric.label],
        );
        metric.max = d3.max(
            this.nested_data.filter(d => d.values[metric.label] !== Infinity),
            d => d.values[metric.label],
        );
        metric.scale = d3.scale
            .linear()
            .domain([0, metric.max])
            .range([this.config.spark.offest, this.config.spark.width - this.config.spark.offset]);
    });
}
