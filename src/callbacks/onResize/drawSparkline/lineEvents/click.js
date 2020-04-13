import drawListing from '../../drawListing';

export default function click(d, chart) {
    let value_cell = this.parentElement.parentElement.parentElement;
    let cell_d = d3.select(value_cell).datum();

    let raw = cell_d['raw'].filter(f => f.date_interval == d.date);
    let label = cell_d['keyDesc'] + ' for time = ' + d.date;
    drawListing.call(chart, raw, label);
}
