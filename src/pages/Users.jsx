import React, { useEffect, useMemo, useState } from 'react'
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

const Users = () => {

    const { users, designations, images } = apiList();
    const { showToast } = useToast();
    const { user, options, hasPermission } = userState();

    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [form] = Form.useForm();
    const [isOpenPassModal, setIsOpenPassModal] = useState(false)

    const { data, refetch: allUsersRefetch, isFetching: allUsersFetching, error, isError } = useQuery({
        queryKey: ['all-users', pagination],
        queryFn: () => api.post(users.all, pagination),
        enabled: !!user,
    })

    const allUsers = useMemo(() => data?.data?.data || [], [data]);

    useEffect(() => {
        if (isError) {
            showToast(error?.response?.data?.error?.error_message, 'error')
        }
    }, [isError])
    console.log("response:", error?.response);

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(users.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allUsersRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message, "error");
        }
    })

    // const { mutate: updateUserDesignation, isPending: designationPending } = useMutation({
    //     mutationFn: (payload) => api.get(users.updateDesignation(payload.id, payload.designationId)),
    //     onSuccess: ({ data }) => {
    //         showToast(data.message, "success");
    //         allUsersRefetch()
    //     },
    //     onError: ({ response }) => {
    //         showToast(response?.data?.error?.error_message || "Error updating designation", "error");
    //     }
    // })

    const { mutate: handleUserAction, isPending: userHandlePending } = useMutation({
        mutationFn: async () => {
            const payload = await form.validateFields();
            payload.role = 'user';
            const response = await api.post(isOpenPassModal ? users.updateUserPassword(editId, payload.password) : editId ? users.updateUser(editId) : users.add, payload);
            return response.data;
        },
        onSuccess: ({ message }) => {
            showToast(message, "success");
            onCloseModal();
            allUsersRefetch();
        },
        onError: (error) => {
            if (error?.errorFields) {
                return;
            }
            showToast(error?.response?.data?.error?.error_message || (editId ? "Error updating user" : "Error adding user"), "error");
        }
    })

    const { mutate: handleDeleteUser } = useMutation({
        mutationFn: (id) => api.delete(users.deleteUser(id)),
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allUsersRefetch();
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || "Error deleting user", "error");
        }
    })

    const columns = [
        {
            title: 'User',
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
        // {
        //     title: 'Designation',
        //     dataIndex: 'designation',
        //     key: 'designation',
        //     render: (_, record) => (
        //         <InputField
        //             type='drop-single-select'
        //             value={record?.designation?._id}
        //             options={options.designations}
        //             onChange={(e) => updateUserDesignation({ id: record?._id, designationId: e })}
        //             placeholder={record?.designation?.name || 'Select Designation'}
        //         />
        //     )
        // },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <InputField type='switch' loading={statusPending && record?._id == editId} checked={record?.status == 'active'} onChange={() => changeStatus(record?._id)} />
        },
    ];

    const onCloseModal = () => {
        setEditId(null)
        setIsOpenPassModal(false)
        setIsOpenAddModal(false)
        form.resetFields()
    }

    const canAdd = useMemo(() => hasPermission('Users', false, false, 'add'), [user, hasPermission])
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
            designation: data.designation?._id
        })
    }

    const handlePassClick = (data) => {
        setIsOpenPassModal(true)
        setEditId(data._id)
    }


    return (
        <div className='flex flex-col gap-5'>
            {userHandlePending && <Loader />}
            <PageTitleAddbtn title='Users' add={canAdd} addClick={handleAdd} />
            <TableUi
                columns={columns}
                data={allUsers?.data}
                pagination={allUsers?.pagination}
                handlePagination={setPagination}
                gridLoading={allUsersFetching}
                action
                callBack
                module_name='Users'
                editClick={handleEdit}
                passClick={user?.role === 'admin' && handlePassClick}
                deleteClick={(data) => handleDeleteUser(data._id)}
            />
            <CommanModal title={editId ? 'Update User' : 'Add User'} open={isOpenAddModal || isOpenPassModal} onDone={handleUserAction} onClose={onCloseModal}>
                <Form form={form} className='flex flex-col gap-3'>
                    {!isOpenPassModal &&
                        <>
                            <Form.Item name='name' rules={[{ required: true, message: 'Name is required' }]}>
                                <InputField type='text' placeholder='Enter Name' />
                            </Form.Item>
                            <Form.Item name='email' rules={[
                                { required: true, message: 'Email is required' },
                                { type: 'email', message: 'Enter valid email' }
                            ]}>
                                <InputField type='email' placeholder='Enter Email' />
                            </Form.Item>
                        </>
                    }
                    {(!editId || isOpenPassModal) &&
                        <Form.Item name='password' rules={[
                            { required: true, message: 'Password is required' },
                        ]}>
                            <InputField type='password' placeholder='Enter Password' />
                        </Form.Item>
                    }
                    {isOpenPassModal &&
                        <Form.Item name='cpassword' dependencies={["password"]}
                            rules={[
                                {
                                    required: true,
                                    message: "Confirm password is required",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject(
                                            new Error("Passwords do not match")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <InputField type='password' placeholder='Confirm Password' />
                        </Form.Item>
                    }
                    {!isOpenPassModal &&
                        <>
                            <Form.Item name='mobile' rules={[
                                { required: true, message: 'Mobile number is required' },
                                { len: 10, message: 'Enter valid 10-digit mobile number' }
                            ]}>
                                <InputField type='tel' maxLength={10} placeholder='Enter Mobile Number' />
                            </Form.Item>
                            <Form.Item name='designation' >
                                <InputField type='drop-single-select' options={options?.designations || []} placeholder='Select Designation' />
                            </Form.Item>
                        </>
                    }
                </Form>
            </CommanModal>
        </div>
    )
}

export default Users
