fetch('https://covidtracking.com/api/states/daily')
    .then(response => response.json())
    .then(data => {
        const freqs = [
            {
                value_col: 'positive',
                label: 'Cases',
            },
            {
                value_col: 'death',
                label: 'Deaths',
            },
            {
                value_col: 'hospitalized',
                label: 'Hospitalizations',
            },
            {
                value_col: 'total',
                label: 'Total Tests',
            },
            {
                value_col: 'negative',
                label: 'Negative Tests',
            },
            {
                value_col: 'pending',
                label: 'Pending Tests',
            },
        ];
        const nested = d3
            .nest()
            .key(d => d.state)
            .rollup(subset => {
                const summary = {
                    day1: d3.min(subset, d => d.date),
                };
                freqs.forEach(freq => {
                    summary[freq.value_col] = d3.sum(subset, d => d[freq.value_col]);
                });
                subset.forEach(d => {
                    d.day = d.date - summary.day1;
                    d.date_string = d.date.toString();
                    d.date_object = d3.time.format('%Y%m%d').parse(d.date_string);
                    freqs.forEach(freq => {
                        d[`${freq.value_col}_prop`] = d[freq.value_col] / summary[freq.value_col];
                    });
                    d.death_rate = d.death / d.positive;
                });
            })
            .entries(data);
        const minDate = new Date(
            d3.min(data, d => d3.time.format('%Y%m%d').parse(d.date.toString())),
        );
        const maxDate = new Date(
            d3.max(data, d => d3.time.format('%Y%m%d').parse(d.date.toString())),
        );
        const instance = new nestedDataExplorer('#container', {
            sort_column: 'Cases',
            group_options: [{ value_col: 'state', label: 'State' }],
            groups: ['state'],
            metrics: [
                ...freqs.map(freq => {
                    freq.calc = data => d3.sum(data, d => d[freq.value_col]);
                    freq.format = ',1d';
                    freq.showSparkline = true;
                    return freq;
                }),
                {
                    value_col: 'death_rate',
                    label: 'Death Rate',
                    calc: data => d3.mean(data, d => d.death_rate),
                    format: '.2%',
                    showSparkLine: true,
                },
            ],
            date_col: 'date_string',
            date_format: '%Y%m%d',
            date_ranges: {
                'Last 7 Days': [
                    moment(maxDate)
                        .subtract(7, 'days')
                        .add(1, 'day'),
                    maxDate,
                ],
                'Last 2 Weeks': [
                    moment(maxDate)
                        .subtract(2, 'weeks')
                        .add(1, 'day'),
                    maxDate,
                ],
                'Last Month': [
                    moment(maxDate)
                        .subtract(1, 'month')
                        .add(1, 'day'),
                    maxDate,
                ],
            },
            show_sparklines: true,
            spark: {
                interval: '%d%b%y',
                width: 100,
                height: 25,
                offset: 3,
            },
        });
        instance.init(data);
    });
