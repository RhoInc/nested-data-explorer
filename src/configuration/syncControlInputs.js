export default function syncControlInputs(controlInputs, settings) {
    if (settings.use_dates)
        controlInputs.unshift({
            type: 'text',
            label: 'Date Range',
            option: 'date_range',
            require: true,
        });

    //Add filters to default controls.
    if (Array.isArray(settings.filters) && settings.filters.length > 0) {
        settings.filters.forEach(filter => {
            const filterObj = {
                type: 'subsetter',
                value_col: filter.value_col || filter,
                label: filter.label || filter.value_col || filter,
            };
            controlInputs.push(filterObj);
        });
    }

    return controlInputs;
}
