const settings = {
    group_options: [
        { value_col: 'AEBODSYS', label: 'Body System' },
        { value_col: 'AEDECOD', label: 'Preferred Term' },
        { value_col: 'SITE', label: 'Site' },
        { value_col: 'SEX', label: 'Sex' },
        { value_col: 'RACE', label: 'Race' },
        { value_col: 'ARM', label: 'Arm' },
        { value_col: 'AESEV', label: 'Severity' },
        { value_col: 'AEREL', label: 'Related' },
        { value_col: 'AEOUT', label: 'Outcome' },
    ],
    groups: [
        'AEBODSYS',
        'AEDECOD',
        //"Artifact",
        //"Subartifact"
    ],
    metrics: [],
    date_col: 'ASTDT',
    date_format: '%Y-%m-%d',
    show_sparklines: true,
    spark: { height: 50, width: 200 },
};

const chart = nestedDataExplorer('#container', settings);
d3.csv(
    'https://raw.githubusercontent.com/RhoInc/data-library/master/data/clinical-trials/adam/adae.csv',
    function(data) {
        chart.init(data);
    },
);
