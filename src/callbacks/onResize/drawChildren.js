import makeNestLevel from '../onDraw/makeNestLevel';
import drawListLevel from './drawListLevel';

export default function drawChildren(li, iterate) {
    let chart = this;
    let li_data = li.datum();
    let pending = li_data.values.childrenStatus == 'pending';

    //if the children data is pending calculate the nest and draw the ul
    if (pending) {
        li_data.values.children = makeNestLevel.call(
            chart,
            li_data.values.childrenKey,
            li_data.values.raw
        );
        li_data.values.childrenStatus = 'ready';
        drawListLevel.call(chart, li, li_data.values.children, false, iterate);
    } else if (iterate) {
        //check for children with 'pending' status
        li.select('ul')
            .selectAll('li')
            .each(function(d) {
                drawChildren.call(chart, d3.select(this), true);
            });
    }
}
