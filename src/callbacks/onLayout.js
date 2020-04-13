import makeGroupControl from './onLayout/makeGroupControl';
import updateSortCheckbox from './onLayout/updateSortCheckbox';
import updateDateRangeInput from './onLayout/updateDateRangeInput';

export default function onLayout() {
    this.list = this.wrap.append('div').attr('class', 'nested-data-explorer');
    makeGroupControl.call(this);
    updateSortCheckbox.call(this);
    updateDateRangeInput.call(this);
}
