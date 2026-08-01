import React, { useEffect, useRef, useState } from 'react'
import { userState } from '../../context/UserContext'
import { useNavigate, useParams } from 'react-router-dom';
import PageTitleAddbtn from '../../utils/PageTitleAddbtn';
import InputField from '../../utils/InputField';
import apiList from '../../config/apiList';
import api from '../../config/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import LoadFrom from '../../utils/LoadFrom';
import { useToast } from '../../context/ToastContext';

const AddUpdateLead = () => {

    const { options, user } = userState();
    const { leads } = apiList();
    const { showToast } = useToast();

    const childRef = useRef();
    const { id } = useParams();
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({});
    const [haveUser, setHaveUser] = useState({})

    const { data: leadData, isPending: isLeadPending } = useQuery({
        queryKey: ['lead-form'],
        queryFn: () => api.get(leads.getFormsByLeadTitle('6a6d789a074fa8b351dfe027')),
        enabled: !!user,
        select: ({ data }) => data?.data,
    });

    const { mutate: findUserRefetch } = useMutation({
        mutationFn: async (payload) => await api.post(leads.findUser, payload),
        onSuccess: ({ data }) => {
            if (data?.data) {
                setHaveUser((prev) => ({
                    ...prev,
                    user: data?.data?._id,
                    name: data?.data?.name || '',
                    email: data?.data?.email || '',
                }))
            }
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
            setFormValues({})
        }
    })

    useEffect(() => {
        const isValid = /^[0-9]{10}$/.test(String(haveUser?.mobileNumber));
        if (isValid) {
            const payload = {
                search: haveUser?.mobileNumber
            }
            findUserRefetch(payload)
        }
    }, [haveUser?.mobileNumber])

    const { mutate: saveLead, isPending: isSaving } = useMutation({
        mutationFn: (payload) => {
            if (id) {
                return api.post(leads.updateLead(id), payload);
            }
            return api.post(leads.addLead, payload);
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            navigate(-1);
        },
        onError: ({ response }) => {
            console.log(response)
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    const handleSave = () => {
        const isValid = childRef.current.handleValidate();
        if (isValid) {
            const payload = {
                ...haveUser,
                values: formValues
            }
            saveLead(payload);
        }
    };

    return (
        <div className='space-y-5'>
            <div className="bg-white rounded-lg p-3">
                <PageTitleAddbtn title={id ? 'Edit lead' : 'Add lead'} add addText='Save' addClick={handleSave} />
            </div>
            <div className="bg-white rounded-lg p-3 grid grid-cols-3 gap-5">
                <InputField
                    type='number'
                    maxLength={10}
                    label='Mobile Number'
                    placeholder='Enter Mobile Number'
                    value={haveUser?.mobileNumber || ''}
                    onChange={(e) => setHaveUser((prev) => ({ ...prev, mobileNumber: e }))}
                />
                <InputField
                    label='Name'
                    placeholder='Enter Name'
                    value={haveUser?.name}
                    onChange={(e) => setHaveUser((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={haveUser?.user}
                />
                <InputField
                    label='Email'
                    placeholder='Enter Email'
                    value={haveUser?.email}
                    onChange={(e) => setHaveUser((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={haveUser?.user}
                />
                <LoadFrom ref={childRef} formFields={leadData?.fields || []} title={leadData?.leadTitle} isLoading={isLeadPending} formValues={formValues} setFormValues={setFormValues} />
            </div>
        </div>
    )
}

export default AddUpdateLead
