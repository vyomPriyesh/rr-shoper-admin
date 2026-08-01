import React, { useMemo, useState } from 'react'
import { Button, Input, Select, Switch } from 'antd';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import InputField from './InputField';
import { v4 as uuid } from 'uuid';
import { CSS } from '@dnd-kit/utilities';
import ButtonUi from './ButtonUi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { userState } from '../context/UserContext';



const palette = [
    { type: 'input', label: 'Text' },
    { type: 'number', label: 'Number' },
    { type: 'date', label: 'Date' },
    { type: 'textarea', label: 'Textarea' },
    { type: 'select', label: 'Select' },
    { type: 'upload', label: 'Upload' },
];

function Item({ field, onSelect, onDelete, selected }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`mb-2 rounded border p-3 cursor-pointer ${selected ? 'border-primary' : 'border-gray-300'}`}
            onClick={() => onSelect(field.id)}
        >
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <span {...attributes} {...listeners} className='cursor-grab text-xl select-none'>☰</span>
                    <b>{field.label || field.type}</b>
                </div>
                <ButtonUi
                    type='button'
                    text={<RiDeleteBin6Line />}
                    className='!px-2 py-2 text-xl !bg-red-500 !border-transparent hover:!text-red-700 hover:!bg-transparent hover:!border-red-500'
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(field.id);
                    }}
                />
            </div>
        </div>
    );
}

