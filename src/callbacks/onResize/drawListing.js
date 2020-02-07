export default function drawListing(d, label) {
    let chart = this;
    chart.listing.wrap.classed('hidden', false);
    chart.listing.wrap.select('h3').text('Showing ' + d.length + ' records for ' + label);
    chart.listing.draw(d);
    chart.wrap.classed('hidden', true);
    chart.controls.wrap.classed('hidden', true);
}
