const settings = {
    group_options: [
        { value_col: 'USUBJID', label: 'Subject ID' },
        { value_col: 'SITE', label: 'Site' },
        { value_col: 'SEX', label: 'Sex' },
        { value_col: 'RACE', label: 'Race' },
        { value_col: 'ARM', label: 'Arm' },
        { value_col: 'TEST', label: 'Test' },
    ],
    groups: ['TEST', 'USUBJID'],
    metrics: [
        {
            label: 'Avg. Test Value',
            calc: d => d3.mean(d, d => d.STRESN),
            format: '0.1f',
            fillEmptyCells: false,
        },
    ],
    date_col: 'DT',
    date_format: '%Y-%m-%d',
    show_sparklines: true,
    show_percent: false,
};

const chart = nestedDataExplorer('#container', settings);
d3.csv(
    'https://raw.githubusercontent.com/RhoInc/data-library/master/data/clinical-trials/renderer-specific/adbds.csv',
    function(data) {
        chart.init(data);
    },
);
