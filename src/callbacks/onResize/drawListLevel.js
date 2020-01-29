import drawSparkline from './drawSparkline';
export default function drawListLevel(wrap, nest, drawHeader) {
    let chart = this;
    let config = this.config;
    let ul = wrap.append('ul');
    if (drawHeader) {
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
    let lis = ul
        .selectAll('li.value-row')
        .data(nest)
        .enter()
        .append('li')
        .attr('class', 'value-row')
        .classed('has-children', d => d.values.children.length > 0);

    lis.append('div')
        .attr('class', 'list-cell group-cell')
        .html(
            d =>
                '&nbsp;&nbsp;&nbsp;'.repeat(d.values.level - 1) +
                "<span class='group-name'>" +
                d.key +
                '</span>'
        )
        .style(
            'background',
            d =>
                'linear-gradient(90deg, #CCC ' +
                d3.format('.0%')(d.values.percent) +
                ', #FFF ' +
                d3.format('.0%')(d.values.percent) +
                ')'
        );

    let value_cells = lis
        .selectAll('div.value-cell')
        .data(d => d.values.metrics.filter(f => f.visible))
        .enter()
        .append('div')
        .attr('class', 'list-cell value-cell')
        .style('width', d => (config.show_sparklines & d.showSparkline ? 150 : 50));

    if (config.show_sparklines) {
        value_cells
            .append('div')
            .datum(d => d)
            .attr('class', 'sparkline')
            .classed('hidden', d => !d.showSparkline)
            .each(function(d) {
                drawSparkline.call(chart, d.sparkline, d3.select(this));
            });
    }

    value_cells
        .append('div')
        .attr('class', 'value')
        .text(d => d.formatted)
        .attr('title', d => (d.title ? d.title : null));

    lis.each(function(d) {
        if (d.values.children.length > 0) {
            //click group-cell to show/hide children
            d3.select(this)
                .select('div.group-cell')
                .on('click', function(d) {
                    let toggle = d3.select(this.parentNode).classed('hidden-children');
                    d3.select(this.parentNode).classed('hidden-children', !toggle);
                });

            //draw nested lists for children
            drawListLevel.call(chart, d3.select(this), d.values.children, false);
        }
    });
}
