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
                ranges: {
                    All: [minDate, maxDate],
                    'Last 7 Days': [
                        moment(maxDate)
                            .subtract(7, 'days')
                            .add(1, 'day'),
                        maxDate,
                    ],
                    'Last 2 Weeks': [
                        moment(maxDate)
                            .subtract(2, 'weeks')
                            .add(1, 'day'),
                        maxDate,
                    ],
                    'Last Month': [
                        moment(maxDate)
                            .subtract(1, 'month')
                            .add(1, 'day'),
                        maxDate,
                    ],
                },
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
