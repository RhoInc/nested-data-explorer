export default function svg(cell, spark) {
    return cell.append('svg').attr({
        width: spark.width,
        height: spark.height,
    });
}
