export default function initListing() {
    let chart = this;
    this.listing.config.cols =
        this.listing.config.cols ||
        Object.keys(this.initial_data[0]).filter(
            f => ['overall', 'date_parsed', 'date_interval'].indexOf(f) == -1,
        );
    this.listing.init([]);
    this.listing.wrap.insert('h3', '*');
    this.listing.wrap
        .insert('div', '*')
        .attr('class', 'closeDetails')
        .append('span')
        .text('<< Return to Table')
        .on('click', function() {
            chart.listing.wrap.classed('hidden', true);
            chart.wrap.classed('hidden', false);
            chart.controls.wrap.classed('hidden', false);
        });
    this.listing.wrap.classed('hidden', true);
}
