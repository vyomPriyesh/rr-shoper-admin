import React, { useMemo, useState } from 'react'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import { useMutation, useQuery } from '@tanstack/react-query'
import { userState } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import apiList from '../config/apiList';
import api from '../config/api';
import { Form, Image } from 'antd';
import TableUi from '../utils/TableUi';
import InputField from '../utils/InputField';
import CommanModal from '../utils/CommanModal';
import Loader from '../utils/Loader';

const Customers = () => {

    const { customers, designations, images } = apiList();
    const { showToast } = useToast();
    const { user, options, hasPermission } = userState();

    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [form] = Form.useForm();

    const { data: { data: allCustomers = [] } = {}, refetch: allCustomersRefetch, isFetching: allCustomersFetching } = useQuery({
        queryKey: ['all-customers', pagination],
        queryFn: () => api.post(customers.all, pagination),
        enabled: !!user,
        select: ({ data }) => data
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(customers.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allCustomersRefetch()
        }
    })

    const { mutate: handleCustomerAction, isPending: customerHandlePending } = useMutation({
        mutationFn: async () => {
            const payload = await form.validateFields();
            payload.image = payload.image.uid
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

    const { mutate: handleDeleteCustomer } = useMutation({
        mutationFn: (id) => api.delete(columns.deleteCustomer(id)),
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
                        <div className='!w-12 rounded-full aspect-square overflow-hidden' >
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <InputField type='switch' loading={statusPending && record?._id == editId} checked={record?.status == 'active'} onChange={() => changeStatus(record?._id)} />
        },
    ];

    const onCloseModal = () => {
        setEditId(null)
        setIsOpenAddModal(false)
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
            image: {
                url: images.imgUrl + data.image.image
            },
        })
    }

    return (
        <div className='flex flex-col gap-5'>
            {customerHandlePending && <Loader />}
            <PageTitleAddbtn title='Custmers' add={canAdd} addClick={handleAdd} />
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
                deleteClick={(data) => handleDeleteCustomer(data._id)}
            />
            <CommanModal title={editId ? 'Update Custmers' : 'Add Custmer'} open={isOpenAddModal} onDone={handleCustomerAction} onClose={onCloseModal}>
                <Form form={form} className='flex flex-col gap-3'>
                    <Form.Item name='name' rules={[{ required: true, message: 'Name is required' }]}>
                        <InputField type='text' placeholder='Enter Name' />
                    </Form.Item>
                    <Form.Item name='email' rules={[
                        { required: true, message: 'Email is required' },
                        { type: 'email', message: 'Enter valid email' }
                    ]}>
                        <InputField type='email' placeholder='Enter Email' />
                    </Form.Item>
                    <Form.Item name='mobile' rules={[
                        { required: true, message: 'Mobile number is required' },
                        { len: 10, message: 'Enter valid 10-digit mobile number' },
                        {
                            pattern: /^[0-9]+$/,
                            message: "Mobile number must contain only digits",
                        },
                    ]}>
                        <InputField type='text' maxLength={10} placeholder='Enter Mobile Number' />
                    </Form.Item>
                    <Form.Item name='image'>
                        <InputField
                            type='upload'
                        />
                    </Form.Item>
                </Form>
            </CommanModal>
        </div>
    )
}

export default Customers
