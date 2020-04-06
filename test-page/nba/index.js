const settings = {
    group_options: [
        { value_col: 'Player', label: 'Player' },
        { value_col: 'Pos', label: 'Pos' },
        { value_col: 'Age', label: 'Age' },
        { value_col: 'Tm', label: 'Team' },
    ],
    groups: ['Pos'],
    metrics: [
        { label: 'Points', calc: d => d3.sum(d, d => d.PTS), format: '0.0f' },
        { label: 'Minutes', calc: d => d3.sum(d, d => d.MP), format: '0.0f' },
        {
            label: 'Points Per Minute',
            calc: function(d) {
                return +this.Points / +this.Minutes;
            },
            format: '0.2f',
        },
    ],
};
const chart = nestedDataExplorer('#container', settings);
d3.csv('2020stats.csv', function(data) {
    data.forEach(function(m) {});
    chart.init(data);
});
