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
        .attr('cy', d => y(d.value))
        .attr('r', spark.rangeband)
        .attr('fill', '#2b8cbe')
        .attr('stroke', '#2b8cbe')
        .classed('hidden', true);

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
            // structure is g (this) -> svg -> div.sparkline -> div.value-cell -> li
            let li_cell = this.parentElement.parentElement.parentElement.parentElement;
            let valueCells = d3
                .selectAll(li_cell.children)
                .filter(function() {
                    return this.classList.contains('value-cell');
                })
                .filter(function(f) {
                    return f.showSparkline;
                });
            /*
            let valueCells = li.selectAll('div.value-cell').filter(function(f) {
                return f.showSparkline & (this.parentElement == li_cell);
            });
            */
            let sparklines = valueCells.select('div.sparkline').select('svg');
            let gs = sparklines.selectAll('g').filter(f => f.date == d.date);

            // make circles visible
            gs.select('circle').classed('hidden', false);

            //show time label
            valueCells.select('div.value').classed('hidden', true);
            let hoverCells = valueCells
                .append('div')
                .attr('class', 'hover')
                .datum(function(di) {
                    let obj = { date: d.date };
                    let val = di.sparkline.filter(f => f.date == d.date)[0];
                    obj.formatted = val ? val.formatted : '0';
                    obj.value = val ? val.value : '0';
                    return obj;
                });

            hoverCells
                .append('div')
                .attr('class', 'hover-date')
                .text(function(d) {
                    return d.date ? d.date : 'No Date';
                });
            hoverCells
                .append('div')
                .attr('class', 'hover-value')
                .text(d => d.formatted);
        })

        .on('mouseout', function(d) {
            let li = this.parentElement.parentElement.parentElement.parentElement;
            let row = d3.selectAll(li.children);
            //hide point
            row.selectAll('circle').classed('hidden', true);

            //show overall value
            row.selectAll('div.value').classed('hidden', false);
            row.selectAll('div.hover').remove();
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
