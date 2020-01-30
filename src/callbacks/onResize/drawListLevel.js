import drawSparkline from './drawSparkline';
import drawHeader from './drawHeader';
import drawChildren from './drawChildren';

export default function drawListLevel(wrap, nest, header, iterate) {
    let chart = this;
    let config = this.config;
    if (iterate == undefined) iterate = false;
    let ul = wrap.append('ul');
    if (header) drawHeader.call(this, ul);

    let lis = ul
        .selectAll('li.value-row')
        .data(nest)
        .enter()
        .append('li')
        .attr('class', 'value-row')
        .classed('has-children', d => d.values.hasChildren);

    lis.append('div')
        .attr('class', 'list-cell group-cell')
        .html(
            d =>
                '&nbsp;&nbsp;&nbsp;'.repeat(d.values.level > 0 ? d.values.level : 0) +
                "<span class='group-name'>" +
                d.key +
                '</span>'
        );

    /* TODO fake little css barchart - could revive later with option? 
        .style(
            'background',
            d =>
                'linear-gradient(90deg, #CCC ' +
                d3.format('.0%')(d.values.percent) +
                ', #FFF ' +
                d3.format('.0%')(d.values.percent) +
                ')'
        );
        */

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
        if (d.values.hasChildren) {
            //iterate (draw the children ul) if requested
            if (iterate) drawChildren.call(chart, d3.select(this), true);

            //click group-cell to show/hide children
            d3.select(this)
                .select('div.group-cell')
                .on('click', function(d) {
                    let li = d3.select(this.parentNode);

                    //if ul exists toggle it's visibility
                    if (!li.select('ul').empty()) {
                        let toggle = !li.select('ul').classed('hidden');
                        li.select('ul').classed('hidden', toggle);
                    }

                    //try to draw any children (iteratively, if shift or ctrl is down )
                    drawChildren.call(chart, li, d3.event.shiftKey || d3.event.ctrlKey);
                });
        }
    });
}
