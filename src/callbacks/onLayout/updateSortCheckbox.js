export default function updateSortCheckbox() {
    const chart = this;

    this.controls.sortCheckbox = this.controls.wrap
        .selectAll('.control-group')
        .filter(d => d.label === 'Sort Alphabetically?')
        .selectAll('input')
        .on('change', function() {
            chart.config.sort_alpha = this.checked;
            chart.config.sort_direction = this.checked ? 'ascending' : 'descending';
            chart.config.sort_column = this.checked ? 'key' : 'n';
            chart.draw();
        });
}
