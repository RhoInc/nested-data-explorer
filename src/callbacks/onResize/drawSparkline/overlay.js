// Add transparent overlay to catch mouseover.
export default function overlay(g, spark) {
    return g
        .append('rect')
        .attr('class', 'overlay')
        .attr('height', spark.height)
        .attr('width', spark.rangeband)
        .attr('x', d => spark.x(d.date) - spark.rangeband / 2)
        .attr('y', 0)
        .attr('stroke', 'transparent')
        .attr('fill', 'transparent');
}
