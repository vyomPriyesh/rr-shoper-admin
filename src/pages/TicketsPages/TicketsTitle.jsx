import React, { useState } from 'react'
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

const TicketsTitle = () => {
    const { tickets } = apiList()
    const { showToast } = useToast()
    const { user } = userState()

    const [isOpenAddModal, setIsOpenAddModal] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, limit: 10 })
    const [editId, setEditId] = useState(null)
    const [form] = Form.useForm()

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

    const { data: { data: allTicketsTitle = [] } = {}, refetch: allTicketsTitleRefetch, isFetching: isTicketsTitleFetching } = useQuery({
        queryKey: ['all-tickets-title', pagination],
        queryFn: () => api.post(tickets.allTicketsTitle, pagination),
        enabled: !!user,
        select: ({ data }) => data,
    })

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id)
            return api.get(tickets.statusUpdate(id))
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success')
            allTicketsTitleRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error')
        }
    })

    const { mutate: handleSubmitTicketTitle, isPending: isSaving } = useMutation({
        mutationFn: async () => {
            const values = await form.validateFields()
            const payload = { title: values.title?.trim() }
            return api.post(editId ? tickets.updateTicketsTitle(editId) : tickets.addTicketsTitle, payload)
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success')
            onCloseModal()
            allTicketsTitleRefetch()
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error')
        }
    })

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(tickets.deleteTicketsTitle(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, 'success')
            allTicketsTitleRefetch()
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
            <PageTitleAddbtn title='Tickets Title' add addClick={openAddModal} />
            <TableUi
                module_name='Tickets Title'
                columns={columns}
                data={allTicketsTitle?.data}
                pagination={allTicketsTitle?.pagination}
                gridLoading={isTicketsTitleFetching || isSaving}
                action
                callBack
                editClick={handleEdit}
                deleteClick={handleDelete}
                handlePagination={setPagination}
            />
            <CommanModal
                title={editId ? 'Update Ticket Title' : 'Add Ticket Title'}
                open={isOpenAddModal}
                onDone={handleSubmitTicketTitle}
                onClose={onCloseModal}
            >
                <Form form={form} className='flex flex-col gap-3'>
                    <Form.Item
                        name='title'
                        rules={[{ required: true, message: 'Title is required' }]}
                    >
                        <InputField type='text' placeholder='Enter Ticket Title' />
                    </Form.Item>
                </Form>
            </CommanModal>
        </div>
    )
}

export default TicketsTitle
