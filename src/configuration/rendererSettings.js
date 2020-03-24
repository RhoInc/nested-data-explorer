export default function rendererSettings() {
    return {
        group_options: [],
        groups: [],
        metrics: [],
        show_count: true,
        show_percent: true,
        sort_alpha: true,
        show_sparklines: false,
        date_col: null,
        date_format: null, //if specified, will attempt to parse date_col with d3.time.format(date_format)
        show_overall: true,
        spark: {
            interval: '%Y-%m',
            width: 100,
            height: 25,
            offset: 3
        },
        filters: [] //updated in sync settings
    };
}
