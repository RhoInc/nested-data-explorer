import makeGroupControl from './onLayout/makeGroupControl';

export default function onLayout() {
    let chart = this;
    this.list = chart.wrap.append('list');
    makeGroupControl.call(this);
}
