import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageTitleAddbtn from '../../utils/PageTitleAddbtn';
import InputField from '../../utils/InputField';
import apiList from '../../config/apiList';
import api from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { userState } from '../../context/UserContext';
import FormBuilder from '../../utils/FormBuilder';

const AddUpdateTicketForm = () => {
    const { ticketsForm } = apiList();
    const { showToast } = useToast();
    const { user, options } = userState();
    const navigate = useNavigate();
    const { id } = useParams();

    const [fields, setFields] = useState([]);
    const [formName, setFormName] = useState('');

    const { data: ticketFormData, isFetching: isTicketFormFetching } = useQuery({
        queryKey: ['ticket-form-edit', id],
        queryFn: () => api.get(ticketsForm.getTicketForm(id)),
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


    const payload = useMemo(() => ({
        ticketTitle: formName,
        fields,
    }), [formName, fields]);

    const { mutate: saveTicketForm, isPending: isSaving } = useMutation({
        mutationFn: () => {
            if (id) {
                return api.post(ticketsForm.updateTicketForm(id), payload);
            }
            return api.post(ticketsForm.addTicketForm, payload);
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
            <FormBuilder fields={fields} setFields={setFields} />
        </div>
    );
};

export default AddUpdateTicketForm;
