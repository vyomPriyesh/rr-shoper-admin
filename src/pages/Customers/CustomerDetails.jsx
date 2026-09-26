import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PageTitleAddbtn from '../../utils/PageTitleAddbtn'
import StatusSection from '../../utils/StatusSection'
import apiList from '../../config/apiList';
import { userState } from '../../context/UserContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useParams } from 'react-router-dom';
import UserAvatar from '../../utils/UserAvatar';
import { IoCall, IoShieldCheckmarkSharp } from 'react-icons/io5';
import { TfiEmail } from 'react-icons/tfi';
import { PiBuildingOfficeFill } from 'react-icons/pi';
import { SlCalender } from 'react-icons/sl';
import { displayDate } from '../../utils/DateDisplay';
import { BsBoxFill, BsFillPencilFill } from 'react-icons/bs';
import CommanModal from '../../utils/CommanModal';
import { useToast } from '../../context/ToastContext';
import { Form } from 'antd';
import InputField from '../../utils/InputField';
import { TbReceiptTax } from 'react-icons/tb';
import { IoBagCheck } from "react-icons/io5";
import { FiClock } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";


const CustomerDetails = () => {

    const { customers, images } = apiList();
    const { user, options, setLoading } = userState();
    const { showToast } = useToast();

    const { id } = useParams();
    const [form] = Form.useForm();
    const [isOpenAddModal, setIsOpenAddModal] = useState(false)

    const { data = {}, isFetching: customerDetailsFetching } = useQuery({
        queryKey: ['customer-detailes', id],
        queryFn: () => api.get(customers.customerDetailes(id)),
        enabled: !!user && !!id,
        select: ({ data }) => data.data.result
    })

    const { mutate: handleCustomerAction, isPending: customerHandlePending } = useMutation({
        mutationFn: async () => {
            const payload = await form.validateFields();
            payload.image = payload?.image?.uid
            const response = await api.post(customers.updateCustomer(id), payload);
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

    const onCloseModal = () => {
        setIsOpenAddModal(false)
        form.resetFields()
    }

    const handleEdit = useCallback(() => {
        setIsOpenAddModal(true)

        form.setFieldsValue({
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            gst_number: data.gst_number,
            image: {
                url: images.imgUrl + data?.image?.image
            },
        })
    }, [data])

    const isLoading = useMemo(() => customerHandlePending || customerDetailsFetching, [customerHandlePending, customerDetailsFetching])

    useEffect(() => {
        if (isLoading == undefined || isLoading == null) return
        setLoading(isLoading)
    }, [isLoading])

    const activePackages = useMemo(() => data?.subscriptions?.filter(list => list.status == 'active'), [data?.subscriptions])
    const expirePackages = useMemo(() => data?.subscriptions?.filter(list => list.status == 'expired'), [data?.subscriptions])

    const statictics = useMemo(() => {
        return [
            {
                icon: BsBoxFill,
                label: 'Total Packages',
                value: data?.subscriptions?.length,
                bgClass: 'bg-red-500/20',
                textClass: 'text-red-500',
            },
            {
                icon: IoBagCheck,
                label: 'Active Packages',
                value: activePackages?.length,
                bgClass: 'bg-green-500/20',
                textClass: 'text-green-500',
            },
            {
                icon: FiClock,
                label: 'Expired Packages',
                value: expirePackages?.length,
                bgClass: 'bg-yellow-500/20',
                textClass: 'text-yellow-500',
            },
            {
                icon: MdOutlinePayment,
                label: 'Total Payments',
                value: data?.subscriptions?.reduce((total, subscription) => total + (subscription?.payment_id?.amount || 0), 0),
                bgClass: 'bg-purple-500/20',
                textClass: 'text-purple-500',
            },
        ]
    }, [activePackages, expirePackages, data?.subscriptions])

    return (
        <div className='flex flex-col gap-5'>
            <div className="bg-white p-5 rounded-lg">
                <PageTitleAddbtn title={'Customer Details'} displayStatus={<StatusSection status={data?.status} options={options?.userAccountStatuses} />} />
            </div>
            <div className="bg-white p-5 rounded-lg flex md:flex-row flex-col justify-between gap-5">
                <div className="flex flex-row gap-8 items-center">
                    <UserAvatar image={data?.image?.image} name={data?.name} isLoading={customerDetailsFetching} className='2xl:h-40 2xl:w-40 md:h-24 md:w-24 w-20 h-20 rounded-full object-cover' />
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-5 items-center">
                            <span className='text-lg font-medium capitalize'>{data?.name}</span>
                            {data?.otp_status == 'verified' && <span className='text-primary text-xl'><IoShieldCheckmarkSharp /></span>}
                        </div>
                        <DetailwithIcon icon={<TfiEmail />} value={data.email} />
                        <DetailwithIcon icon={<IoCall />} value={data.mobile} />
                        <DetailwithIcon icon={<PiBuildingOfficeFill />} value={data.email} />
                        <DetailwithIcon icon={<TbReceiptTax />} value={data.gst_number} />
                        <DetailwithIcon icon={<SlCalender />} value={`Joined on ${displayDate(data?.createdAt)}`} />
                    </div>
                </div>
                <div className="flex flex-row items-start">
                    <button onClick={handleEdit} className='flex flex-row gap-3 items-center px-4 py-2 border-2 text-primary border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 ease-out'>
                        <span><BsFillPencilFill /></span>
                        <span className='font-medium'>Edit Details</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-5">
                {statictics?.map((list, i) => (
                    <div key={i} className="bg-white p-5 flex flex-row gap-4 rounded-lg">
                        <span className={`text-3xl ${list.bgClass} ${list.textClass} h-14 w-14 flex justify-center items-center rounded-full`}>
                            <list.icon />
                        </span>
                        <div className="flex flex-col">
                            <span className='font-medium'>{list.label}</span>
                            <span className='font-medium text-lg'>{list.value}</span>
                        </div>
                    </div>
                ))}
            </div>
            <CommanModal title='Update Custmers' open={isOpenAddModal} onDone={handleCustomerAction} onClose={onCloseModal}>
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
                    <Form.Item name='gst_number' rules={[{ required: true, message: 'GST Number is required' }]}>
                        <InputField type='text' placeholder='Enter GST Number' />
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

const DetailwithIcon = ({ icon, value }) => {
    return (
        <div className="flex flex-row gap-5 items-center">
            <span className='text-xl'>{icon}</span>
            <span className='text-sm capitalize'>{value}</span>
        </div>
    )
}

export default CustomerDetails
