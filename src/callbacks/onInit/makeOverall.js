export default function makeOverall() {
    this.raw_data.forEach(function(d) {
        d.overall = 'Overall';
    });
}
