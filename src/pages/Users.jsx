import React, { useState } from 'react'
import PageTitleAddbtn from '../utils/PageTitleAddbtn'
import { useMutation, useQuery } from '@tanstack/react-query'
import { userState } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import apiList from '../config/apiList';
import api from '../config/api';
import { Image } from 'antd';
import TableUi from '../utils/TableUi';
import InputField from '../utils/InputField';

const Users = () => {

    const { users, designations, images } = apiList();
    const { showToast } = useToast();
    const { user, options } = userState();

    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [updateDesignationId, setUpdateDesignationId] = useState(null)

    const { data: { data: allUsers = [] } = {}, refetch: allUsersRefetch } = useQuery({
        queryKey: ['all-users', pagination],
        queryFn: () => api.post(users.all, pagination),
        enabled: !!user,
        select: ({ data }) => data
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(users.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            allUsersRefetch()
        }
    })

    const { mutate: updateUserDesignation, isPending: designationPending } = useMutation({
        mutationFn: (payload) => api.get(users.updateDesignation(payload.id, payload.designationId)),
        onSuccess: ({ data }) => {
            showToast(data.message, "success");
            setUpdateDesignationId(null)
            allUsersRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || "Error updating designation", "error");
        }
    })

    const columns = [
        {
            title: 'User',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => {
                return (
                    <div className="flex flex-row gap-3 place-items-center">
                        <Image src={images.imgUrl + record?.image?.image} className='!w-20' />
                        <span className='text-lg'>{record?.name}</span>
                    </div>
                )
            },
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            render: (_, record) => (
                <InputField
                    type='drop-single-select'
                    value={record?.designation?._id}
                    options={options.designations}
                    onChange={(e) => updateUserDesignation({ id: record?._id, designationId: e })}
                    // updateLoading={designationPending && record?._id === updateDesignationId}
                    placeholder={record?.designation?.name || 'Select Designation'}
                />
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <InputField type='switch' loading={statusPending && record?._id == editId} checked={record?.status == 'active'} onChange={() => changeStatus(record?._id)} />
        },
    ]

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Users' />
            <TableUi
                columns={columns}
                data={allUsers?.data}
                pagination={allUsers?.pagination}
                handlePagination={setPagination}
            />
        </div>
    )
}

export default Users
