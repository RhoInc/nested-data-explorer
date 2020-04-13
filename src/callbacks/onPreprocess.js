export default function onPreprocess() {
    // Filter data on date range.
    if (this.config.date_col)
        this.raw_data = this.initial_data.filter(
            d =>
                this.config.date_range[0] <= d.date_parsed &&
                d.date_parsed <= this.config.date_range[1],
        );
}
