import mouseover from './lineEvents/mouseover';
import mouseout from './lineEvents/mouseout';
import click from './lineEvents/click';

export default function lineEvents(g) {
    const chart = this;

    g.on('mouseover', function(d) {
        mouseover.call(this, d, chart);
    })
        .on('mouseout', function(d) {
            mouseout.call(this, d, chart);
        })
        .on('click', function(d) {
            click.call(this, d, chart);
        });
}
