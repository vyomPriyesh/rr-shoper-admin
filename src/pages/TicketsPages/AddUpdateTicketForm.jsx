import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Select, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import PageTitleAddbtn from '../../utils/PageTitleAddbtn';
import InputField from '../../utils/InputField';
import apiList from '../../config/apiList';
import api from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { userState } from '../../context/UserContext';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ButtonUi from '../../utils/ButtonUi';
import { RiDeleteBin6Line } from 'react-icons/ri';

const palette = [
    { type: 'input', label: 'Text' },
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

const AddUpdateTicketForm = () => {
    const { tickets } = apiList();
    const { showToast } = useToast();
    const { user, options } = userState();
    const navigate = useNavigate();
    const { id } = useParams();

    const [fields, setFields] = useState([]);
    const [selected, setSelected] = useState(null);
    const [formName, setFormName] = useState('');

    const { data: ticketFormData, isFetching: isTicketFormFetching } = useQuery({
        queryKey: ['ticket-form-edit', id],
        queryFn: () => api.get(tickets.getTicketForm(id)),
        enabled: !!id && !!user,
        select: ({ data }) => data?.data,
    });

    useEffect(() => {
        if (ticketFormData) {
            setFormName(ticketFormData?.ticketTitle || ticketFormData?.formName || '');
            setFields((ticketFormData?.fields || []).map((field) => ({
                ...field,
                id: field.id || uuid(),
                options: field.options || ['Option 1'],
            })));
        }
    }, [ticketFormData]);

    const addField = (type) => setFields((prev) => [...prev, { id: uuid(), type, label: type, placeholder: '', required: false, options: ['Option 1'] }]);
    const current = fields.find((field) => field.id === selected);

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

    const payload = useMemo(() => ({
        ticketTitle: formName,
        fields,
    }), [formName, fields]);

    const { mutate: saveTicketForm, isPending: isSaving } = useMutation({
        mutationFn: () => {
            if (id) {
                return api.post(tickets.updateTicketForm(id), payload);
            }
            return api.post(tickets.addTicketForm, payload);
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            navigate(-1);
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    return (
        <div className='space-y-5'>
            <PageTitleAddbtn title={id ? 'Edit Ticket Form' : 'Add Ticket Form'} add addText='Save' addClick={() => saveTicketForm()} disabled={isSaving || isTicketFormFetching} />
            <div className='w-80'>
                <InputField
                    type='drop-single-select'
                    placeholder='Choose ticket title'
                    value={formName || undefined}
                    onChange={(value) => setFormName(value)}
                    options={options?.ticketsTitles || []}
                    disabled={isTicketFormFetching}
                />
            </div>
            <div className='grid grid-cols-12 gap-5'>
                <div className='col-span-2 rounded border border-gray-300 bg-white p-3 space-y-3'>
                    <h3>Fields</h3>
                    {palette.map((item) => (
                        <Button key={item.type} block onClick={() => addField(item.type)}>{item.label}</Button>
                    ))}
                </div>
                <div className='col-span-6 rounded border border-gray-300 bg-white p-3 space-y-3'>
                    <h3>Form</h3>
                    <DndContext collisionDetection={closestCenter} onDragEnd={dragEnd}>
                        <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                            {fields.map((field) => (
                                <Item key={field.id} field={field} onSelect={setSelected} onDelete={del} selected={selected === field.id} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
                <div className='col-span-4 rounded border border-gray-300 bg-white p-3 space-y-3'>
                    <h3>Properties</h3>
                    {current ? (
                        <>
                            <InputField value={current.label || ''} placeholder='Enter Label Name' onChange={(e) => update('label', e.target.value)} />
                            <InputField value={current.placeholder || ''} placeholder='Enter Placeholder Text' onChange={(e) => update('placeholder', e.target.value)} />
                            <div className='gap-5 flex items-center justify-between'>
                                <span>Required</span>
                                <InputField type='switch' checkedChildren={null} unCheckedChildren={null} checked={current.required || false} onChange={(value) => update('required', value)} />
                            </div>
                            {current.type === 'select' && (
                                <div className='mt-4'>
                                    <label className='mb-2 block'>Options</label>
                                    {(current.options || []).map((option, index) => (
                                        <div key={index} className='mb-2 flex gap-2'>
                                            <Input value={option} onChange={(e) => updateOption(index, e.target.value)} />
                                            <Button danger onClick={() => removeOption(index)}>✕</Button>
                                        </div>
                                    ))}
                                    <Button block onClick={addOption}>Add Option</Button>
                                </div>
                            )}
                            {current.type === 'upload' && (
                                <div className="space-y-4">
                                    <div className='mt-4'>
                                        <label className='mb-2 block'>Upload Mode</label>
                                        <InputField
                                            type='drop-single-select'
                                            value={current.multiple ? 'multiple' : 'single'}
                                            onChange={(value) => update('multiple', value === 'multiple')}
                                            options={[
                                                { value: 'single', label: 'Single File' },
                                                { value: 'multiple', label: 'Multiple Files' },
                                            ]}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <InputField value={current.imageLimit || ''} placeholder='Enter Image Limit' onChange={(e) => update('imageLimit', e.target.value)} />
                                </div>
                            )}
                        </>
                    ) : (
                        <p className='text-gray-500'>Select a field to edit its properties.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddUpdateTicketForm;
