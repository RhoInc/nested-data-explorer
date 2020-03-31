export default function drawHeader(ul) {
    const chart = this;
    const config = this.config;

    const header = ul.append('li').attr('class', 'header-row');

    const groupCellContainer = header
        .append('div')
        .datum({ label: 'key' })
        .attr('class', 'list-cell group-cell')
        .text('Group');
    groupCellContainer.on('click', function(d) {
        chart.config.sort_alpha = true;
        chart.config.sort_column = 'key';
        chart.config.sort_direction =
            chart.config.sort_direction === 'ascending' ? 'descending' : 'ascending';
        chart.controls.sortCheckbox.property('checked', true);
        chart.draw();
    });

    const valueCellContainers = header
        .selectAll('div.value-cell')
        .data(d => chart.config.metrics.filter(f => f.visible))
        .enter()
        .append('div')
        .attr('class', 'list-cell value-cell')
        .style('width', d => {
            return (
                (config.show_sparklines && d.showSparkline ? config.spark.width + 50 : 50) + 'px'
            );
        });
    const valueCells = valueCellContainers
        .append('div')
        .classed('value', true)
        .style('width', '100%')
        .text(d => d.label);
    valueCells.on('click', function(d) {
        chart.config.sort_alpha = false;
        chart.config.sort_column = d.label;
        d.sort_direction = d.sort_direction === 'ascending' ? 'descending' : 'ascending';
        chart.config.sort_direction = d.sort_direction;
        chart.controls.sortCheckbox.property('checked', false);
        chart.draw();
    });

    header
        .selectAll('.list-cell')
        .filter(d => d.label === this.config.sort_column)
        .append('span')
        .classed('sort-direction', true)
        .html(chart.config.sort_direction === 'ascending' ? '&uarr;' : '&darr;');
}
