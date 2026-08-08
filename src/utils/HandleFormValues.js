export const toOriginalFormat = (data) => {
    const { values, ...rest } = data;

    const originalValues = Object.keys(values || {}).reduce((acc, type) => {
        values[type].forEach((field) => {
            const { name, value, extraField } = field;
            acc[name] = value
            acc[`${type}_${name}_for_manage`] = value;
            if (extraField) {
                if ("add_mutiple" in extraField) {
                    acc[`add_mutiple_${name}_for_manage`] =
                        extraField.add_mutiple;
                }

                if ("add_manully" in extraField) {
                    acc[`add_manully_${name}_for_manage`] =
                        extraField.add_manully;
                }
            }
        });

        return acc;
    }, {});

    return {
        ...rest,
        values: originalValues,
    };
};

export default toOriginalFormat;