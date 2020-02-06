import lineHover from './lineHover';

export default function drawSparkline(raw, cell, fillEmptyCells, type) {
    let chart = this;
    let spark = this.config.spark;
    if (type == undefined) type = 'line';
    let d = spark.dates
        .map(function(date) {
            let obj = { date: date };
            let match = raw.filter(d => d.date == date);
            obj.value = match.length > 0 ? match[0].value : fillEmptyCells ? 0 : null;
            return obj;
        })
        .filter(f => f.value != null);
    var y = d3.scale
        .linear()
        .domain(d3.extent(d, d => +d.value))
        .range([spark.height - spark.offset, spark.offset]);

    //render the svg
    var svg = cell.append('svg').attr({
        width: spark.width,
        height: spark.height
    });

    var point_g = svg
        .selectAll('g')
        .data(d)
        .enter()
        .append('g');
    //transparent overlay to catch mouseover
    point_g
        .append('rect')
        .attr('class', 'overlay')
        .attr('height', spark.height)
        .attr('width', spark.rangeband)
        .attr('x', d => spark.x(d.date) - spark.rangeband / 2)
        .attr('y', 0)
        .attr('stroke', 'transparent')
        .attr('fill', 'transparent');

    if (d.length == 1) {
        point_g
            .append('circle')
            .attr('cx', d => spark.x(d.date))
            .attr('cy', d => y(d.value))
            .attr('r', spark.rangeband / 2)
            .attr('fill', '#999')
            .attr('stroke', '#999');
    }

    if (type == 'line') {
        var draw_sparkline = d3.svg
            .line()
            .interpolate('linear')
            .x(d => spark.x(d.date))
            .y(d => y(+d.value));

        var sparkline = svg
            .append('path')
            .datum(d)
            .attr({
                class: 'sparkLine',
                d: draw_sparkline,
                fill: 'none',
                stroke: '#999'
            });

        point_g
            .append('circle')
            .attr('cx', d => spark.x(d.date))
            .attr('cy', d => y(d.value))
            .attr('r', spark.rangeband)
            .attr('fill', '#2b8cbe')
            .attr('stroke', '#2b8cbe')
            .classed('hidden', true);
    }

    if (type == 'bar') {
        point_g
            .append('rect')
            .attr('class', 'bar')
            .attr('y', d => y(d.value))
            .attr('width', spark.rangeband)
            .attr('x', d => spark.x(d.date) - spark.rangeband / 2)
            .attr('height', d => spark.height - spark.offset - y(d.value))
            .attr('stroke', '#999')
            .attr('fill', '#999');
    }

    lineHover.call(this, point_g);

    //draw outliers
    /*
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
    */
}
