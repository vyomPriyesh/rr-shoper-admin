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
import Loader from '../../utils/Loader';

const AddUpdateLeadForm = () => {
    const { leadsForms, leads } = apiList();
    const { showToast } = useToast();
    const { user, options } = userState();
    const navigate = useNavigate();
    const { id } = useParams();

    const [fields, setFields] = useState([]);
    const [formName, setFormName] = useState('');

    const { data: leadFormData, isFetching: isleadFormFetching } = useQuery({
        queryKey: ['lead-form-edit', id],
        queryFn: () => api.get(leadsForms.getleadForm(id)),
        enabled: !!id && !!user,
        select: ({ data }) => data?.data,
    });

    useEffect(() => {
        if (leadFormData) {
            setFormName(leadFormData?.leadTitle || leadFormData?.formName || '');
            setFields((leadFormData?.fields || []).map((field) => ({
                ...field,
                id: field.id || uuid(),
                options: field.options || ['Option 1'],
            })));
        }
    }, [leadFormData]);

    const { data: leadTitleUsed, isPending: isLeadFormPending } = useQuery({
        queryKey: ['lead-form', formName],
        queryFn: () => api.get(leads.getFormsByLeadTitle(formName)),
        enabled: !!user && !!formName,
        select: ({ data }) => !!data?.data
    });

    useEffect(() => {
        if (leadTitleUsed) {
            showToast('This title is already used', 'error');
        }
    }, [leadTitleUsed])


    const payload = useMemo(() => ({
        leadTitle: formName,
        fields,
    }), [formName, fields]);

    const { mutate: saveleadForm, isPending: isSaving } = useMutation({
        mutationFn: () => {
            if (id) {
                return api.post(leadsForms.updateleadForm(id), payload);
            }
            return api.post(leadsForms.addleadForm, payload);
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
            {isSaving && <Loader />}
            <PageTitleAddbtn title={id ? 'Edit lead Form' : 'Add lead Form'} add addText='Save' addClick={() => saveleadForm()} disabled={leadTitleUsed || isSaving || isleadFormFetching} />
            <div className='w-80'>
                <InputField
                    type='drop-single-select'
                    placeholder='Choose lead title'
                    value={formName || undefined}
                    onChange={(value) => setFormName(value)}
                    options={options?.leadTitles || []}
                    disabled={isleadFormFetching}
                />
            </div>
            <FormBuilder fields={fields} setFields={setFields} />
        </div>
    );
}

export default AddUpdateLeadForm
