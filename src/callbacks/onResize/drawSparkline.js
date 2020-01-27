export default function drawSparkline(raw, cell) {
    let chart = this;
    let spark = this.config.spark;
    let d = spark.dates.map(function(date) {
        let obj = { date: date };
        let match = raw.filter(d => d.date == date);
        obj.value = match.length > 0 ? match[0].value : 0;
        return obj;
    });

    var y = d3.scale
        .linear()
        .domain(d3.extent(d, d => +d.value))
        .range([spark.height - spark.offset, spark.offset]);

    //render the svg
    var svg = cell
        .append('svg')
        .attr({
            width: spark.width,
            height: spark.height
        })
        .append('g');

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
