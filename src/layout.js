import { select } from 'd3';

export default function layout(element) {
    const container = select(element);
    container
        .append('div')
        .classed('wc-component', true)
        .attr('id', 'nde-controls');
    container
        .append('div')
        .classed('wc-component', true)
        .attr('id', 'nde-table');
    container
        .append('div')
        .classed('wc-component', true)
        .attr('id', 'nde-details');
}
