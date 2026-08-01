import React, { useMemo, useState } from 'react'
import { Form } from 'antd'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import CommanModal from '../../utils/CommanModal'
import InputField from '../../utils/InputField'
import TableUi from '../../utils/TableUi'
import { useMutation, useQuery } from '@tanstack/react-query'
import apiList from '../../config/apiList'
import api from '../../config/api'
import { useToast } from '../../context/ToastContext'
import { userState } from '../../context/UserContext'

const LeadTitles = () => {
    const { leadTitles } = apiList()
    const { showToast } = useToast()
    const { user, hasPermission } = userState()

    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [form] = Form.useForm()

    const canAdd = useMemo(() => hasPermission('Designations', false, false, 'add'), [user, hasPermission])

    const onCloseModal = () => {
        setIsOpenAddModal(false)
        setEditId(null)
        form.resetFields()
    }

    const openAddModal = () => {
        setIsOpenAddModal(true)
        setEditId(null)
        form.resetFields()
    }

    const { data: { data: allLeadTitles = [] } = {}, refetch: allLeadTitlesRefetch, isFetching: isLeadTitlesFetching } = useQuery({
        queryKey: ['all-lead-titles', pagination],
        queryFn: () => api.post(leadTitles.allLeadTitles, pagination),
        enabled: !!user,
        select: ({ data }) => data,
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(leadTitles.updateleadTitleUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success')
            allLeadTitlesRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error')
        }
    })

    const { mutate: handleSubmitLeadTitles, isPending: isSaving } = useMutation({
        mutationFn: async () => {
            const values = await form.validateFields()
            const payload = { title: values.title?.trim() }
            return api.post(editId ? leadTitles.updateLeadTitle(editId) : leadTitles.addLeadTitle, payload)
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success')
            onCloseModal()
            allLeadTitlesRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error')
        }
    })

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(leadTitles.deleteLeadTitle(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, 'success')
            allLeadTitlesRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error')
        }
    })

    const handleEdit = (data) => {
        setEditId(data._id)
        setIsOpenAddModal(true)
        form.setFieldsValue({ title: data.title || data.name })
    }

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <span className='capitalize'>{text}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <InputField
                    type='switch'
                    loading={statusPending && record?._id == editId}
                    checked={record?.status}
                    onChange={() => changeStatus(record?._id)}
                />
            ),
        },
    ]

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Lead Titles' add={canAdd} addClick={openAddModal} />
            <TableUi
                module_name='Lead Titles'
                columns={columns}
                data={allLeadTitles?.data}
                pagination={allLeadTitles?.pagination}
                gridLoading={isLeadTitlesFetching || isSaving}
                action
                callBack
                editClick={handleEdit}
                deleteClick={handleDelete}
                handlePagination={setPagination}
            />
            <CommanModal
                title={editId ? 'Update Leads Title' : 'Add Leads Title'}
                open={isOpenAddModal}
                onDone={handleSubmitLeadTitles}
                onClose={onCloseModal}
            >
                <Form form={form} className='flex flex-col gap-3'>
                    <Form.Item
                        name='title'
                        rules={[{ required: true, message: 'Title is required' }]}
                    >
                        <InputField type='text' placeholder='Enter Leads Title' />
                    </Form.Item>
                </Form>
            </CommanModal>
        </div>
    )
}

export default LeadTitles