const FormBuilder = ({ fields, setFields }) => {

    const { options } = userState()

    const [selected, setSelected] = useState(null);

    const addField = (type) => setFields((prev) => [...prev, { id: uuid(), type, label: type, placeholder: '', required: true, maxLength: 10, options: ['Option 1'] }]);
    const current = fields?.find((field) => field.id === selected);

    const update = (key, value) => setFields((prev) => prev.map((field) => (field.id === selected ? { ...field, [key]: value } : field)));
    const updateOption = (index, value) => setFields((prev) => prev.map((field) => field.id === selected ? { ...field, options: field.options.map((opt, i) => (i === index ? value : opt)) } : field));
    const addOption = () => setFields((prev) => prev.map((field) => field.id === selected ? { ...field, options: [...(field.options || []), ''] } : field));
    const removeOption = (index) => setFields((prev) => prev.map((field) => field.id === selected ? { ...field, options: (field.options || []).filter((_, i) => i !== index) } : field));

    const del = (id) => {
        setFields((prev) => prev.filter((field) => field.id !== id));
        if (selected === id) {
            setSelected(null);
        }
    };

    const dragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);
        setFields((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    const allFiledsForDependList = useMemo(() => {
        return fields.map((field) => ({
            label: field.label,
            value: field.label,
        }))
    }, [fields])

    return (
        <div className='flex flex-row gap-5'>
            <div className='w-1/6 rounded border border-gray-300 bg-white p-3 space-y-3'>
                <h3>Fields</h3>
                {palette.map((item) => (
                    <Button key={item.type} block onClick={() => addField(item.type)}>{item.label}</Button>
                ))}
            </div>
            <div className='w-3/6 rounded border border-gray-300 bg-white p-3 space-y-3'>
                <h3>Form</h3>
                <DndContext collisionDetection={closestCenter} onDragEnd={dragEnd}>
                    <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                        {fields.map((field) => (
                            <Item key={field.id} field={field} onSelect={setSelected} onDelete={del} selected={selected === field.id} />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
            <div className='w-2/6 rounded border border-gray-300 bg-white p-3 space-y-3'>
                <h3>Properties</h3>
                {current ? (
                    <>
                        <InputField value={current.label || ''} type='text' placeholder='Enter Label Name' onChange={(e) => update('label', e.target.value)} />
                        <InputField value={current.placeholder || ''} type='text' placeholder='Enter Placeholder Text' onChange={(e) => update('placeholder', e.target.value)} />
                        <div className='gap-5 flex items-center justify-between'>
                            <span>Required</span>
                            <InputField type='switch' checkedChildren={null} unCheckedChildren={null} disabled={current.depend_on_parent_field} checked={current.depend_on_parent_field ? false : current.required || false} onChange={(value) => update('required', value)} />
                        </div>
                        <div className='gap-3 flex flex-row text-nowrap items-center justify-between'>
                            <span>Depend on Parent Field</span>
                            <InputField type='switch' checkedChildren={null} unCheckedChildren={null} checked={current.depend_on_parent_field || false} onChange={(value) => {update('required', false), update('depend_on_parent_field', value)}} />
                        </div>
                        {current.depend_on_parent_field &&
                            <div className='gap-3 flex flex-row text-nowrap items-center justify-between'>
                                <span>Parent Field</span>

                                <InputField
                                    type='drop-single-select'
                                    placeholder='Select Field'
                                    value={current.depend_parent_field}
                                    onChange={(value) => update('depend_parent_field', value)}
                                    options={allFiledsForDependList}
                                    popupRender={(menu) => (
                                        <div>
                                            {menu}
                                            <InputField value={current.depend_parent_field_value || ''} type='text' placeholder='Enter Value' onChange={(e) => update('depend_parent_field_value', e.target.value)} />
                                        </div>
                                    )}
                                />
                            </div>
                        }
                        {current.type === 'number' && (
                            <div className='mt-4'>
                                <InputField
                                    type='number'
                                    placeholder='Enter Max Length'
                                    value={current.maxLength || ''}
                                    onChange={(e) => update('maxLength', e.target.value)}
                                />
                            </div>
                        )}
                        {current.type === 'select' && (
                            <div className='mt-4'>
                                <div className='gap-5 flex flex-row text-nowrap items-center justify-between'>
                                    <span>Multiple Select</span>
                                    <InputField type='switch' checkedChildren={null} unCheckedChildren={null} checked={current.multipleSelect || false} onChange={(value) => update('multipleSelect', value)} />
                                </div>
                                <div className="flex flex-row mb-2 gap-5 text-nowrap w-full items-center">
                                    <span>Manully Options</span>
                                    <InputField type='switch' checkedChildren={null} unCheckedChildren={null} checked={current.manully || false} onChange={(value) => update('manully', value)} />
                                    {!current.manully && <ButtonUi onClick={addOption} className='!px-3' text='Add Option' />}
                                </div>

                                {current.manully ?
                                    <>
                                        <InputField
                                            type='drop-single-select'
                                            placeholder='Select Option List'
                                            value={current.dynamic}
                                            onChange={(value) => update('dynamic', value)}
                                            options={options?.optionsLists}
                                            style={{ width: '100%' }}
                                        />
                                    </>
                                    :
                                    <>
                                        {(current.options || []).map((option, index) => (
                                            <div key={index} className='mb-2 flex gap-2'>
                                                <Input value={option} onChange={(e) => updateOption(index, e.target.value)} />
                                                <Button danger onClick={() => removeOption(index)}>✕</Button>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        )}
                        {current.type === 'upload' && (
                            <div className="space-y-4">
                                <div className='flex flex-row mb-2 gap-5 text-nowrap w-full items-center'>
                                    <label className=''>Upload Multiple</label>
                                    <InputField
                                        type='switch'
                                        checked={current.multiple}
                                        checkedChildren={null} unCheckedChildren={null}
                                        onChange={(value) => update('multiple', value)}
                                        options={[
                                            { value: 'single', label: 'Single File' },
                                            { value: 'multiple', label: 'Multiple Files' },
                                        ]}
                                    />
                                </div>
                                {current.multiple && <InputField value={current.imageLimit || ''} type='number' placeholder='Enter Image Limit' onChange={(e) => update('imageLimit', e.target.value)} />}
                            </div>
                        )}
                    </>
                ) : (
                    <p className='text-gray-500'>Select a field to edit its properties.</p>
                )}
            </div>
        </div>
    )
}

export default FormBuilder
