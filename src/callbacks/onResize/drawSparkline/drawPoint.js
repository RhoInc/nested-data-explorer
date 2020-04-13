export default function drawPoint(g, spark, y) {
    return g
        .append('circle')
        .attr('cx', d => spark.x(d.date))
        .attr('cy', d => y(d.value))
        .attr('r', 3) //spark.rangeband / 2)
        .attr('fill', '#999')
        .attr('stroke', '#999');
}
