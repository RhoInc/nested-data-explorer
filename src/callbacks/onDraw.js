import makeNestLevel from './onDraw/makeNestLevel';
import makeDateScale from './onDraw/makeDateScale';
import defineMetricScales from './onDraw/defineMetricScales';

export default function onDraw() {
    this.listing.wrap.classed('hidden', true);
    this.wrap.classed('hidden', false);
    this.controls.wrap.classed('hidden', false);
    makeDateScale.call(this);
    this.nested_data = makeNestLevel.call(this, this.config.groups[0], this.filtered_data);
    defineMetricScales.call(this);
}
