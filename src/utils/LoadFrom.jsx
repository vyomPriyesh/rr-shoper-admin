import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import InputField from './InputField'
import { userState } from '../context/UserContext'
import dayjs from 'dayjs'

const normalizeFormFields = (payload) => {
    if (Array.isArray(payload)) return payload

    if (Array.isArray(payload?.fields)) return payload.fields
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.form)) return payload.form

    if (payload && typeof payload === 'object') {
        return Object.entries(payload).map(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return {
                    name: key,
                    label: value.label || key,
                    type: value.type || 'text',
                    placeholder: value.placeholder || '',
                    options: value.options || [],
                }
            }

            return {
                name: key,
                label: key,
                type: 'text',
                placeholder: '',
                options: [],
            }
        })
    }

    return []
}

const LoadFrom = forwardRef(({ formFields, title, isLoading, formValues, setFormValues }, ref) => {

    const { options } = userState()

    const [errors, setErrors] = useState({});

    const capitalize = useCallback((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(), []);
    const fields = useMemo(() => normalizeFormFields(formFields), [formFields]);
    const requiredFields = useMemo(() => fields.filter(list => list.required).map(list => list.label).filter(label => !formValues[label]), [fields, formValues])

    const validateDependValue = useMemo(() => {
        const dependFields = fields.filter(field => field.depend_on_parent_field);
        return dependFields.filter(field => {
            const parentFieldValue = formValues[field.depend_parent_field];
            return parentFieldValue?.toLowerCase() == field.depend_parent_field_value?.toLowerCase() && !formValues[field.label];
        }).map(field => field.label);
    }, [formValues])

    const handleValidate = useCallback(() => {
        const requiredFieldsErrors = requiredFields.concat(validateDependValue).reduce((acc, field) => {
            acc[field] = `${capitalize(field)} is required`;
            return acc;
        }, {});

        setErrors(requiredFieldsErrors)
        if (Object.keys(requiredFieldsErrors).length > 0) {
            return false
        }

        return true
    }, [requiredFields, capitalize, validateDependValue])

    useImperativeHandle(ref, () => ({
        handleValidate
    }));


    const handleFieldChange = (name, value, type, multiple, isManual) => {
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
            ...(multiple && {
                [`add_mutiple_${name}_for_manage`]: true,
            }),
            ...(isManual && {
                [`add_manully_${name}_for_manage`]: true,
            }),
            [`${type}_${name}_for_manage`]: value
        }))

        const isFieldEmpty = ({ type, multiple, value }) => {
            if (multiple) {
                return !Array.isArray(value) || value.length === 0
            }

            if (type === "upload") {
                return value == null
            }

            return value == null || (typeof value === "string" && value.trim() === "")
        }

        setErrors((prev) => {
            const updatedErrors = { ...prev }

            const field = fields.find((item) => item.label === name)
            const dependFiels = fields.filter((item) => item.depend_parent_field === field?.label)
            for (const item of dependFiels) {
                if (item?.depend_parent_field_value?.toLowerCase() == value?.toLowerCase()) {
                    if (isFieldEmpty({ type: item.type, multiple: item.multiple, value: formValues[item.label] })) {
                        updatedErrors[item.label] = `${capitalize(item.label)} is required`
                    }
                } else {
                    delete updatedErrors[item.label]
                }
            }

            if (!field?.required) {
                delete updatedErrors[name]
                return updatedErrors
            }

            if (isFieldEmpty({ type, multiple, value })) {
                updatedErrors[name] = `${capitalize(name)} is required`
            } else {
                delete updatedErrors[name]
            }

            return updatedErrors
        })
    }

    const renderField = useCallback((field, index, errors) => {
        const fieldName = field.name || field.key || field.field_name || field.label || `field_${index}`
        const fieldLabel = field.label || field.title || fieldName
        const errorMsg = errors[fieldLabel]
        const fieldType = field.type || 'text'
        const optionsData = field.manully ? options[field.dynamic] : Array.isArray(field.options) ? field.options : []
        const selectOptions = optionsData?.map((option) => {
            if (typeof option === 'string') {
                return { label: option, value: option }
            }

            return {
                label: option.label || option.value || option.name || '',
                value: option.value || option.name || '',
            }
        })

        if (field?.depend_parent_field_value?.toLowerCase() !== formValues[field.depend_parent_field]?.toLowerCase()) {
            return null
        }

        switch (fieldType) {
            case 'textarea':
                return (
                    <div key={fieldName} className='flex flex-col gap-2'>
                        <InputField
                            label={fieldLabel}
                            type='textarea'
                            placeholder={field.placeholder || `Enter ${fieldLabel}`}
                            value={formValues[fieldName]}
                            onChange={(e) => handleFieldChange(fieldName, e.target.value, fieldType)}
                            rows={4}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
            case 'date':
                return (
                    <div key={fieldName} className='flex flex-col gap-2'>
                        <InputField
                            type='date'
                            label={fieldLabel}
                            placeholder={field.placeholder || `Select ${fieldLabel}`}
                            value={formValues[fieldName]}
                            format='DD-MM-YYYY'
                            onChange={(e) => handleFieldChange(fieldName, dayjs(e).format('DD-MM-YYYY'), fieldType)}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
            case 'select':
            case 'dropdown':
                return (
                    <div key={fieldName} className='flex flex-col gap-2'>
                        <InputField
                            label={fieldLabel}
                            type={field?.multipleSelect ? 'drop-multi-select' : 'drop-single-select'}
                            placeholder={field.placeholder || `Select ${fieldLabel}`}
                            options={selectOptions}
                            value={formValues[fieldName]}
                            onChange={(e) => handleFieldChange(fieldName, e, fieldType, field?.multipleSelect, field.manully)}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
            case 'input':
                return (
                    <div key={fieldName} className='flex flex-col gap-2'>
                        <InputField
                            label={fieldLabel}
                            type='text'
                            placeholder={field.placeholder || `Enter ${fieldLabel}`}
                            value={formValues[fieldName]}
                            onChange={(e) => handleFieldChange(fieldName, e.target.value, fieldType)}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
            case 'number':
                return (
                    <div key={fieldName} className='flex flex-col gap-2'>
                        <InputField
                            type='number'
                            label={fieldLabel}
                            maxLength={field.maxLength}
                            placeholder={field.placeholder || `Enter ${fieldLabel}`}
                            value={formValues[fieldName]}
                            onChange={(e) => handleFieldChange(fieldName, e, fieldType)}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
            case 'upload':
                return (
                    <div key={fieldName} className='flex flex-col gap-2 col-span-3'>
                        <InputField
                            type='upload'
                            label={fieldLabel}
                            multiple={field.multiple || false}
                            value={formValues[fieldName]}
                            imageLimit={field.imageLimit}
                            onChange={(e) => handleFieldChange(fieldName, e, fieldType, field.multiple)}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
            default:
                return (
                    <div key={fieldName} className='flex flex-col gap-2'>
                        <InputField
                            type='text'
                            label={fieldLabel}
                            className='!h-12'
                            // placeholder={field.placeholder || `Enter ${fieldLabel}`}
                            value={formValues[fieldName]}
                            onChange={(e) => handleFieldChange(fieldName, e.target.value, fieldType)}
                        />
                        <span className='text-red-500 text-sm'>{errorMsg}</span>
                    </div>
                )
        }
    }, [formValues, handleFieldChange, options])


    return (
        title && (
            <>
                {isLoading ? (
                    <p className="text-sm text-gray-500">Loading form...</p>
                ) : fields.length > 0 ? (
                    fields.map((field, index) => renderField(field, index, errors))
                ) : (
                    <p className="text-sm text-gray-500">No form fields found for this ticket.</p>
                )}
            </>
        )
    )
})



export default LoadFrom
