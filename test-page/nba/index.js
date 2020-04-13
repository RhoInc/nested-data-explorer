d3.csv(
    './2020stats.csv',
    d => {
        return d;
    },
    data => {
        const settings = {
            group_options: [
                { value_col: 'Player', label: 'Player' },
                { value_col: 'Pos', label: 'Pos' },
                { value_col: 'Age', label: 'Age' },
                { value_col: 'Tm', label: 'Team' },
            ],
            groups: ['Pos'],
            metrics: [
                { label: 'Points', calc: d => d3.sum(d, d => d.PTS), format: ',1d' },
                { label: 'Minutes', calc: d => d3.sum(d, d => d.MP), format: ',1d' },
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
        chart.init(data);
    },
);
