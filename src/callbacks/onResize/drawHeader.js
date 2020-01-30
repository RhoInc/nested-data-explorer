export default function drawHeader(ul) {
    let chart = this;
    let config = this.config;
    let header = ul.append('li').attr('class', 'header-row');
    header
        .append('div')
        .attr('class', 'list-cell group-cell')
        .text('Group');
    header
        .selectAll('div.value-cell')
        .data(d => chart.config.metrics.filter(f => f.visible))
        .enter()
        .append('div')
        .attr('class', 'list-cell value-cell')
        .style('width', d => (config.show_sparklines & d.showSparkline ? 150 : 50))
        .text(d => d.label);
}
