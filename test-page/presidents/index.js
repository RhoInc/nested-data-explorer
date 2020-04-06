const settings = {
    group_options: [
        { value_col: 'Presidency', label: 'Presidency' },
        { value_col: 'President', label: 'President' },
        { value_col: 'Party', label: 'Party' },
        { value_col: 'Home State', label: 'Home State' },
    ],
    groups: ['Party'],
    date_col: 'Took office',
    date_format: '%d/%m/%Y',
    show_sparklines: true,
    spark: {
        interval: '%Y',
        width: 100,
        height: 25,
        offset: 4,
    },
};
const chart = nestedDataExplorer('#container', settings);
d3.csv('presidents.csv', function(data) {
    chart.init(data);
});
