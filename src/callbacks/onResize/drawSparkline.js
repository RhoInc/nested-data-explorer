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
    var svg = cell.append('svg').attr({
        width: spark.width,
        height: spark.height
    });

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

    var point_g = svg
        .selectAll('g')
        .data(d)
        .enter()
        .append('g');

    point_g
        .append('circle')
        .attr('cx', d => spark.x(d.date))
        .attr('cy', d => y(+d.value))
        .attr('r', spark.rangeband)
        .attr('fill', 'transparent')
        .attr('stroke', 'transparent');

    point_g
        .append('rect')
        .attr('height', spark.height)
        .attr('width', spark.rangeband)
        .attr('x', d => spark.x(d.date) - spark.rangeband / 2)
        .attr('y', 0)
        .attr('stroke', 'transparent')
        .attr('fill', 'transparent');

    point_g
        .on('mouseover', function(d) {
            //console.log(d);
            d3.select(this)
                .select('circle')
                .attr('stroke', '#2b8cbe')
                .attr('fill', '#2b8cbe');
            //show year label
            let label = d.date + ' - ' + d.value;

            // g -> svg -> div.sparkline -> div.value-cell
            let valuecell = d3.select(this.parentElement.parentElement.parentElement);
            valuecell.select('div.value').classed('hidden', true);
            let hoverCell = valuecell.append('div').attr('class', 'hover');
            hoverCell
                .append('div')
                .attr('class', 'hover-date')
                .text(d.date);
            hoverCell
                .append('div')
                .attr('class', 'hover-value')
                .text(d.value);
        })
        .on('mouseout', function(d) {
            //hide point
            d3.select(this)
                .select('circle')
                .attr('stroke', 'transparent')
                .attr('fill', 'transparent');
            let valuecell = d3.select(this.parentElement.parentElement.parentElement);
            //show overall value
            valuecell.select('div.value').classed('hidden', false);
            valuecell.select('div.hover').remove();
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
