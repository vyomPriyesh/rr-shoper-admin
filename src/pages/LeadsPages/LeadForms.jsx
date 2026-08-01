import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import PageTitleAddbtn from '../../utils/PageTitleAddbtn';
import TableUi from '../../utils/TableUi';
import apiList from '../../config/apiList';
import api from '../../config/api';
import { userState } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import InputField from '../../utils/InputField';

const LeadForms = () => {
    const { leadsForms } = apiList();
    const { showToast } = useToast();
    const { user, hasPermission } = userState();
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [editId, setEditId] = useState(null);

    const { data: { data: allLeadForms = [] } = {}, refetch: allLeadFormsRefetch, isFetching: isLeadFormsFetching } = useQuery({
        queryKey: ['all-lead-forms', pagination],
        queryFn: () => api.post(leadsForms.allLeadForms, pagination),
        enabled: !!user,
        select: ({ data }) => data,
    });

    const { mutate: changeStatus, isPending: statusPending } = useMutation({
        mutationFn: (id) => {
            setEditId(id);
            return api.get(leadsForms.updateLeadFormStatus(id));
        },
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            allLeadFormsRefetch();
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    const { mutate: handleDelete } = useMutation({
        mutationFn: ({ _id }) => api.delete(leadsForms.deleteLeadForm(_id)),
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            allLeadFormsRefetch();
        },
        onError: ({ response }) => {
            showToast(response?.data?.error?.error_message || 'Something went wrong', 'error');
        },
    });

    const columns = [
        {
            title: 'lead Title',
            dataIndex: 'leadTitle',
            key: 'leadTitle',
            render: (_, { leadTitle }) => <span className='capitalize'>{leadTitle?.title}</span>,
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

    const canAdd = useMemo(() => hasPermission('lead Forms', false, false, 'add'), [user, hasPermission])

    return (
        <div className='flex flex-col gap-5'>
            <PageTitleAddbtn title='Lead Forms' add={canAdd} addClick={() => navigate('/leads/lead-forms/add')} />
            <TableUi
                module_name='Lead Forms'
                columns={columns}
                data={allLeadForms?.data}
                pagination={allLeadForms?.pagination}
                gridLoading={isLeadFormsFetching || statusPending}
                action
                editClick='/leads/lead-forms/update'
                deleteClick={handleDelete}
                handlePagination={setPagination}
            />
        </div>
    );
};

export default LeadForms;
