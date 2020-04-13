export default function drawLine(spark, y, svg, data, g) {
    const draw_sparkline = d3.svg
        .line()
        .interpolate('linear')
        .x(d => spark.x(d.date))
        .y(d => y(+d.value));

    const sparkline = svg
        .append('path')
        .datum(data)
        .attr({
            class: 'sparkLine',
            d: draw_sparkline,
            fill: 'none',
            stroke: '#999',
        });

    const points = g
        .append('circle')
        .attr('cx', d => spark.x(d.date))
        .attr('cy', d => y(d.value))
        .attr('r', 3) //spark.rangeband)
        .attr('fill', '#2b8cbe')
        .attr('stroke', '#2b8cbe')
        .classed('hidden', true);

    return sparkline;
}
