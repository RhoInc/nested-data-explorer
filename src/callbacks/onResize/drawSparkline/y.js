export default function y(type, d, spark) {
    return d3.scale
        .linear()
        .domain(type !== 'bar' ? d3.extent(d, di => +di.value) : [0, d3.max(d, di => +di.value)])
        .range([spark.height - spark.offset, spark.offset]);
}
