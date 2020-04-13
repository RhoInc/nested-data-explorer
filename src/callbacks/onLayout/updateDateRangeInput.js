export default function updateDateRangeInput() {
    if (this.config.use_dates) {
        const dateRangeInput = this.controls.wrap
            .selectAll('.control-group')
            .filter(d => d.label === 'Date Range')
            .selectAll('input');

        // Set initial date range.
        const minDate = new Date(d3.min(this.raw_data, d => d.date_parsed));
        const maxDate = new Date(d3.max(this.raw_data, d => d.date_parsed));

        // Initialize daterangepicker.
        $(dateRangeInput.node()).daterangepicker(
            // options
            {
                startDate: this.config.date_range[0],
                endDate: this.config.date_range[1],
                minDate,
                maxDate,
                ranges:
                    this.config.date_ranges && Object.keys(this.config.date_ranges).length > 0
                        ? Object.assign({ All: [minDate, maxDate] }, this.config.date_ranges)
                        : null,
            },
            // callback
            (start, end, label) => {
                this.config.date_range = [start.toDate(), end.toDate()];
                this.draw();
            },
        );
    }
}
