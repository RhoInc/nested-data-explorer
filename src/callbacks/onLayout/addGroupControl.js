export default function addGroupControl(start) {
    let chart = this;
    let config = this.config;
    start = start ? start : 'none';

    // update the config
    config.raw_groups.push(start);
    config.groups = d3.set(config.raw_groups.filter(f => f != 'none')).values();
    const pos = config.raw_groups.length - 1;
    //note that 'overall' is in the first spot (i=0) in the raw_groups array, but doesn't have a control

    //make the control
    let select = this.groupControl.insert('select', 'span.addGroupControl');
    select
        .selectAll('option')
        .data(config.group_options)
        .enter()
        .append('option')
        .text(d => d.label)
        .property('selected', d => d.value_col == start);

    select.on('change', function(d) {
        let label = this.value;
        let col = config.group_options.find(f => f.label == label)['value_col'];

        config.raw_groups[pos] = col;
        config.groups = d3.set(config.raw_groups.filter(f => f != 'none')).values();
        console.log(config.raw_groups);
        console.log(config.groups);
        chart.draw();
        /*
        config.nested_data = makeNestLevel(config.groups[0], data)
        config.chart.select("ul").remove()
        drawLevel(config.chart, config.nested_data)
        */
    });
}
