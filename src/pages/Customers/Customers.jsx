import React, { useEffect, useMemo, useState } from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import { useMutation, useQuery } from '@tanstack/react-query'
import { userState } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import apiList from '../../config/apiList';
import api from '../../config/api';
import { Form, Image } from 'antd';
import TableUi from '../../utils/TableUi';
import InputField from '../../utils/InputField';
import { useNavigate } from 'react-router-dom';
import CustomerUpdateModal from './CustomerUpdateModal';
import { filterState } from '../../context/Filtercontext';

const Customers = () => {

    const { customers, images } = apiList();
    const { showToast } = useToast();
    const { user, hasPermission, setLoading } = userState();
    const { filtersData } = filterState();

    const navigate = useNavigate();

    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [isOpenPassModal, setIsOpenPassModal] = useState(false)
    const [form] = Form.useForm();

    const payload = useMemo(() => {
        return {
            ...pagination,
            ...filtersData
        }

    }, [filtersData, pagination])

    const { data: { data: allCustomers = [] } = {}, refetch: allCustomersRefetch, isFetching: allCustomersFetching } = useQuery({
        queryKey: ['all-customers', payload],
        queryFn: () => api.post(customers.all, payload),
        enabled: !!user,
        select: ({ data }) => data
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(customers.customerStatusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allCustomersRefetch()
        }
    })

    const { mutate: handleCustomerAction, isPending: customerHandlePending } = useMutation({
        mutationFn: async () => {
            const payload = await form.validateFields();

            if (isOpenPassModal) {
                const response = await api.get(customers.updateCustomerPassword(editId, payload.password));
                return response.data;
            }

            payload.image = payload?.image?.uid;
            const response = await api.post(editId ? customers.updateCustomer(editId) : customers.add, payload);
            return response.data;
        },
        onSuccess: ({ message }) => {
            showToast(message, "success");
            onCloseModal();
            allCustomersRefetch();
        },
        onError: (error) => {
            if (error?.errorFields) {
                return;
            }
            showToast(error?.response?.data?.error?.error_message || (editId ? "Error updating customer" : "Error adding customer"), "error");
        }
    })

    const { mutate: handleDeleteCustomer, isPending: customerDeletePending } = useMutation({
        mutationFn: (id) => api.delete(customers.deleteCustomer(id)),
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allCustomersRefetch();
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || "Error deleting customer", "error");
        }
    })

    const columns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'name',
            fixed: 'start',
            render: (_, record) => {
                return (
                    <div className="flex flex-row gap-3 place-items-center">
                        <div className='!w-12 !h-12 aspect-square rounded-full overflow-hidden' >
                            <Image src={record?.image?.image ? images.imgUrl + record?.image?.image : `https://ui-avatars.com/api/?background=B06A8D&color=fff&name=${record?.name}`} className='aspect-square w-full h-full object-cover' />
                        </div>
                        <span className='text-lg'>{record?.name}</span>
                    </div>
                )
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: 'OTP Verify',
            dataIndex: 'otp_status',
            key: 'otp_status',
        },
        {
            title: 'GST Number',
            dataIndex: 'gst_number',
            key: 'gst_number',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <InputField type='switch' loading={statusPending && record?._id == editId} checked={record?.status == 'active'} onChange={() => changeStatus(record?._id)} />
        },
    ];

    const onCloseModal = () => {
        setEditId(null)
        setIsOpenAddModal(false)
        setIsOpenPassModal(false)
        form.resetFields()
    }

    const canAdd = useMemo(() => hasPermission('Customers', false, false, 'add'), [user, hasPermission])
    const handleAdd = () => {
        setEditId(null)
        setIsOpenAddModal(true)
    }

    const handleEdit = (data) => {
        setEditId(data._id)
        setIsOpenAddModal(true)
        form.setFieldsValue({
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            gst_number: data.gst_number,
            remark: data.remark,
            image: {
                url: images.imgUrl + data?.image?.image
            },
        })
    }

    const handlePassClick = (data) => {
        setIsOpenPassModal(true)
        setEditId(data._id)
    }

    const isLoading = useMemo(() => customerHandlePending || customerDeletePending, [customerHandlePending, customerDeletePending])

    useEffect(() => {
        if (isLoading == undefined || isLoading == null) return
        setLoading(isLoading)
    }, [isLoading])

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Custmers' add={canAdd} addClick={handleAdd} filter={true} />
            <TableUi
                columns={columns}
                data={allCustomers?.data}
                pagination={allCustomers?.pagination}
                handlePagination={setPagination}
                gridLoading={allCustomersFetching}
                action
                callBack
                module_name='Custmers'
                editClick={handleEdit}
                viewClick={(data) => navigate(`/custmers/view/${data?._id}`)}
                passClick={user?.role === 'admin' && handlePassClick}
                deleteClick={(data) => handleDeleteCustomer(data._id)}
            />
            <CustomerUpdateModal
                isOpenAddModal={isOpenAddModal || isOpenPassModal}
                passwordModal={isOpenPassModal}
                handleCustomerAction={handleCustomerAction}
                onCloseModal={onCloseModal}
                form={form}
                title={isOpenPassModal ? 'Change Password' : (editId ? 'Update Custmers' : 'Add Custmer')}
            />
        </div>
    )
}

export default Customers
