import makeOverall from './onInit/makeOverall';
import makeDateInterval from './onInit/makeDateInterval';
import initListing from './onInit/initListing';

export default function onInit() {
    makeOverall.call(this);
    makeDateInterval.call(this);
    initListing.call(this);
}
