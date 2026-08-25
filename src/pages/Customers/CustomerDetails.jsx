import React from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import StatusSection from '../../utils/StatusSection'
import apiList from '../../config/apiList';
import { userState } from '../../context/UserContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useParams } from 'react-router-dom';

const CustomerDetails = () => {

    const { customers, images } = apiList();
    const { user } = userState();

    const { id } = useParams();

    const { data, isFetching: customerDetailsFetching } = useQuery({
        queryKey: ['customer-detailes', id],
        queryFn: () => api.get(customers.customerDetailes(id)),
        enabled: !!user && !!id,
        select: ({ data }) => data
    })

    console.log(data)

    return (
        <div className='flex flex-col gap-5'>
            <div className="bg-white p-5 rounded-lg">
                <PageTitleAddbtn title={'Customer Details'} displayStatus={<StatusSection />} />
            </div>
        </div>
    )
}

export default CustomerDetails
