export default function data(spark, raw, fillEmptyCells) {
    return spark.dates
        .map(function(date) {
            const obj = { date };
            const match = raw.filter(d => d.date === date);
            obj.value = match.length > 0 ? match[0].value : fillEmptyCells ? 0 : null;

            return obj;
        })
        .filter(d => d.value !== null);
}
