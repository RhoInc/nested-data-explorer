import makeNestLevel from './onDraw/makeNestLevel';

export default function onDraw() {
    let spark = this.config.spark;
    spark.dates = d3.set(this.filtered_data.map(m => m.date_interval)).values();

    spark.dates = spark.dates.sort(d3.ascending);
    spark.x = d3.scale
        .ordinal()
        .domain(spark.dates)
        .rangePoints([spark.offset, spark.width - spark.offset]);

    spark.xBars = d3.scale
        .ordinal()
        .domain(spark.dates)
        .rangeBands([spark.offset, spark.width - spark.offset]);

    spark.rangeband = spark.xBars.rangeBand();
    this.nested_data = makeNestLevel.call(this, this.config.groups[0], this.filtered_data);
}
