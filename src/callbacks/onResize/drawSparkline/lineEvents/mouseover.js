export default function mouseover(d, chart) {
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
        .text(d => (d.date ? d.date : 'No Date'));
    hoverCells
        .append('div')
        .attr('class', 'hover-value')
        .text(d => d.formatted);
}
