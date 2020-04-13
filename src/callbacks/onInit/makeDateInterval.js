export default function makeDateInterval() {
    let config = this.config;
    if (config.date_col) {
        this.raw_data.forEach(function(d) {
            d.date_parsed = d3.time.format(config.date_format).parse(d[config.date_col]);
            d.date_interval =
                d.date_parsed instanceof Date
                    ? d3.time.format(config.spark.interval)(d.date_parsed)
                    : null;
            return d;
        });
        this.config.date_range =
            Array.isArray(this.config.date_range) &&
            this.config.date_range.length === 2 &&
            this.config.date_range.every(
                date => Object.prototype.toString.call(date) === '[object Date]',
            )
                ? this.config.date_range
                : d3.extent(this.raw_data, d => d.date_parsed).map(date => new Date(date));
    }
}
