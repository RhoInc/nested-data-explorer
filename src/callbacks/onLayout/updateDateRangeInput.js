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
                startDate: minDate,
                endDate: maxDate,
                minDate,
                maxDate,
                ranges:
                    this.config.date_ranges && Object.keys(this.config.date_ranges).length > 0
                        ? Object.assign({ All: [minDate, maxDate] }, this.config.date_ranges)
                        : null,
            },
            // callback
            (start, end, label) => {
                this.raw_data = this.initial_data.filter(
                    d => start <= d.date_parsed && d.date_parsed <= end,
                );
                this.draw();
            },
        );
    }
}
