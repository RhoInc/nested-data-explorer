export default function updateGroupControl() {
    let config = this.config;
    config.group_options = config.group_options.sort(function(a, b) {
        let index_a = config.groups.indexOf(a.value_col);
        let index_b = config.groups.indexOf(b.value_col);

        let a_val = index_a == -1 ? 9999 : index_a;
        let b_val = index_b == -1 ? 9999 : index_b;

        return a_val - b_val;
    });

    this.groupControl
        .select('ul')
        .selectAll('li')
        .data(config.group_options, d => d.value_col)
        .order()
        .classed('active', d => config.groups.indexOf(d.value_col) > -1);
}
