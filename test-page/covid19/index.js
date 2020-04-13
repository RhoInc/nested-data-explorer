fetch('https://covidtracking.com/api/states/daily')
    .then(response => response.json())
    .then(data => {
        // data
        data.forEach(d => {
            d.date_string = d.date.toString();
            d.date_object = d3.time.format('%Y%m%d').parse(d.date_string);
            d.death_rate = d.deathIncrease / d.positiveIncrease;
        });

        // metrics
        const metrics = [
            { value_col: 'deathIncrease', label: 'Deaths' },
            { value_col: 'positiveIncrease', label: 'Cases' },
            {
                value_col: 'death_rate',
                label: 'Death Rate',
                format: '.2%',
                calc: data => {
                    const deaths = d3.sum(data, d => d.deathIncrease);
                    const cases = d3.sum(data, d => d.positiveIncrease);
                    return cases > 0 ? deaths / cases : 0;
                },
            },
            { value_col: 'hospitalizedIncrease', label: 'Hospitalizations' },
            { value_col: 'totalTestResultsIncrease', label: 'Total Tests' },
            { value_col: 'negativeIncrease', label: 'Negative Tests' },
            { value_col: 'pending', label: 'Pending Tests' },
        ];
        metrics.forEach(metric => {
            metric.calc = metric.calc
                ? metric.calc
                : data => d3.sum(data, d => d[metric.value_col]);
            metric.format = metric.format || ',1d';
            metric.showSparkline = true;
            metric.total = false;
        });

        // date ranges
        const minDate = new Date(d3.min(data, d => d.date_object));
        const maxDate = new Date(d3.max(data, d => d.date_object));
        const date_ranges = {
            Yesterday: [moment(maxDate).subtract(1, 'day'), moment(maxDate).subtract(1, 'day')],
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
        };

        // settings
        const settings = {
            metrics,
            date_ranges,
            date_range: date_ranges.Yesterday.map(date => date.toDate()),
            date_col: 'date_string',
            date_format: '%Y%m%d',
            group_options: [{ value_col: 'state', label: 'State' }],
            groups: ['state'],
            sort_column: 'Deaths',
            show_sparklines: true,
            spark: {
                interval: '%d%b%y',
                width: 100,
                height: 25,
                offset: 3,
            },
        };

        // initialize
        const instance = new nestedDataExplorer('#container', settings);
        instance.init(data);
    });
