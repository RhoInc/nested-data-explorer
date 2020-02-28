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
        .style('width', d =>
            config.show_sparklines & d.showSparkline ? config.spark.width + 50 : 50
        )
        .append('div')
        .classed('value', true)
        .text(d => d.label);
}
