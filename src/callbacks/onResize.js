import drawListLevel from './onResize/drawListLevel';
import drawOverall from './onResize/drawOverall';

export default function onResize() {
    this.wrap.select('svg').style('display', 'none');
    this.list.selectAll('*').remove();

    if (this.filtered_data.length > 0) {
        drawListLevel.call(this, this.list, this.nested_data, true);
        if (this.config.show_overall) drawOverall.call(this);
    } else {
        this.list
            .append('span')
            .text('No Data Selected. Update the filters or refresh the page to see the list. ');
    }
}
