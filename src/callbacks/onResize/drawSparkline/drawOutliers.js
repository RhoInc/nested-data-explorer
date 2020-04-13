export default function drawOutliers(overTime, svg, spark, y, color) {
    var outliers = overTime.filter(f => f.outlier);
    var outlier_circles = svg
        .selectAll('circle.outlier')
        .data(outliers)
        .enter()
        .append('circle')
        .attr('class', 'circle outlier')
        .attr('cx', d => x(d.studyday))
        .attr('cy', d => y(d.value))
        .attr('r', '2px')
        .attr('stroke', color)
        .attr('fill', color);

    return outlier_circles;
}
