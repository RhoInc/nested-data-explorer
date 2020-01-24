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
    }
}
