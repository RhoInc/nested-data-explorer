import makeGroupControl from './onLayout/makeGroupControl';

export default function onLayout() {
    let chart = this;
    this.list = chart.wrap.append('div').attr('class', 'nested-data-explorer');
    makeGroupControl.call(this);
}
