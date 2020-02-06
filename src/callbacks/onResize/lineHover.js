export default function lineHover(point_g) {
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
            gs.select('rect.bar').classed('highlight', true);

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
            row.selectAll('rect.bar').classed('highlight', false);

            //show overall value
            row.selectAll('div.value').classed('hidden', false);
            row.selectAll('div.hover').remove();
        });
}
