import addGroupControl from './onLayout/addGroupControl';

export default function onLayout() {
    let chart = this;
    this.list = chart.wrap.append('list');
    this.groupControl = this.controls.wrap.insert('div', '*').attr('class', 'groupControl');
    this.groupControl.append('span').text('Group By:  ');
    this.groupControl
        .append('span')
        .text('+')
        .classed('addGroupControl', true)
        .on('click', function() {
            addGroupControl.call(chart);
        });
    this.config.groups.forEach(function(group) {
        addGroupControl.call(chart, group);
    });
}
