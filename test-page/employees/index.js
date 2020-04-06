const settings = {
    group_options: [
        { value_col: 'Full Name', label: 'Name' },
        { value_col: 'Gender', label: 'Gender' },
        { value_col: 'City', label: 'City' },
        { value_col: 'State', label: 'State' },
        { value_col: 'Region', label: 'Region' },
    ],
    groups: ['State'],

    date_col: 'Date of Joining',
    date_format: '%m/%d/%y',
    show_sparklines: true,
    spark: {
        interval: '%Y',
        width: 100,
        height: 25,
        offset: 4,
    },
    metrics: [
        {
            label: 'Years',
            calc: d => d3.mean(d, d => d['Age in Company (Years)']),
            format: '0.1f',
            fillEmptyCells: false,
            showSparkline: false,
        },
        {
            label: 'Salary',
            calc: d => d3.mean(d, d => d['Salary']),
            format: '0.3s',
            fillEmptyCells: false,
        },
    ],
};
const chart = nestedDataExplorer('#container', settings);
d3.csv('employees.csv', function(data) {
    console.log(data);
    chart.init(data);
});
