export default function drawBar(g, y, spark) {
    return g
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.value))
        .attr('width', spark.rangeband)
        .attr('x', d => spark.x(d.date) - spark.rangeband / 2)
        .attr('height', d => spark.height - spark.offset - y(d.value))
        .attr('stroke', '#999')
        .attr('fill', '#999');
}
