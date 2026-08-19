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
import Loader from '../../utils/Loader';
import toOriginalFormat from '../../utils/HandleFormValues';

const AddUpdateLead = () => {

    const { options, user } = userState();
    const { leads } = apiList();
    const { showToast } = useToast();

    const childRef = useRef();
    const { id } = useParams();
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({});
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({});

    const { data: leadForm, isPending: isLeadFormPending } = useQuery({
        queryKey: ['lead-form'],
        queryFn: () => api.get(leads.getFormsByLeadTitle('6a6d789a074fa8b351dfe027')),
        enabled: !!user,
        select: ({ data }) => data?.data,
    });

    const { mutate: findUserRefetch } = useMutation({
        mutationFn: async (payload) => await api.post(leads.findCustomer, payload),
        onSuccess: ({ data }) => {
            if (data?.data) {
                setFormData((prev) => ({
                    ...prev,
                    customer: data?.data?._id,
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
        const isValid = /^[0-9]{10}$/.test(String(formData?.mobile));
        if (isValid && !id) {
            const payload = {
                search: formData?.mobile
            }
            findUserRefetch(payload)
        }
    }, [formData?.mobile])

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
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    const { data: leadData, isFetching: isleadFetching } = useQuery({
        queryKey: ['lead-edit', id],
        queryFn: () => api.get(leads.getLead(id)),
        enabled: !!id && !!user,
        select: ({ data }) => toOriginalFormat(data?.data),
    });

    useEffect(() => {
        if (leadData) {
            setFormData({
                customer: leadData?.customer?._id,
                name: leadData?.customer?.name || '',
                email: leadData?.customer?.email || '',
                mobile: leadData?.customer?.mobile || '',
                assign_user: leadData?.assign_user?._id,
                status: leadData?.status
            })
            setFormValues(leadData?.values)
        }
    }, [leadData])

    const handleChange = (e, key) => {
        setFormData((prev) => ({ ...prev, [key]: e }))
        setErrors((prev) => {
            const newErrors = { ...prev };

            // Remove error if value exists
            if (e && e.toString().trim() !== "") {
                delete newErrors[key];
            } else {
                // Add error if value is empty
                newErrors[key] = `${key
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())} is required`;
            }

            return newErrors;
        });
    }

    const validate = () => {
        const newErrors = {};

        if (!formData?.mobile) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = "Mobile number must be 10 digits";
        }

        if (!formData?.name?.trim()) {
            newErrors.name = "Name is required";
        }

        /*if (!formData?.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            newErrors.email = "Invalid email address";
        }*/

        if (user?.role == 'admin' && !formData?.assign_user) {
            newErrors.assign_user = "Please select an assign person";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const handleSave = () => {
        if (!validate()) return;
        const isValid = childRef.current.handleValidate();
        if (isValid) {
            const payload = {
                ...formData,
                values: formValues
            }
            saveLead(payload);
        }
    };

    const StatusSection = () => {
        return (id &&
            <div className="w-60">
                <InputField
                    type='drop-single-select'
                    placeholder='Select Status'
                    value={formData?.status}
                    onChange={(e) => handleChange(e, 'status')}
                    options={options?.ticketStatuses}
                />
            </div>
        )
    }

    return (
        <div className='space-y-5'>
            {isSaving && <Loader />}
            <div className="bg-white rounded-lg p-3 sticky top-0 z-50">
                <PageTitleAddbtn
                    title={id ? 'Edit lead' : 'Add lead'}
                    add addText='Save'
                    addClick={handleSave}
                    displayStatus={<StatusSection />}
                />
            </div>
            <div className="bg-white rounded-lg p-3 grid grid-cols-3 gap-5">
                <div className='flex flex-col gap-2'>
                    <InputField
                        type='number'
                        maxLength={10}
                        label='Mobile Number'
                        placeholder='Enter Mobile Number'
                        value={formData?.mobile || ''}
                        disabled={id}
                        onChange={(e) => handleChange(e, 'mobile')}
                    />
                    <span className='text-red-500 text-sm'>{errors?.mobile}</span>
                </div>
                <div className='flex flex-col gap-2'>
                    <InputField
                        label='Name'
                        placeholder='Enter Name'
                        value={formData?.name}
                        onChange={(e) => handleChange(e.target.value, 'name')}
                        disabled={formData?.user}
                    />
                    <span className='text-red-500 text-sm'>{errors?.name}</span>
                </div>
                <div className='flex flex-col gap-2'>
                    <InputField
                        label='Email'
                        placeholder='Enter Email'
                        value={formData?.email}
                        onChange={(e) => handleChange(e.target.value, 'email')}
                        disabled={formData?.user}
                    />
                    <span className='text-red-500 text-sm'>{errors?.email}</span>
                </div>
                {user?.role == 'admin' && <div className='flex flex-col gap-2'>
                    <InputField
                        label='Assign Person'
                        type='drop-single-select'
                        placeholder='Select Assign Person'
                        value={formData?.assign_user}
                        onChange={(e) => handleChange(e, 'assign_user')}
                        options={options?.users}
                    />
                    <span className='text-red-500 text-sm'>{errors?.assign_user}</span>
                </div>}
                <LoadFrom ref={childRef} formFields={leadForm?.fields || []} title={leadForm?.leadTitle} isLoading={isLeadFormPending} formValues={formValues} setFormValues={setFormValues} />
            </div>
        </div>
    )
}

export default AddUpdateLead
