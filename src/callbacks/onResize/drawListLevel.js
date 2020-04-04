import drawSparkline from './drawSparkline';
import drawHeader from './drawHeader';
import drawChildren from './drawChildren';
import drawListing from './drawListing';

export default function drawListLevel(wrap, nest, header, iterate) {
    const chart = this;
    const config = this.config;
    if (iterate == undefined) iterate = false;
    const ul = wrap.append('ul').classed('one-list-to-rule-them-all', true);
    if (header) drawHeader.call(this, ul);

    const lis = ul
        .selectAll('li.value-row')
        .data(nest)
        .enter()
        .append('li')
        .attr('class', 'value-row')
        .classed('has-children', d => d.values.hasChildren);

    const group_cells = lis
        .append('div')
        .attr('class', 'list-cell group-cell')
        .property('title', d => d.key);
    group_cells
        .append('span')
        .attr('class', d => `group-name group-name--${d.values.level}`)
        .style('padding-left', d => `${d.values.level * 24}px`)
        .text(d => d.key);
    //.html(
    //    d =>
    //        '&nbsp;&nbsp;&nbsp;'.repeat(d.values.level > 0 ? d.values.level : 0) +
    //        "<span class='group-name'>" +
    //        d.key +
    //        '</span>'
    //);

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

    const value_cells = lis
        .selectAll('div.value-cell')
        .data(d => d.values.metrics.filter(f => f.visible))
        .enter()
        .append('div')
        .attr('class', 'list-cell value-cell')
        .style('width', d =>
            config.show_sparklines & d.showSparkline ? config.spark.width + 50 : 50
        )
        .style('height', config.spark.height > 25 ? config.spark.height : 25);

    if (config.show_sparklines) {
        value_cells
            .append('div')
            .datum(d => d)
            .attr('class', 'sparkline')
            .classed('hidden', d => !d.showSparkline)
            .each(function(d) {
                drawSparkline.call(chart, d.sparkline, d3.select(this), d.fillEmptyCells, d.type);
            });
    }

    value_cells
        .append('div')
        .attr('class', 'value')
        .text(d => d.formatted)
        .attr('title', d => (d.title ? d.title : null));

    value_cells
        .filter(f => f.label == 'n')
        .select('div.value')
        .classed('listing-click', true)
        .on('click', function(d) {
            drawListing.call(chart, d.raw, d.keyDesc);
        });
    lis.each(function(d) {
        const li = d3.select(this);

        li.on('mouseover', function() {
            d3.select(this).classed('nde-hover', true);
        }).on('mouseout', function() {
            d3.select(this).classed('nde-hover', false);
        });

        if (d.values.hasChildren) {
            //iterate (draw the children ul) if requested
            if (iterate) drawChildren.call(chart, li, true);

            //click group-cell to show/hide children
            li.select('div.group-cell').on('click', function(d) {
                const parent_li = d3.select(this.parentNode);

                //if ul exists toggle it's visibility
                if (!parent_li.select('ul').empty()) {
                    const toggle = !parent_li.select('ul').classed('hidden');
                    parent_li.select('ul').classed('hidden', toggle);
                }

                //try to draw any children (iteratively, if shift or ctrl is down )
                drawChildren.call(chart, parent_li, d3.event.shiftKey || d3.event.ctrlKey);
            });
        }
    });
}
