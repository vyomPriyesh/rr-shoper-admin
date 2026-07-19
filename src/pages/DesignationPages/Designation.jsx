import React, { useState } from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import apiList from '../../config/apiList'
import api from '../../config/api'
import { useToast } from '../../context/ToastContext'
import { userState } from '../../context/UserContext'
import TableUi from '../../utils/TableUi'
import InputField from '../../utils/InputField'

const Designation = () => {

    const navigate = useNavigate()
    const { designations } = apiList()
    const { showToast } = useToast()
    const { user } = userState()

    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)

    const handleAdd = () => {
        navigate('/designation/add')
    }

    const { data: { data: allDesignations = [] } = {}, refetch: allDesignationsRefetch } = useQuery({
        queryKey: ['all-designations', pagination],
        queryFn: () => api.post(designations.all, pagination),
        enabled: !!user,
        select: ({ data }) => data,
        refetchOnMount:true,
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(designations.updateStatus(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, "success")
            allDesignationsRefetch()
        }
    })

    const handleEdit = (data) => {
        navigate(`/designation/update/${data._id}`)
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => <InputField type='switch' loading={statusPending && record?._id == editId} checked={record?.status} onChange={() => changeStatus(record?._id)} />
        },
    ]

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Designation' add addClick={handleAdd} />
            <TableUi
                module_name='Designation'
                columns={columns}
                data={allDesignations?.data}
                pagination={allDesignations?.pagination}
                action
                editClick='/designation/update'
                handlePagination={setPagination}
            />
        </div>
    )
}

export default Designation
