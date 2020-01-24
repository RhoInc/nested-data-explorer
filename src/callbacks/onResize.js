import drawListLevel from './onResize/drawListLevel';

export default function onResize() {
    this.wrap.select('svg').style('display', 'none');
    this.list.selectAll('*').remove();

    if (this.filtered_data.length > 0) {
        drawListLevel.call(this, this.list, this.nested_data, true);
    } else {
        this.list
            .append('span')
            .text('No Data Selected. Update the filters or refresh the page to see the list. ');
    }
}
