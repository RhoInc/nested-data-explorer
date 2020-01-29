import makeNestLevel from './onDraw/makeNestLevel';
import makeDateScale from './onDraw/makeDateScale';

export default function onDraw() {
    makeDateScale.call(this);
    this.nested_data = makeNestLevel.call(this, this.config.groups[0], this.filtered_data);
    console.log(this.nested_data);
}
