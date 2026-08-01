// components/common/InputField.jsx

import { DatePicker, Image, Input, InputNumber, Select, Switch, Upload } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import { LuEye } from 'react-icons/lu';
import { MdOutlineEdit } from 'react-icons/md';
import { RiDeleteBin6Line, RiUploadCloud2Fill } from 'react-icons/ri';
import ImagesUploadUi from './ImagesUploadUi';
const { TextArea } = Input;


const InputField = (props) => {
    const {
        label,
        type = 'text',

        // common
        placeholder,
        value,
        onChange,

        // textarea
        rows = 5,

        // select
        options = [],
        multiple = false,
        imageLimit,

        className = "",
        ...rest
    } = props;

    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)
    const [focused, setFocused] = useState(false);

    const active = useMemo(() => focused || value, [focused, value]);

    useEffect(() => {
        const handleOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutside)

        return () => {
            document.removeEventListener(
                'mousedown',
                handleOutside
            )
        }
    }, [])

    // multi select logic
    const handleMultiSelect = (itemValue) => {
        if (!Array.isArray(value)) return

        if (value.includes(itemValue)) {
            onChange(
                value.filter((item) => item !== itemValue)
            )
        } else {
            onChange([...value, itemValue])
        }
    }

    {/* <label className="block text-sm font-medium text-heading mb-2">
        {label}
    </label> */}

    // !label ? placeholder : active && placeholder
    // [label, placeholder, active]

    const placeholderText = useMemo(() => placeholder, [placeholder]);
    return (
        <div className="w-full relative">
            {label &&
                <label className="block text-base text-gray-400 mb-2">
                    {label}
                </label>
            }
            {/* ================= INPUT ================= */}
            {type !== "textarea" && type !== 'switch' &&
                type !== "drop-single-select" &&
                type !== "drop-multi-select" &&
                type !== "password" && type !== 'upload' && type !== 'date' && type !== 'number' && (
                    <Input
                        placeholder={placeholderText}
                        onChange={onChange}
                        value={value}
                        type={type}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        {...rest}
                        className={`!w-full !h-10 !rounded-lg !text-base
              !border !border-borderColor
              !px-3 !outline-none !bg-white
              !text-heading
              placeholder:text-[#828589] placeholder:text-sm focus-within:!border-primary hover:!border-primary
              !shadow-none ${className}`}
                    />
                )}
            {type === "number" && (
                <InputNumber
                    placeholder={placeholderText}
                    controls={false}
                    onChange={onChange}
                    value={value}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...rest}
                    className={`!w-full !h-10 !rounded-lg !text-base
              !border !border-borderColor
              !px-3 !outline-none !bg-white
              !text-heading
              placeholder:text-[#8c8e91] placeholder:text-sm focus-within:!border-primary hover:!border-primary
              !shadow-none ${className}`}
                />
            )}
            {type === 'date' && (
                <DatePicker
                    onChange={onChange}
                    placeholder={placeholderText}
                    inputReadOnly
                    type='date'
                    className={`!w-full !h-10 !rounded-lg !text-base
                    !border !border-borderColor
                    !px-3 !outline-none !bg-white
                    !text-heading
                    !shadow-none hover:!border-primary
                    focus-within:!border-primary ${className}`}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...rest}
                />
            )}
            {type === "password" && (
                <Input.Password
                    placeholder={placeholderText}
                    onChange={onChange}
                    value={value}
                    {...rest}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`!w-full !h-10 !rounded-lg !text-base
            !border !border-borderColor
            !px-3 !outline-none !bg-white
            !text-heading
            placeholder:text-[#8c8e91] placeholder:text-sm
            !shadow-none hover:!border-primary
            focus-within:!border-primary ${className}`}
                />
            )}

            {/* ================= TEXTAREA ================= */}
            {type === 'textarea' && (
                <TextArea
                    rows={rows}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholderText}
                    className="
                        w-full rounded-lg border border-borderColor
                        px-2 py-2 resize-none bg-white
                        text-heading
                        placeholder:text-[#8c8e91] placeholder:text-sm
                        transition-all duration-300
                        focus:ring-0 
                        focus:border-primary hover:!border-primary
                    "
                    {...rest}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            )}

            {/* ================= SINGLE SELECT ================= */}
            {(type === 'drop-single-select' || type === 'drop-multi-select') && (
                <>
                    {/* <div
                        className="relative"
                        ref={dropdownRef}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            className="
                            w-full h-14 rounded-lg border border-borderColor
                            px-5 bg-white text-left
                            flex items-center justify-between
                            transition-all duration-300
                            focus:border-primary
                            focus:ring-4 focus:ring-primary/10
                        "
                        >
                            <span
                                className={`${value
                                    ? 'text-heading'
                                    : 'text-[#9CA3AF]'
                                    }`}
                            >
                                {value
                                    ? options.find(
                                        (item) =>
                                            item.value === value
                                    )?.label
                                    : placeholder}
                            </span>

                            <IoChevronDown
                                className={`transition-all duration-300 ${open ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        <div
                            className={`
                            absolute top-full left-0 w-full mt-3 z-50
                            bg-white rounded-2xl border border-borderColor
                            shadow-xl overflow-hidden
                            transition-all duration-300 origin-top
                            ${open
                                    ? 'opacity-100 visible scale-100'
                                    : 'opacity-0 invisible scale-95'
                                }
                        `}
                        >
                            <div className="p-2">
                                {options.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            onChange(item.value)
                                            setOpen(false)
                                        }}
                                        className={`
                                        w-full px-4 py-3 rounded-xl text-left
                                        transition-all duration-200
                                        ${value === item.value
                                                ? 'bg-primary/10 text-primaryDark'
                                                : 'hover:bg-background text-heading'
                                            }
                                    `}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div> */}
                    <Select
                        mode={type == 'drop-multi-select' ? 'multiple' : 'single'}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholderText}
                        className={`!shadow-none !outline-none !w-full py-1.5 !rounded-lg !text-base hover:!border-primary  focus-within:!border-primary !capitalize`}
                        options={options?.map((item) => ({
                            ...item,
                            label:
                                item.label.charAt(0).toUpperCase() +
                                item.label.slice(1),
                        }))}
                        {...rest}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                </>
            )}

            {/* ================= MULTI SELECT ================= */}
            {/* {type === 'drop-multi-select' && (
                <div
                    className="relative"
                    ref={dropdownRef}
                >
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="
                            w-full min-h-[56px] rounded-lg border border-borderColor
                            px-5 py-3 bg-white text-left
                            flex items-center justify-between gap-4
                            transition-all duration-300
                            focus:border-primary
                            focus:ring-4 focus:ring-primary/10
                        "
                    >
                        <div className="flex flex-wrap gap-2">
                            {value?.length > 0 ? (
                                value.map((item, index) => (
                                    <span
                                        key={index}
                                        className="
                                            px-3 py-1 rounded-full
                                            bg-primary/10
                                            text-primaryDark
                                            text-sm font-medium
                                        "
                                    >
                                        {
                                            options.find(
                                                (opt) =>
                                                    opt.value === item
                                            )?.label
                                        }
                                    </span>
                                ))
                            ) : (
                                <span className="text-[#9CA3AF]">
                                    {placeholder}
                                </span>
                            )}
                        </div>

                        <IoChevronDown
                            className={`transition-all duration-300 ${open ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    <div
                        className={`
                            absolute top-full left-0 w-full mt-3 z-50
                            bg-white rounded-2xl border border-borderColor
                            shadow-xl overflow-hidden
                            transition-all duration-300 origin-top
                            ${open
                                ? 'opacity-100 visible scale-100'
                                : 'opacity-0 invisible scale-95'
                            }
                        `}
                    >
                        <div className="max-h-64 overflow-y-auto p-2">
                            {options.map((item, index) => {
                                const active =
                                    value?.includes(item.value)

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                            handleMultiSelect(
                                                item.value
                                            )
                                        }
                                        className={`
                                            w-full px-4 py-3 rounded-xl text-left
                                            transition-all duration-200
                                            flex items-center justify-between
                                            ${active
                                                ? 'bg-primary/10 text-primaryDark'
                                                : 'hover:bg-background text-heading'
                                            }
                                        `}
                                    >
                                        {item.label}

                                        {active && (
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )} */}

            {/* ================= UPLOAD ================= */}
            {type === 'upload' && (
                <>
                    <ImagesUploadUi multiple={multiple} value={value} onChange={onChange} imageLimit={imageLimit} />
                </>
            )
            }

            {type === 'switch' && (
                <Switch
                    loading={rest.loading}
                    checkedChildren={rest.checkedChildren ?? "Active"}
                    unCheckedChildren={rest.unCheckedChildren ?? "Unactive"}
                    checked={rest.checked}
                    onChange={onChange}
                    size={rest.size ?? "medium"}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={className || 'bg-gray-300 [&.ant-switch-checked]:!bg-primary'} {...rest} />
            )}
            {/* {label && (
                <label
                    className={`
                    absolute left-3 px-1 bg-white
                    transition-all duration-200 ease-in-out
                    pointer-events-none
                     text-heading
                    ${(type !== 'switch' || type !== 'upload') && active
                            ? "-top-2 text-sm"
                            : "top-2 text-base"
                        }
                        ${focused
                            ? "text-primary"
                            : "text-gray-400"
                        }
                `}
                >
                    {label}
                </label>
            )} */}
        </div>
    )
}

export default InputField