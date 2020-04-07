export default function listingSettings(settings) {
    return Object.assign(
        {
            cols:
                Array.isArray(settings.details) && settings.details.length
                    ? settings.details.map(detail => detail.value_col || detail)
                    : null,
            headers:
                Array.isArray(settings.details) && settings.details.length
                    ? settings.details.map(detail => detail.label || detail.value_col || detail)
                    : null,
        },
        settings,
    );
}
