import updateGroupOptions from './updateGroupOptions';

export default function makeGroupControl() {
    let chart = this;
    let config = this.config;
    this.groupControl = this.controls.wrap.insert('div', '*').attr('class', 'groupControl');
    this.groupControl
        .append('span')
        .text('Group By:')
        .append('sup')
        .html('&#9432;')
        .style('cursor', 'help')
        .attr('title', 'Drag items to reorder levels.\n Double click items to show/hide levels.');
    let group_ul = this.groupControl.append('ul').attr('id', 'group-control');

    group_ul
        .selectAll('li')
        .data(config.group_options, d => d.value_col)
        .enter()
        .append('li')
        .text(d => d.label);

    //double click an item to add/remove from active groups
    group_ul.selectAll('li').on('dblclick', function(d) {
        // add/remove from active groups
        let active = config.groups.indexOf(d.value_col) > -1;
        if (active) {
            config.groups = config.groups.filter(f => f != d.value_col);
        } else {
            config.groups.push(d.value_col);
        }
        updateGroupOptions.call(chart);
        chart.draw();
    });

    //make the list draggable with sortable
    var groupList = document.getElementById('group-control');
    var sortable = Sortable.create(groupList, {
        fallbackOnBody: true,
        onChange: function(evt) {
            let n_groups = config.groups.length;
            let ul = d3.select(this.el);
            ul.selectAll('li').classed('active', function(d, i) {
                return i < n_groups;
            });
        },
        onEnd: function(evt) {
            // update the data for the group list
            let ul = d3.select(this.el);
            let lis = ul.selectAll('li');
            config.group_options = lis.data();
            config.groups = ul
                .selectAll('li.active')
                .data()
                .map(m => m.value_col);

            //draw the chart
            updateGroupOptions.call(chart);
            chart.draw();
        }
    });

    updateGroupOptions.call(this);
}
