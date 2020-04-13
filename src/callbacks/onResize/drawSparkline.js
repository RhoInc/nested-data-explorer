import defineData from './drawSparkline/data';
import defineY from './drawSparkline/y';
import defineSvg from './drawSparkline/svg';
import defineG from './drawSparkline/g';
import defineOverlay from './drawSparkline/overlay';
import drawPoint from './drawSparkline/drawPoint';
import drawLine from './drawSparkline/drawLine';
import drawBar from './drawSparkline/drawBar';
//import drawHistogram from './drawSparkline/drawHistogram';
import lineEvents from './drawSparkline/lineEvents';

export default function drawSparkline(raw, cell, fillEmptyCells, type) {
    if (type === undefined) type = 'line';
    const spark = this.config.spark;
    const data = defineData(spark, raw, fillEmptyCells);
    const y = defineY(type, data, spark);
    const svg = defineSvg(cell, spark);
    const g = defineG(svg, data);
    const overlay = defineOverlay(g, spark);
    const point = data.length === 1 ? drawPoint(g, spark, y) : null;
    const line = type === 'line' ? drawLine(spark, y, svg, data, g) : null;
    const bar = type === 'bar' ? drawBar(g, y, spark) : null;
    lineEvents.call(this, g);
}
