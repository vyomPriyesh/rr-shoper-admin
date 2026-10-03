import React, { useEffect, useState } from 'react'
import CommanModal from '../../utils/CommanModal'
import apiList from '../../config/apiList';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userState } from '../../context/UserContext';
import api from '../../config/api';
import { getPackageName } from '../../utils/getPackageName';
import StatusSection from '../../utils/StatusSection';
import { Tabs } from 'antd';
import { FaCheck, FaSave } from 'react-icons/fa';
import { BsCurrencyRupee, BsFillPencilFill } from 'react-icons/bs';
import { MdOutlineCalendarMonth } from 'react-icons/md';
import { IoStopwatchOutline } from 'react-icons/io5';
import { DDMMMYYYYdisplayDate } from '../../utils/DateDisplay';
import { RxCross2 } from 'react-icons/rx';
import InputField from '../../utils/InputField';
import { useToast } from '../../context/ToastContext';

const PackageDetailsModal = ({ subscriptionId, open, onClose }) => {

    const { customers, images } = apiList();
    const { user, options } = userState();
    const { showToast } = useToast();

    const [tabIndex, setTabIndex] = useState('1');
    const [isEditUpdate, setIsEditUpdate] = useState(false);
    const [updates, setUpdates] = useState([]);

    const { data = {}, isFetching: subscriptionDetailsFetching } = useQuery({
        queryKey: ['subscription-details', subscriptionId],
        queryFn: () => api.get(customers.subscriptionDetails(subscriptionId)),
        enabled: !!user && !!subscriptionId,
        select: ({ data }) => {
            const response = data.data.result
            return {
                platform: response?.package_id?.platform?.name,
                platformImg: images.imgUrl + response?.package_id?.platform?.image?.image,
                packageName: response?.package_id?.name,
                services: response?.serviceUpdates,
                status: response?.status,
                amount: '₹ ' + response?.payment_id?.amount,
                purchaseDate: DDMMMYYYYdisplayDate(response?.starts_at),
                expiryDate: DDMMMYYYYdisplayDate(response?.expires_at),
            }
        }
    })

    useEffect(() => {
        if (data?.services) {
            setUpdates(data?.services)
        }
    }, [data?.services])

    const { mutate: handleSaveSericesUpdates, isPending } = useMutation({
        mutationFn: () => api.post(customers.serviceUpdates(subscriptionId), updates),
        onSuccess: ({ data }) => {
            showToast(data.message, 'success');
            setIsEditUpdate(false)
        },
    });

    const Title = () => {
        return (
            <div className="flex flex-row gap-4 items-center">
                <img src={data?.platformImg} alt={data?.platform} className='w-12 h-12 rounded-full' />
                <div className='flex flex-col'>
                    <span className='text-lg font-semibold'>{data?.platform}</span>
                    <span className='text-sm text-gray-500'>{getPackageName(data?.packageName)}</span>
                </div>
                <span className='ms-20'><StatusSection status={data?.status} options={options?.packagesStatuses} /></span>
            </div>
        )
    }

    const handleTabChange = (key) => {
        setTabIndex(key)
    }

    const handleUpdate = (i, value) => {
        setUpdates((prevUpdates) =>
            prevUpdates.map((service, index) =>
                index === i ? { ...service, update: value } : service
            )
        )
    }

    return (
        <CommanModal
            width={800}
            open={open}
            onClose={onClose}
            footer={false}
            title={<Title />}
            styles={{
                body: {
                    padding: 0,
                    padding: '0px 15px',
                },
            }}
        >
            <Tabs
                activeKey={tabIndex}
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${tabIndex === '1' ? ' text-primary' : 'text-gray-600'}`}>Package Details</span>,
                        children: <div className='flex flex-col gap-4'>
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex flex-row items-center justify-between">
                                    <span className='font-medium text-base'>Key Features</span>
                                    <div className="flex flex-row items-center gap-5">
                                        <button
                                            onClick={() => setIsEditUpdate(prev => !prev)}
                                            className={`flex flex-row gap-3 items-center px-4 py-1 border rounded-lg ${isEditUpdate ? 'text-red-500 border-red-500 hover:bg-red-500' : 'text-primary border-primary hover:bg-primary'} hover:text-white transition-all duration-300 ease-out`}>
                                            <span>{isEditUpdate ? <RxCross2 size={20} /> : <BsFillPencilFill />}</span>
                                            <span className='font-medium'>{isEditUpdate ? 'Cancel' : 'Edit'} Updates</span>
                                        </button>
                                        {isEditUpdate &&
                                            <button
                                                onClick={handleSaveSericesUpdates}
                                                className={`flex flex-row gap-3 items-center px-4 py-1 border rounded-lg text-primary border-primary hover:bg-primary hover:text-white transition-all duration-300 ease-out`}>
                                                <span><FaSave size={20} /></span>
                                                <span className='font-medium'>Save Updates</span>
                                            </button>
                                        }
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4">
                                    {updates?.map((service, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm leading-5 text-gray-600"  >
                                            <div className="flex h-5 w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-[#F8EEF3] text-xs text-primary 2xl:h-6 2xl:w-6">
                                                <FaCheck />
                                            </div>
                                            <div className="flex flex-row items-center justify-between gap-5">
                                                <span className="min-w-0 break-words text-nowrap">{service?.name}</span>
                                                {(service?.update && !isEditUpdate) && <span className="min-w-0 break-words bg-secondary/20 text-primary px-3 py-1 rounded-full font-medium">{service?.update}</span>}
                                                {isEditUpdate && <div><InputField onChange={(e) => handleUpdate(index, e.target.value)} className='!w-60' placeholder='Enter Feature Update' value={service?.update} /></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3">
                                <div className="flex flex-row gap-3 items-start">
                                    <span className="text-2xl rounded-full text-white h-12 w-12 bg-primary flex justify-center items-center"><BsCurrencyRupee /></span>
                                    <div className="flex flex-col gap-2">
                                        <span className='font-medium text-neutral-500'>Amount</span>
                                        <span className='font-medium'>{data?.amount}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-3 items-start border-x border-gray-200 px-4">
                                    <span className="text-2xl rounded-full text-white h-12 w-12 bg-primary flex justify-center items-center"><MdOutlineCalendarMonth /></span>
                                    <div className="flex flex-col gap-2">
                                        <span className='font-medium text-neutral-500'>Purchase Date</span>
                                        <span className='font-medium'>{data?.purchaseDate}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-3 items-start ps-4">
                                    <span className="text-3xl rounded-full text-white h-12 w-12 bg-primary flex justify-center items-center"><IoStopwatchOutline /></span>
                                    <div className="flex flex-col gap-2">
                                        <span className='font-medium text-neutral-500'>Expiry Date</span>
                                        <span className='font-medium'>{data?.expiryDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    },
                    // {
                    //     key: '2',
                    //     label: <span className={`px-4 py-1.5 text-base font-medium inline-flex items-center rounded-md ${tabIndex === '2' ? ' text-primary' : 'text-gray-600'}`}>Service Details</span>,
                    // }
                ]}
                onChange={handleTabChange}
            />
        </CommanModal>
    )
}

export default PackageDetailsModal
