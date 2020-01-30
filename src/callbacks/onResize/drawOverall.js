import drawListLevel from './drawListLevel';
import makeNestLevel from '../onDraw/makeNestLevel';

export default function drawOverall() {
    let overall_wrap = this.list.append('ul').attr('class', 'overall-row');
    this.overall_data = makeNestLevel.call(this, 'overall', this.filtered_data);
    drawListLevel.call(this, overall_wrap, this.overall_data);
}
