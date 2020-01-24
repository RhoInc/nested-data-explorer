import makeOverall from './onInit/makeOverall';
import makeDateInterval from './onInit/makeDateInterval';

export default function onInit() {
    makeOverall.call(this);
    makeDateInterval.call(this);
}
