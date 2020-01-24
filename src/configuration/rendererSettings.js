export default function rendererSettings() {
    return {
        group_options: [],
        groups: [],
        metrics: [],
        show_count: true,
        show_percent: true,
        sort_alpha: false,
        show_sparklines: false,
        date_col: null,
        date_format: null, //if specified, will attempt to parse date_col with d3.time.format(date_format)
        spark: {
            interval: '%Y-%m',
            count: 12, //show the last x values for the interval
            width: 100,
            height: 25,
            offset: 4
        },
        filters: [] //updated in sync settings
    };
}
