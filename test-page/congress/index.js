const settings = {
    group_options: [
        { value_col: 'full_name', label: 'Name' },
        { value_col: 'type', label: 'Chamber' },
        { value_col: 'gender', label: 'Gender' },
        { value_col: 'state', label: 'State' },
        { value_col: 'party', label: 'Party' },
    ],
    groups: ['type', 'party'],
    date_col: 'birthday',
    date_format: '%m/%d/%Y',
    show_sparklines: true,
    spark: {
        interval: '%Y',
        width: 100,
        height: 25,
        offset: 4,
    },
};
const chart = nestedDataExplorer('#container', settings);
d3.csv('legislators-current.csv', function(data) {
    chart.init(data);
});
