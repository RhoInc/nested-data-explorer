import makeNestLevel from './onDraw/makeNestLevel';
import makeDateScale from './onDraw/makeDateScale';

export default function onDraw() {
    var chart = this;
    chart.listing.wrap.classed('hidden', true);
    chart.wrap.classed('hidden', false);
    chart.controls.wrap.classed('hidden', false);
    makeDateScale.call(this);
    this.nested_data = makeNestLevel.call(this, this.config.groups[0], this.filtered_data);
}
