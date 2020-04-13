export default function g(svg, d) {
    return svg
        .selectAll('g')
        .data(d)
        .enter()
        .append('g');
}
