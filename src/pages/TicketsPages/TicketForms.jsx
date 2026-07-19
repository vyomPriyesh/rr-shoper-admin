import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageTitleAddbtn from '../../utils/PageTitleAddbtn';
import TableUi from '../../utils/TableUi';
import apiList from '../../config/apiList';
import api from '../../config/api';
import { userState } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import InputField from '../../utils/InputField';

const TicketForms = () => {
    const { tickets } = apiList();
    const { showToast } = useToast();
    const { user, hasPermission } = userState();
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [editId, setEditId] = useState(null);

    const { data: { data: allTicketForms = [] } = {}, refetch: allTicketFormsRefetch, isFetching: isTicketFormsFetching } = useQuery({
        queryKey: ['all-ticket-forms', pagination],
        queryFn: () => api.post(tickets.allTicketForms, pagination),
        enabled: !!user,
        select: ({ data }) => data,
    });

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id);
            return api.get(tickets.updateTicketFormStatus(id));
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            allTicketFormsRefetch();
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(tickets.deleteTicketForm(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            allTicketFormsRefetch();
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    const columns = [
        {
            title: 'Ticket Title',
            dataIndex: 'ticketTitle',
            key: 'ticketTitle',
            render: (_, { ticketTitle }) => <span className='capitalize'>{ticketTitle.title}</span>,
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
    ];

    const handleAdd = () => {
        const canAdd = hasPermission('Tickets Forms', true, false, 'add')
        if (canAdd) {
            navigate('/tickets-forms/add')
        }
    }

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Tickets Forms' add addClick={handleAdd} />
            <TableUi
                module_name='Tickets Forms'
                columns={columns}
                data={allTicketForms?.data}
                pagination={allTicketForms?.pagination}
                gridLoading={isTicketFormsFetching || statusPending}
                action
                editClick='/tickets-forms/update'
                deleteClick={handleDelete}
                handlePagination={setPagination}
            />
        </div>
    );
};

export default TicketForms;
