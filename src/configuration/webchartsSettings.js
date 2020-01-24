export default function webchartsSettings() {
    return {
        x: {
            column: null,
            type: 'ordinal'
        },
        y: {
            column: '',
            type: 'linear'
        },
        marks: [
            {
                type: 'bar',
                per: null
            }
        ],
        max_width: 900
    };
}
