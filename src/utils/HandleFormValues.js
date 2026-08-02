export const toOriginalFormat = (data) => {
    const { values, ...rest } = data;

    const originalValues = Object.keys(values || {}).reduce((acc, type) => {
        values[type].forEach((field) => {
            acc[field.name] = field.value
            acc[`${type}_${field.name}_for_manage`] = field.value;
        });

        return acc;
    }, {});

    return {
        ...rest,
        values: originalValues,
    };
};

export default toOriginalFormat;