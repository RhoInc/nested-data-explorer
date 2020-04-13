export default function mouseout(d, chart) {
    let li = this.parentElement.parentElement.parentElement.parentElement;
    let row = d3.selectAll(li.children);
    //hide point
    row.selectAll('circle').classed('hidden', true);
    row.selectAll('rect.bar').classed('highlight', false);

    //show overall value
    row.selectAll('div.value').classed('hidden', false);
    row.selectAll('div.hover').remove();
}
